// GET /api/csrf — terbitkan token CSRF double-submit.
// Cookie kolase_csrf (readable JS, SameSite=Strict) + { csrfToken }.
// Client wajib kirim balik via header x-csrf-token pada POST/PUT/DELETE.
import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/security";
import { CSRF_COOKIE } from "@/lib/session";

export async function GET() {
  const token = generateCsrfToken();
  const res = NextResponse.json({ ok: true, csrfToken: token });
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // sengaja readable agar JS bisa kirim via header
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 2 * 3600,
  });
  return res;
}
