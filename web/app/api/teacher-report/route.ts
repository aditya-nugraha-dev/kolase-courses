// POST /api/teacher-report — GForm 03_TEACHER_REPORT (teacher|admin only).
// GET — daftar untuk admin|teacher.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { postSheets } from "@/lib/sheets";
import { teacherReportServerSchema } from "@/lib/schemas";
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
  const rl = checkRateLimit(`teacher-report:${ip}`);
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
    const parsed = teacherReportServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const b = sanitizeObject({ ...parsed.data } as Record<string, unknown>);
    const row = {
      class_id: sanitizeString(b.classId, 32),
      tanggal: sanitizeString(b.tanggal, 10) || null,
      materi: sanitizeString(b.materi, 200),
      hadir: sanitizeString(b.hadir, 32),
      catatan: sanitizeString(b.catatan, 2000),
      reported_by: s.sub,
    };
    let saved: Record<string, unknown> | null = null;
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { data, error } = await sb.from("teacher_reports").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      saved = (data ?? null) as Record<string, unknown> | null;
    } catch (e) {
      logServerError("teacher-report-db", e);
    }
    const sheets = await postSheets({ action: "teacher_report", row });
    return NextResponse.json({ ok: true, id: saved?.id ?? null, sheets });
  } catch (e) {
    logServerError("teacher-report", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`teacher-report-list:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !["admin", "teacher"].includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { data, error } = await sb.from("teacher_reports").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, source: "db", rows: data });
    } catch (e) {
      logServerError("teacher-report-list-db", e);
      return NextResponse.json({ ok: true, source: "empty", rows: [] });
    }
  } catch (e) {
    logServerError("teacher-report-list", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
