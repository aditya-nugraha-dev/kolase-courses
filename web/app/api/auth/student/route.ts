// POST /api/auth/student { email, studentId? }
// Login TANPA isi ID: cukup email, ID (STU-XXXXXX) dicari otomatis dari database.
// studentId opsional (legacy): bila diisi, pasangan ID+email yang diverifikasi.
// Rate-limit 5/menit/IP. Error generik (anti-enumerasi).
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { studentLoginSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, logServerError, safeErrorMessage } from "@/lib/security";
import { SESSION_COOKIE, sessionCookieOptions, signPayload } from "@/lib/session";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:student:${ip}`);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = studentLoginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const { studentId, email } = parsed.data;
    const normEmail = email.trim().toLowerCase();

    let verifiedId: string | null = null;
    const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasSupabase) {
      try {
        const { supabaseServer } = await import("@/lib/supabase");
        const sb = supabaseServer();
        if (studentId) {
          const { data } = await sb
            .from("mst_students")
            .select("student_id,email")
            .eq("student_id", studentId)
            .single();
          if (data && typeof data.email === "string" && safeEqual(data.email.trim().toLowerCase(), normEmail)) {
            verifiedId = data.student_id;
          }
        } else {
          // Email-only: cari ID otomatis (cocok persis, case-insensitive).
          const { data } = await sb
            .from("mst_students")
            .select("student_id,email")
            .ilike("email", normEmail)
            .limit(1);
          const row = data?.[0];
          if (row && safeEqual(String(row.email ?? "").trim().toLowerCase(), normEmail)) {
            verifiedId = String(row.student_id);
          }
        }
      } catch (e) {
        logServerError("auth-student-db", e);
      }
    }
    // Tanpa fallback demo: email harus ada di database.
    // Pesan generik agar tidak bisa enumerasi akun.
    if (!verifiedId) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });

    const token = signPayload({ role: "student", sub: verifiedId, email: normEmail });
    const res = NextResponse.json({ ok: true, studentId: verifiedId });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    logServerError("auth-student", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
