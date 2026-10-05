// POST /api/webhook {trx_id, trial_id?} — simulasi callback gateway (PENDING -> VERIFIED).
// Production: ganti dengan verifikasi signature Midtrans/Xendit lalu panggil logika yang sama.
// CORE lama (BP-001): tanpa trial +15/15 sesi, dengan trial +15-7=8 sesi.
// PUBLIC CLASS 2026-09-15: 4 sesi @60 mnt, tanpa kredit trial, validity 1 bulan (Docs KOL-AKD-KID-001).
// BP-011: idempotent (cek VERIFIED + cek sesi/ledger existing), audit append-only, Calendar proyeksi saja.
// Grain kanonikal KOL-POL-COD-001 §3.3: SES-XXXXXX per jadwal KELAS (class_sessions) — dasar absensi & honor.
// Tabel sessions per-enrollment dipertahankan sebagai proyeksi kompatibilitas UI.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { nextId } from "@/lib/ids";
import { postSheets } from "@/lib/sheets";
import { createSessionEvents } from "@/lib/calendar";

export async function POST(req: Request) {
  try {
    const { trx_id, trial_id } = await req.json();
    if (!trx_id) return NextResponse.json({ ok: false, error: "trx_id wajib" }, { status: 400 });
    const sb = supabaseServer();
    const { data: pay, error } = await sb.from("txn_payments").select("*").eq("trx_id", trx_id).single();
    if (error || !pay) return NextResponse.json({ ok: false, error: "TXN tidak ditemukan" }, { status: 404 });
    if (pay.status === "VERIFIED") return NextResponse.json({ ok: true, idempotent: true, enrollment_id: pay.enrollment_id });

    const now = new Date().toISOString();
    // Idempotency hardening: jika sesi/ledger sudah ada (retry setelah partial failure), jangan grant ulang.
    const { count: sesCount } = await sb.from("sessions").select("session_id", { count: "exact", head: true }).eq("enrollment_id", pay.enrollment_id);
    const { count: grantCount } = await sb.from("txn_entitlement_ledger").select("id", { count: "exact", head: true }).eq("enrollment_id", pay.enrollment_id).eq("reason", "PAYMENT_VERIFIED");
    if ((sesCount ?? 0) > 0 || (grantCount ?? 0) > 0) {
      return NextResponse.json({ ok: true, idempotent: true, enrollment_id: pay.enrollment_id, note: "sesi/ledger sudah ada, grant dilewati (anti double-grant BP-011)" });
    }
    // Cari trial COMPLETED untuk kredit exactly-once (hanya CORE; PUBLIC tanpa trial).
    // Deteksi PUBLIC via class_id CLS-PUB-* atau kategori.
    let isPublic = String(pay.class_id || "").startsWith("CLS-PUB-");
    let sesiCount = 15;
    let durationMin = 90;
    try {
      const { data: clsRow } = await sb.from("classes").select("kategori,sesi_count,duration_minutes").eq("id", pay.class_id).single();
      if (clsRow) {
        if ((clsRow.kategori ?? "") === "PUBLIC") isPublic = true;
        if (clsRow.sesi_count) sesiCount = Number(clsRow.sesi_count) || (isPublic ? 4 : 15);
        if (clsRow.duration_minutes) durationMin = Number(clsRow.duration_minutes) || (isPublic ? 60 : 90);
      } else if (isPublic) { sesiCount = 4; durationMin = 60; }
    } catch { if (isPublic) { sesiCount = 4; durationMin = 60; } }
    let trial: { trial_id: string } | null = null;
    let withTrial = false;
    let sisa = isPublic ? sesiCount : 15;
    if (!isPublic) {
    try {
      if (trial_id) {
        const { data: t } = await sb.from("trials").select("trial_id,status,student_id,class_id").eq("trial_id", trial_id).single();
        if (t && t.status === "COMPLETED" && t.student_id === pay.student_id && t.class_id === pay.class_id) trial = t;
        else if (t) return NextResponse.json({ ok: false, error: "trial_id tidak COMPLETED / tidak cocok student+class" }, { status: 409 });
      } else {
        const { data: ts } = await sb.from("trials").select("trial_id").eq("student_id", pay.student_id).eq("class_id", pay.class_id).eq("status", "COMPLETED").order("created_at", { ascending: false }).limit(1);
        if (ts && ts.length > 0) trial = ts[0];
      }
    } catch { trial = null; /* tabel trials belum ada di DB lama = beli langsung */ }
    withTrial = Boolean(trial);
    sisa = withTrial ? 8 : 15; // P15: 15-7=8; langsung: 15
    }
    const nSes = sisa;
    await sb.from("txn_payments").update({ status: "VERIFIED", tgl_verifikasi: now }).eq("trx_id", trx_id);
    // Validity: PUBLIC 1 bulan (4 sesi), CORE P15 2 bulan.
    const exp = new Date(); exp.setMonth(exp.getMonth() + (isPublic ? 1 : 2));
    const expires_at = exp.toISOString().slice(0, 10);
    const membershipPatch: Record<string, unknown> = { status: "ACTIVE", sisa, activated_at: now, expires_at, trial_credit_applied: withTrial };
    if (trial) membershipPatch.trial_id = trial.trial_id;
    await sb.from("class_membership").update(membershipPatch).eq("enrollment_id", pay.enrollment_id);

    // Sesi kanonikal per KELAS: lengkapi seq yang belum ada (idempoten per class+seq).
    const { data: existing } = await sb.from("class_sessions").select("seq").eq("class_id", pay.class_id);
    const have = new Set((existing ?? []).map((r) => r.seq));
    const newClassSessions = [];
    for (let i = 1; i <= nSes; i++) {
      if (have.has(i)) continue;
      const d = new Date(); d.setDate(d.getDate() + (i - 1) * 7);
      const row = {
        session_id: await nextId(sb, "class_sessions", "session_id", "SES"),
        class_id: pay.class_id, seq: i,
        tanggal: d.toISOString().slice(0, 10), status: "SCHEDULED",
      };
      // Insert per baris agar nomor SES berikutnya naik (idempoten per class+seq bila retry)
      const { error: csErr } = await sb.from("class_sessions").insert(row);
      if (csErr) throw new Error(csErr.message);
      newClassSessions.push(row);
    }
    // Proyeksi kompatibilitas per-enrollment (UI lama + tab SESSIONS Sheets).
    const sessions = Array.from({ length: nSes }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i * 7);
      return {
        session_id: `SES-${String(i + 1).padStart(6, "0")}-${pay.enrollment_id}`,
        enrollment_id: pay.enrollment_id, seq: i + 1,
        tanggal: d.toISOString().slice(0, 10), status: "SCHEDULED", hadir: null,
      };
    });
    const { error: sErr } = await sb.from("sessions").insert(sessions);
    if (sErr) throw new Error(sErr.message);
    const grant = isPublic ? nSes : 15;
    const ledger = { enrollment_id: pay.enrollment_id, student_id: pay.student_id, delta: grant, reason: "PAYMENT_VERIFIED", at: now, balance_after: sisa };
    const { error: lErr } = await sb.from("txn_entitlement_ledger").insert(ledger);
    if (lErr) throw new Error(lErr.message);
    let ledger2: Record<string, unknown> | null = null;
    if (trial) {
      ledger2 = { enrollment_id: pay.enrollment_id, student_id: pay.student_id, delta: -7, reason: "TRIAL_RECOGNITION", at: now, balance_after: sisa };
      const { error: l2Err } = await sb.from("txn_entitlement_ledger").insert(ledger2);
      if (l2Err) throw new Error(l2Err.message);
      try { await sb.from("trials").update({ status: "CONVERTED" }).eq("trial_id", trial.trial_id); } catch { /* abaikan */ }
    }
    // BP-011 DEC-008 audit (best-effort; jangan gagalkan verify bila tabel audit belum ada di DB lama).
    try { await sb.from("audit_log").insert({ actor: "webhook", action: "VERIFY", object_type: "PAYMENT", object_id: trx_id, reason: withTrial ? "PAYMENT_VERIFIED+TRIAL_RECOGNITION" : "PAYMENT_VERIFIED", meta: { enrollment_id: pay.enrollment_id, expires_at, trial_id: trial?.trial_id ?? null, sisa } }); } catch { /* abaikan */ }

    const sheets = await postSheets({
      action: "verify",
      payment: { trx_id },
      membership: { enrollment_id: pay.enrollment_id, sisa, activated_at: now, expires_at, trial_id: trial?.trial_id ?? null, trial_credit_applied: withTrial },
      sessions: sessions.map((s) => ({ ...s, hadir: "" })),
      class_sessions: newClassSessions,
      ledger,
      ledger2,
    });

    // Google Calendar: event per SESI KELAS yang baru dibuat + undang siswa (lihat google-calendar/CALENDAR_SETUP.txt).
    // TODO: undang guru juga — tambah kolom classes.teacher_email lalu teruskan sebagai teacherEmail.
    const { data: stu } = await sb.from("mst_students").select("email").eq("student_id", pay.student_id).single();
    const { data: cls } = await sb.from("classes").select("nama,meet,duration_minutes").eq("id", pay.class_id).single();
    const calendar = await createSessionEvents({
      sessions: newClassSessions.map((s) => ({ seq: s.seq, tanggal: s.tanggal })),
      refId: pay.class_id,
      className: cls?.nama ?? pay.class_id,
      studentEmail: stu?.email,
      meetUrl: cls?.meet || undefined,
      durationMin: durationMin,
    });
    return NextResponse.json({ ok: true, enrollment_id: pay.enrollment_id, sessions: nSes, class_sessions: newClassSessions.length, sisa, withTrial, trial_id: trial?.trial_id ?? null, expires_at, renewal_due_at_sisa_3: true, sheets, calendar });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
