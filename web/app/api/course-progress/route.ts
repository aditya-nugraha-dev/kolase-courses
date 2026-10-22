// GET/POST /api/course-progress — progres LMS Little Speakers milik sesi student.
// GET  : semua baris progres murid (untuk hidrasi lintas perangkat).
// POST : upsert satu lesson (completed, skor kuis) dengan updated_at dari server.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { STUDENT_AREA_ROLES } from "@/lib/session";
import { courseProgressServerSchema } from "@/lib/schemas";
import {
  checkRateLimit,
  getClientIp,
  logServerError,
  safeErrorMessage,
} from "@/lib/security";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`course-progress-list:${ip}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !STUDENT_AREA_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    }
    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const { data, error } = await sb
      .from("course_progress")
      .select("course_slug,lesson_key,completed,quiz_score,quiz_total,updated_at")
      .eq("student_id", s.sub)
      .order("updated_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, rows: data ?? [] });
  } catch (e) {
    logServerError("course-progress-get", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`course-progress-save:${ip}`, 120, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !STUDENT_AREA_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = courseProgressServerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    }

    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const row = {
      student_id: s.sub,
      course_slug: parsed.data.course_slug,
      lesson_key: parsed.data.lesson_key,
      completed: parsed.data.completed,
      quiz_score: parsed.data.quiz_score ?? null,
      quiz_total: parsed.data.quiz_total ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb
      .from("course_progress")
      .upsert(row, { onConflict: "student_id,course_slug,lesson_key" });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, updated_at: row.updated_at });
  } catch (e) {
    logServerError("course-progress-post", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
