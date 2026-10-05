// POST /api/auth/admin { adminKey }
// Bandingkan timing-safe dengan ADMIN_KEY env. Rate-limit 5/menit/IP.
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminLoginSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, logServerError, safeErrorMessage } from "@/lib/security";
import { SESSION_COOKIE, sessionCookieOptions, signPayload } from "@/lib/session";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:admin:${ip}`);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const expected = process.env.ADMIN_KEY ?? "";
    if (!expected || expected.length < 8) {
      logServerError("auth-admin", "ADMIN_KEY belum diset");
      return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
    }
    const a = Buffer.from(parsed.data.adminKey);
    const b = Buffer.from(expected);
    const match = a.length === b.length && timingSafeEqual(a, b);
    if (!match) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });

    const token = signPayload({ role: "admin", sub: "admin" });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    logServerError("auth-admin", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
