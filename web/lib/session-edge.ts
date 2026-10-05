// KOLASE — session parse EDGE-SAFE (tanpa node:crypto).
// Hanya decode payload untuk routing cepat di proxy.ts.
// JANGAN dipakai untuk otorisasi final — verifikasi HMAC ada di lib/session.ts (server).

export const ADMIN_ROLES_EDGE = ["admin", "teacher", "founder", "academic", "systems"];
export const STUDENT_AREA_ROLES_EDGE = ["student", "admin", "teacher", "founder", "academic", "systems"];

export function parseUnverified(token: string): { role?: string; sub?: string } {
  try {
    const [body] = token.split(".");
    if (!body) return {};
    // base64url -> base64
    const b64 = body.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("utf8");
    const p = JSON.parse(json) as { role?: string; sub?: string; exp?: number };
    if (p.exp && p.exp * 1000 < Date.now()) return {};
    return { role: p.role, sub: p.sub };
  } catch {
    return {};
  }
}
