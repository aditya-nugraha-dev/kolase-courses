// KOLASE — signed session (HMAC-SHA256), server-only (Node runtime).
// Cookie HttpOnly + Secure + SameSite=Strict. TIDAK PERNAH expose ke client JS.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "kolase_session";
export const CSRF_COOKIE = "kolase_csrf";
export type SessionRole = "student" | "admin" | "teacher";

export interface SessionPayload {
  role: SessionRole;
  sub: string; // STU-XXXXXX | admin id | TCH-XXXXXX
  email?: string;
  iat: number;
  exp: number;
}

const b64url = (buf: Buffer) => buf.toString("base64url");
const unb64url = (s: string) => Buffer.from(s, "base64url");

export function getSessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET belum diset (min 16 char)");
  return "dev-only-secret-change-me-12345678";
}

export function signPayload(payload: Omit<SessionPayload, "iat" | "exp">, ttlSec = 7 * 24 * 3600): string {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);
  const full: SessionPayload = { ...payload, iat: now, exp: now + ttlSec };
  const body = b64url(Buffer.from(JSON.stringify(full)));
  const sig = b64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const secret = getSessionSecret();
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expect = b64url(createHmac("sha256", secret).update(body).digest());
    const a = Buffer.from(sig);
    const b = Buffer.from(expect);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(unb64url(body).toString("utf8")) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!["student", "admin", "teacher"].includes(payload.role)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Parse TANPA verifikasi — hanya untuk routing cepat di proxy.
// Verifikasi kriptografis penuh selalu di API route / server layout.
export function parseUnverified(token: string): { role?: string; sub?: string } {
  try {
    const [body] = token.split(".");
    if (!body) return {};
    const p = JSON.parse(unb64url(body).toString("utf8")) as Partial<SessionPayload>;
    return { role: p.role, sub: p.sub };
  } catch {
    return {};
  }
}

export function sessionCookieOptions(maxAgeSec = 7 * 24 * 3600) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}
