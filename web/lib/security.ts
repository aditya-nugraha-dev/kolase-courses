// KOLASE — security primitives (server-only).
// Sanitization anti-XSS, rate limiting in-memory, CSRF double-submit,
// honeypot bot trap, Turnstile verify (optional), generic error mapping.
import { randomBytes, timingSafeEqual } from "node:crypto";

const WINDOW_MS = 60_000;
const MAX_HITS = 5;
const buckets = new Map<string, number[]>();

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function checkRateLimit(key: string, max = MAX_HITS, windowMs = WINDOW_MS): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    const oldest = arr[0] ?? now;
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true, retryAfterSec: 0 };
}

// ---- Sanitization (tanpa dep tambahan, cukup untuk GForm text) ----
const DANGEROUS_PATTERNS: RegExp[] = [
  /<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi,
  /<\s*iframe[\s\S]*?<\s*\/\s*iframe\s*>/gi,
  /<\s*object[\s\S]*?<\s*\/\s*object\s*>/gi,
  /<\s*embed[\s\S]*?>/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /\beval\s*\(/gi,
  /\bon\w+\s*=/gi, // onclick=, onerror=, ...
];

export function sanitizeString(input: unknown, maxLen = 2000): string {
  if (typeof input !== "string") return "";
  let s = input;
  for (const re of DANGEROUS_PATTERNS) s = s.replace(re, "");
  // Strip tag HTML tersisa, pertahankan teks
  s = s.replace(/<[^>]*>/g, "");
  s = s.trim().replace(/\s+/g, " ");
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T, maxLen = 2000): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === "string" ? sanitizeString(v, maxLen) : v;
  }
  return out as T;
}

// ---- Honeypot: field tersembunyi harus KOSONG. Bot biasanya mengisinya. ----
const HONEYPOT_FIELDS = ["website", "nickname", "company_hp", "url_hp"];
export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  return HONEYPOT_FIELDS.some((f) => {
    const v = body[f];
    return typeof v === "string" && v.trim() !== "";
  });
}

// ---- CSRF double-submit cookie ----
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function csrfTokensMatch(a: string | null, b: string | null): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function extractCsrfToken(req: Request, body: Record<string, unknown>): { header: string | null; bodyToken: string | null } {
  const header =
    req.headers.get("x-csrf-token") ?? req.headers.get("x-xsrf-token");
  const raw = body["csrfToken"] ?? body["csrf_token"] ?? body["_csrf"];
  return { header, bodyToken: typeof raw === "string" ? raw : null };
}

// ---- Turnstile (Cloudflare) — opsional, skip bila secret belum diset ----
export async function verifyTurnstile(token: string | undefined | null, ip: string): Promise<{ ok: boolean; skipped: boolean }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, skipped: false };
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const json = (await res.json().catch(() => ({}))) as { success?: boolean };
    return { ok: json.success === true, skipped: false };
  } catch {
    return { ok: false, skipped: false };
  }
}

// ---- Error aman: jangan bocorkan stack/DB ke client ----
export function safeErrorMessage(status: number): string {
  if (status === 400) return "Bad Request";
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not Found";
  if (status === 429) return "Too Many Requests";
  return "Server Error";
}

export function logServerError(scope: string, err: unknown) {
  // Log internal saja (server console), tidak dikirim ke client.
  console.error(`[KOLASE:${scope}]`, err instanceof Error ? err.message : String(err));
}
