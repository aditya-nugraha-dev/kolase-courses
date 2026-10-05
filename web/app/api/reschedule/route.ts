// POST /api/reschedule — GForm 04_TEACHER_REQUEST_RESCHEDULE (teacher|admin only).
// GET — daftar untuk admin|teacher.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { postSheets } from "@/lib/sheets";
import { rescheduleServerSchema } from "@/lib/schemas";
import {
  checkRateLimit,
  csrfTokensMatch,
  extractCsrfToken,
  getClientIp,
  isHoneypotFilled,
  logServerError,
  safeErrorMessage,
  sanitizeObject,
  sanitizeString,
} from "@/lib/security";
import { CSRF_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`reschedule:${ip}`);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }
  try {
    const s = await getSession();
    if (!s || !["admin", "teacher"].includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    if (isHoneypotFilled(raw)) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const cookieToken = req.headers.get("cookie")?.match(new RegExp(`${CSRF_COOKIE}=([^;]+)`))?.[1] ?? null;
    const { header, bodyToken } = extractCsrfToken(req, raw);
    const presented = header ?? bodyToken;
    if (!cookieToken || !presented || !csrfTokensMatch(cookieToken, presented)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const parsed = rescheduleServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const b = sanitizeObject({ ...parsed.data } as Record<string, unknown>);
    const row = {
      class_id: sanitizeString(b.classId, 32),
      lama: sanitizeString(b.lama, 120),
      baru: sanitizeString(b.baru, 120),
      alasan: sanitizeString(b.alasan, 200),
      status: "PENDING",
      requested_by: s.sub,
    };
    let saved: Record<string, unknown> | null = null;
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { data, error } = await sb.from("reschedule_requests").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      saved = (data ?? null) as Record<string, unknown> | null;
    } catch (e) {
      logServerError("reschedule-db", e);
    }
    const sheets = await postSheets({ action: "reschedule_request", row });
    return NextResponse.json({ ok: true, id: saved?.id ?? null, sheets });
  } catch (e) {
    logServerError("reschedule", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`reschedule-list:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !["admin", "teacher"].includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { data, error } = await sb.from("reschedule_requests").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, source: "db", rows: data });
    } catch (e) {
      logServerError("reschedule-list-db", e);
      return NextResponse.json({ ok: true, source: "empty", rows: [] });
    }
  } catch (e) {
    logServerError("reschedule-list", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

// PATCH /api/reschedule {id, status} — approval (admin only).
export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`reschedule-approve:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || s.role !== "admin") {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const id = Number(raw.id);
    const status = String(raw.status ?? "");
    if (!Number.isInteger(id) || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    }
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { error } = await sb.from("reschedule_requests").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    } catch (e) {
      logServerError("reschedule-approve-db", e);
      return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
    }
    const sheets = await postSheets({ action: "reschedule_approve", id, status });
    return NextResponse.json({ ok: true, sheets });
  } catch (e) {
    logServerError("reschedule-approve", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
