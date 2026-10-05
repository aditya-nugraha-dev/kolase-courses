// POST /api/auth/staff { email, adminKey }
// Login staf TANPA isi ID: email dicari otomatis (ACT-XXXXXX) + wajib admin key.
// Rate-limit 5/menit/IP. Error generik (anti-enumerasi).
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { staffLoginSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, logServerError, safeErrorMessage } from "@/lib/security";
import { SESSION_COOKIE, sessionCookieOptions, signPayload } from "@/lib/session";
import { MOCK_STAFF } from "@/lib/mock";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:staff:${ip}`);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = staffLoginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const normEmail = parsed.data.email.trim().toLowerCase();

    // Admin key wajib cocok (timing-safe) — penjaga panel admin.
    const expected = process.env.ADMIN_KEY ?? "";
    if (!expected || expected.length < 8) {
      logServerError("auth-staff", "ADMIN_KEY belum diset");
      return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
    }
    const a = Buffer.from(parsed.data.adminKey);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    }

    let verifiedId: string | null = null;
    const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasSupabase) {
      try {
        const { supabaseServer } = await import("@/lib/supabase");
        const sb = supabaseServer();
        const { data } = await sb
          .from("mst_staff")
          .select("staff_id,email")
          .ilike("email", normEmail)
          .limit(1);
        const row = data?.[0];
        if (row && safeEqual(String(row.email ?? "").trim().toLowerCase(), normEmail)) {
          verifiedId = String(row.staff_id);
        }
      } catch (e) {
        logServerError("auth-staff-db", e);
      }
    }
    // Fallback demo/preview (mock).
    if (!verifiedId) {
      const m = MOCK_STAFF.find((s) => safeEqual(s.email.trim().toLowerCase(), normEmail));
      if (m) verifiedId = m.staffId;
    }
    if (!verifiedId) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });

    const token = signPayload({ role: "admin", sub: verifiedId, email: normEmail });
    const res = NextResponse.json({ ok: true, staffId: verifiedId });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    logServerError("auth-staff", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
