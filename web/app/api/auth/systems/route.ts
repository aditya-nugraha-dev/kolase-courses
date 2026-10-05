// POST /api/auth/systems { email }
// Login Head of Systems & Technology TANPA isi ID: cukup email, ID (ACT-XXXXXX) dicari otomatis.
// Rate-limit 5/menit/IP. Error generik (anti-enumerasi).
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { systemsLoginSchema } from "@/lib/schemas";
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
  const rl = checkRateLimit(`login:systems:${ip}`);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = systemsLoginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const normEmail = parsed.data.email.trim().toLowerCase();

    let verifiedId: string | null = null;
    const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasSupabase) {
      try {
        const { supabaseServer } = await import("@/lib/supabase");
        const sb = supabaseServer();
        const { data } = await sb
          .from("mst_staff")
          .select("staff_id,email,role")
          .ilike("email", normEmail)
          .eq("role", "systems")
          .limit(1);
        const row = data?.[0];
        if (row && safeEqual(String(row.email ?? "").trim().toLowerCase(), normEmail)) {
          verifiedId = String(row.staff_id);
        }
      } catch (e) {
        logServerError("auth-systems-db", e);
      }
    }
    // Tanpa fallback demo: email harus ada di database.
    if (!verifiedId) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });

    const token = signPayload({ role: "systems", sub: verifiedId, email: normEmail });
    const res = NextResponse.json({ ok: true, staffId: verifiedId, role: "systems" });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    logServerError("auth-systems", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
