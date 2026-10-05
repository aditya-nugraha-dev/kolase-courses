// POST /api/attendance {session_id, student_id?, hadir, recorded_by?}
// Absensi kanonikal KOL-POL-COD-001 §3.3 + SOP-CLS: 1 baris per (SES-XXXXXX kelas, STU).
// session_id boleh SES-XXXXXX (kanonikal, wajib sertakan student_id) atau
// SES-XXXXXX-ENR-XXXXXX (legacy, student diambil dari enrollment).
// PRESENT/LATE/STUDENT_NO_SHOW/STUDENT_CANCELLED_LATE (+legacy ABSENT) -> ledger -1;
// VALID_STUDENT_CANCEL (izin min 6 jam, SOP-CLS)/TEACHER_CANCELLED/ACADEMY_CANCELLED/RESCHEDULED (+legacy CANCELLED) -> 0.
// JANGAN sembunyikan negative balance dengan MAX(0); negatif = integrity exception.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { postSheets } from "@/lib/sheets";

export async function POST(req: Request) {
  try {
    const { session_id, student_id, hadir, recorded_by } = await req.json();
    const DEDUCT = ["PRESENT", "LATE", "STUDENT_NO_SHOW", "STUDENT_CANCELLED_LATE", "ABSENT"];
    const NO_DEDUCT = ["VALID_STUDENT_CANCEL", "TEACHER_CANCELLED", "ACADEMY_CANCELLED", "RESCHEDULED", "CANCELLED"];
    if (!session_id || ![...DEDUCT, ...NO_DEDUCT].includes(hadir))
      return NextResponse.json({ ok: false, error: "session_id & hadir valid wajib" }, { status: 400 });
    const sb = supabaseServer();

    // Resolusi sesi kanonikal + siswa
    let cs: { session_id: string; class_id: string; seq: number } | null = null;
    let sid: string | null = student_id ? String(student_id) : null;
    let enrollment_id: string | null = null;
    const legacy = await sb.from("sessions").select("*").eq("session_id", session_id).maybeSingle();
    if (legacy.data) {
      const s = legacy.data;
      if (s.hadir) return NextResponse.json({ ok: false, error: "Sesi sudah dicatat" }, { status: 409 });
      const { data: m } = await sb.from("class_membership").select("*").eq("enrollment_id", s.enrollment_id).single();
      if (!m) return NextResponse.json({ ok: false, error: "Enrollment tidak ditemukan" }, { status: 404 });
      sid = sid || m.student_id;
      if (sid !== m.student_id) return NextResponse.json({ ok: false, error: "student_id tidak cocok enrollment" }, { status: 409 });
      enrollment_id = m.enrollment_id;
      const { data: c } = await sb.from("class_sessions").select("session_id,class_id,seq").eq("class_id", m.class_id).eq("seq", s.seq).single();
      if (!c) return NextResponse.json({ ok: false, error: "Sesi kelas (SES-XXXXXX) belum dibuat untuk seq ini" }, { status: 409 });
      cs = c;
    } else {
      const { data: c, error } = await sb.from("class_sessions").select("session_id,class_id,seq").eq("session_id", session_id).single();
      if (error || !c) return NextResponse.json({ ok: false, error: "Sesi tidak ditemukan" }, { status: 404 });
      if (!sid) return NextResponse.json({ ok: false, error: "student_id wajib untuk SES-XXXXXX" }, { status: 400 });
      const { data: m } = await sb.from("class_membership").select("*").eq("student_id", sid).eq("class_id", c.class_id).eq("status", "ACTIVE").maybeSingle();
      if (!m) return NextResponse.json({ ok: false, error: "Siswa belum aktif di kelas ini" }, { status: 409 });
      enrollment_id = m.enrollment_id;
      cs = c;
    }

    // Idempotency per (sesi, siswa)
    const { data: dup } = await sb.from("session_attendance").select("session_id").eq("session_id", cs.session_id).eq("student_id", sid).maybeSingle();
    if (dup) return NextResponse.json({ ok: false, error: "Absensi siswa ini sudah dicatat" }, { status: 409 });

    const status = hadir === "CANCELLED" || hadir === "VALID_STUDENT_CANCEL" || hadir === "TEACHER_CANCELLED" || hadir === "ACADEMY_CANCELLED" ? "CANCELLED" : hadir === "RESCHEDULED" ? "RESCHEDULED" : "DONE";
    await sb.from("session_attendance").insert({ session_id: cs.session_id, student_id: sid, hadir, recorded_by: recorded_by ?? "teacher" });
    await sb.from("class_sessions").update({ status }).eq("session_id", cs.session_id);
    if (legacy.data) await sb.from("sessions").update({ hadir, status }).eq("session_id", legacy.data.session_id);

    let sisa: number | null = null;
    let ledger: Record<string, unknown> | null = null;
    if (DEDUCT.includes(hadir)) {
      const { data: m } = await sb.from("class_membership").select("sisa,student_id").eq("enrollment_id", enrollment_id).single();
      const cur = m?.sisa ?? 0;
      const next = cur - 1;
      if (next < 0) return NextResponse.json({ ok: false, error: `integrity exception: sisa akan negatif (${cur}-1). Tolak pencatatan, rekonsiliasi ledger dulu (BP-011).` }, { status: 409 });
      sisa = next;
      await sb.from("class_membership").update({ sisa }).eq("enrollment_id", enrollment_id);
      ledger = { enrollment_id, student_id: sid, delta: -1, reason: `ATTENDANCE_${hadir}_${cs.seq}`, at: new Date().toISOString(), balance_after: sisa };
      await sb.from("txn_entitlement_ledger").insert(ledger);
    } else {
      const { data: m } = await sb.from("class_membership").select("sisa").eq("enrollment_id", enrollment_id).single();
      sisa = m?.sisa ?? null;
    }
    try { await sb.from("audit_log").insert({ actor: recorded_by ?? "teacher", action: "ATTENDANCE", object_type: "SESSION", object_id: cs.session_id, reason: hadir, meta: { enrollment_id, student_id: sid, sisa } }); } catch { /* abaikan bila tabel belum ada */ }
    const sheets = await postSheets({ action: "attendance", session_id: legacy.data?.session_id ?? cs.session_id, hadir, status, enrollment_id, sisa, ledger, class_session_id: cs.session_id, student_id: sid, recorded_by: recorded_by ?? "teacher" });
    const renewal_due = sisa !== null && sisa <= 3;
    return NextResponse.json({ ok: true, class_session_id: cs.session_id, sisa, renewal_due, sheets });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
