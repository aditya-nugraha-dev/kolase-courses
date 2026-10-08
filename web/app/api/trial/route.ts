// /api/trial — Trial 7 sesi gratis → keputusan lanjut/berhenti → checkout Kids.
// GET: murid lihat trial miliknya; admin filter ?student_id=&status=.
// POST {student_id?, class_id?}: mulai trial (idempoten: 1 STARTED per murid).
// PATCH {trial_id, sessions_delivered}: progres oleh guru/admin (7 = COMPLETED).
// PATCH {trial_id, action: lanjut|berhenti}: keputusan murid setelah sesi 7.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ADMIN_ROLES, APPROVER_ROLES } from "@/lib/session";
import {
  checkRateLimit,
  getClientIp,
  logServerError,
  safeErrorMessage,
  sanitizeString,
} from "@/lib/security";
import {
  trialCreateServerSchema,
  trialDecisionServerSchema,
  trialProgressServerSchema,
} from "@/lib/schemas";

const KIDS_CLASS_DEFAULT = "CLS-PUB-KIDS-01";
const KIDS_PROGRAM = "Little Speakers (Kids)";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`trial-list:${ip}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const url = new URL(req.url);
    const isAdmin = ADMIN_ROLES.includes(s.role);
    const studentId = isAdmin
      ? (url.searchParams.get("student_id") ?? "").trim() || undefined
      : s.role === "student"
        ? s.sub
        : undefined;
    if (!studentId && !isAdmin) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      let query = sb.from("trials").select("*").order("created_at", { ascending: false }).limit(50);
      if (studentId) query = query.eq("student_id", studentId);
      const status = (url.searchParams.get("status") ?? "").trim();
      if (status && isAdmin) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, source: "db", rows: data ?? [] });
    } catch (e) {
      logServerError("trial-list-db", e);
      return NextResponse.json({ ok: true, source: "empty", rows: [] });
    }
  } catch (e) {
    logServerError("trial-list", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`trial-start:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = trialCreateServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    const isAdmin = ADMIN_ROLES.includes(s.role);
    let studentId = sanitizeString(parsed.data.student_id, 16);
    if (s.role === "student") {
      if (studentId && studentId !== s.sub) {
        return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
      }
      studentId = s.sub;
    } else if (!isAdmin) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    if (!studentId) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const classId = sanitizeString(parsed.data.class_id, 32) || KIDS_CLASS_DEFAULT;

    const { supabaseServer } = await import("@/lib/supabase");
    const { nextId } = await import("@/lib/ids");
    const sb = supabaseServer();

    const { data: cls } = await sb.from("classes").select("id").eq("id", classId).maybeSingle();
    if (!cls) return NextResponse.json({ ok: false, error: `Kelas ${classId} tidak ditemukan` }, { status: 404 });

    // Idempoten: 1 trial STARTED per murid — kembalikan yang ada.
    const { data: active } = await sb
      .from("trials")
      .select("trial_id,class_id,status,sessions_delivered")
      .eq("student_id", studentId)
      .eq("status", "STARTED")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (active) return NextResponse.json({ ok: true, existing: true, ...(active as Record<string, unknown>) });

    const trialId = await nextId(sb, "trials", "trial_id", "TRL");
    const { error } = await sb.from("trials").insert({
      trial_id: trialId,
      student_id: studentId,
      class_id: classId,
      status: "STARTED",
      sessions_delivered: 0,
    });
    if (error) throw new Error(error.message);
    try {
      await sb.from("audit_log").insert({
        actor: s.sub,
        action: "TRIAL_START",
        object_type: "TRIAL",
        object_id: trialId,
        reason: "7 sesi gratis",
        meta: { student_id: studentId, class_id: classId },
      });
    } catch { /* best-effort */ }
    return NextResponse.json({ ok: true, trial_id: trialId, class_id: classId, sessions_delivered: 0 });
  } catch (e) {
    logServerError("trial-start", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : safeErrorMessage(500) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`trial-patch:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // Cabang keputusan murid: {trial_id, action}
    if (typeof raw.action === "string") {
      return handleDecision(s, raw);
    }
    // Cabang progres: {trial_id, sessions_delivered} — guru/admin saja.
    if (!ADMIN_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const parsed = trialProgressServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const done = parsed.data.sessions_delivered >= 7;
    const patch: Record<string, unknown> = {
      sessions_delivered: Math.min(7, parsed.data.sessions_delivered),
    };
    if (done) {
      patch.status = "COMPLETED";
      patch.completed_at = new Date().toISOString();
    }
    const { error } = await sb.from("trials").update(patch).eq("trial_id", parsed.data.trial_id).eq("status", "STARTED");
    if (error) throw new Error(error.message);
    try {
      await sb.from("audit_log").insert({
        actor: s.sub,
        action: done ? "TRIAL_COMPLETE" : "TRIAL_PROGRESS",
        object_type: "TRIAL",
        object_id: parsed.data.trial_id,
        reason: `sesi ${patch.sessions_delivered}/7`,
        meta: {},
      });
    } catch { /* best-effort */ }
    return NextResponse.json({ ok: true, trial_id: parsed.data.trial_id, completed: done, sessions_delivered: patch.sessions_delivered });
  } catch (e) {
    logServerError("trial-patch", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : safeErrorMessage(500) }, { status: 500 });
  }
}

async function handleDecision(
  s: { role: string; sub: string },
  raw: Record<string, unknown>
) {
  const parsed = trialDecisionServerSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
  const { supabaseServer } = await import("@/lib/supabase");
  const sb = supabaseServer();

  const { data: trial } = await sb.from("trials").select("*").eq("trial_id", parsed.data.trial_id).single();
  if (!trial) return NextResponse.json({ ok: false, error: safeErrorMessage(404) }, { status: 404 });
  const t = trial as Record<string, unknown>;
  const owner = String(t.student_id ?? "");

  const canDecide =
    owner === s.sub || (APPROVER_ROLES as readonly string[]).includes(s.role);
  if (!canDecide) return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });

  if (parsed.data.action === "berhenti") {
    if (t.status !== "STARTED" && t.status !== "COMPLETED") {
      return NextResponse.json({ ok: false, error: `Trial sudah ${t.status}` }, { status: 409 });
    }
    await sb.from("trials").update({ status: "DROPPED" }).eq("trial_id", parsed.data.trial_id);
    try {
      await sb.from("audit_log").insert({
        actor: s.sub, action: "TRIAL_DROP", object_type: "TRIAL",
        object_id: parsed.data.trial_id, reason: "murid memilih berhenti", meta: {},
      });
    } catch { /* best-effort */ }
    return NextResponse.json({ ok: true, trial_id: parsed.data.trial_id, status: "DROPPED" });
  }

  // action === "lanjut": trial harus COMPLETED (7/7), lalu buatkan checkout Kids.
  if (t.status !== "COMPLETED") {
    return NextResponse.json({ ok: false, error: "Selesaikan dulu 7 sesi gratis sebelum lanjut" }, { status: 409 });
  }
  // Kelas target: kelas trial bila masih ada, else default Kids.
  let targetClass = String(t.class_id ?? KIDS_CLASS_DEFAULT);
  const { data: clsRow } = await sb
    .from("classes")
    .select("id,harga,kuota,kategori,sesi_count,class_status")
    .eq("id", targetClass)
    .maybeSingle();
  if (!clsRow) {
    targetClass = KIDS_CLASS_DEFAULT;
    const { data: kids } = await sb
      .from("classes")
      .select("id,harga,kuota,kategori,sesi_count,class_status")
      .eq("id", targetClass)
      .maybeSingle();
    if (!kids) return NextResponse.json({ ok: false, error: `Kelas ${targetClass} tidak ditemukan` }, { status: 404 });
  }
  const cls = (clsRow ?? (await sb.from("classes").select("*").eq("id", targetClass).maybeSingle()).data) as Record<string, unknown> | null;
  if (!cls) return NextResponse.json({ ok: false, error: `Kelas ${targetClass} tidak ditemukan` }, { status: 404 });
  if ((cls.class_status || "OPEN") !== "OPEN") {
    return NextResponse.json({ ok: false, error: `Kelas belum dibuka (status ${cls.class_status})` }, { status: 403 });
  }

  // Sudah punya membership? ACTIVE → langsung ke kelas; PENDING → pakai TXN lama.
  const { data: existing } = await sb
    .from("class_membership")
    .select("enrollment_id,status")
    .eq("student_id", owner)
    .eq("class_id", targetClass)
    .in("status", ["PENDING", "ACTIVE"])
    .order("activated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (existing) {
    const ex = existing as Record<string, unknown>;
    if (ex.status === "ACTIVE") {
      return NextResponse.json({ ok: true, already: "active", class_id: targetClass, enrollment_id: ex.enrollment_id });
    }
    const { data: oldPay } = await sb
      .from("txn_payments")
      .select("trx_id,nominal")
      .eq("enrollment_id", String(ex.enrollment_id))
      .eq("status", "PENDING")
      .order("tgl", { ascending: false })
      .limit(1)
      .maybeSingle();
    return NextResponse.json({
      ok: true, already: "pending", class_id: targetClass,
      enrollment_id: ex.enrollment_id,
      trx_id: (oldPay as Record<string, unknown> | null)?.trx_id ?? null,
      nominal: Number(cls.harga ?? 0), program: KIDS_PROGRAM,
    });
  }

  // Kapasitas seperti /api/checkout.
  const { count } = await sb.from("class_membership").select("enrollment_id", { count: "exact", head: true }).eq("class_id", targetClass).in("status", ["PENDING", "ACTIVE"]);
  const isPublic = (cls.kategori ?? "PUBLIC") === "PUBLIC" || targetClass.startsWith("CLS-PUB-");
  const cap = isPublic ? Math.min(Number(cls.kuota ?? 50), 50) : Math.min(Number(cls.kuota ?? 5), 5);
  if ((count ?? 0) >= cap) {
    return NextResponse.json({ ok: false, error: `Kelas penuh (${count}/${cap})` }, { status: 409 });
  }

  const { nextId, nextTxnId } = await import("@/lib/ids");
  const enrollmentId = await nextId(sb, "class_membership", "enrollment_id", "ENR");
  const trxId = await nextTxnId(sb);
  const method = sanitizeString(parsed.data.method, 32) || "QRIS";
  const nominal = Number(cls.harga ?? 0);
  const { error: pErr } = await sb.from("txn_payments").insert({
    trx_id: trxId, enrollment_id: enrollmentId, student_id: owner,
    class_id: targetClass, nominal, method, status: "PENDING",
  });
  if (pErr) throw new Error(pErr.message);
  const { error: mErr } = await sb.from("class_membership").insert({
    enrollment_id: enrollmentId, student_id: owner, class_id: targetClass,
    status: "PENDING", sisa: 0, trial_id: parsed.data.trial_id, trial_credit_applied: false,
  });
  if (mErr) throw new Error(mErr.message);
  try {
    await sb.from("audit_log").insert({
      actor: s.sub, action: "TRIAL_CONVERT_CHECKOUT", object_type: "TRIAL",
      object_id: parsed.data.trial_id, reason: "lanjut ke Kids",
      meta: { enrollment_id: enrollmentId, trx_id: trxId, class_id: targetClass },
    });
  } catch { /* best-effort */ }
  return NextResponse.json({
    ok: true, trial_id: parsed.data.trial_id, class_id: targetClass,
    enrollment_id: enrollmentId, trx_id: trxId, nominal, program: KIDS_PROGRAM, method,
  });
}
