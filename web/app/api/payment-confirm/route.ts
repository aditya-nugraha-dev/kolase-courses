// POST /api/payment-confirm — pengganti GForm 02_PAYMENT (publik, hardened).
// GET /api/payment-confirm — daftar untuk admin|teacher.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { postSheets } from "@/lib/sheets";
import { paymentConfirmServerSchema } from "@/lib/schemas";
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
  verifyTurnstile,
} from "@/lib/security";
import { CSRF_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`payment-confirm:${ip}`);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }
  try {
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    if (isHoneypotFilled(raw)) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    const cookieToken = req.headers.get("cookie")?.match(new RegExp(`${CSRF_COOKIE}=([^;]+)`))?.[1] ?? null;
    const { header, bodyToken } = extractCsrfToken(req, raw);
    const presented = header ?? bodyToken;
    if (!cookieToken || !presented || !csrfTokensMatch(cookieToken, presented)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    if (typeof raw.formStartedAt === "number" && Date.now() - raw.formStartedAt < 3000) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    }
    const tt = await verifyTurnstile(typeof raw.turnstileToken === "string" ? raw.turnstileToken : null, ip);
    if (!tt.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });

    const parsed = paymentConfirmServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const b = sanitizeObject({ ...parsed.data } as Record<string, unknown>);
    const row = {
      nama: sanitizeString(b.nama, 100),
      student_id: sanitizeString(b.studentId, 16),
      program: sanitizeString(b.program, 160),
      method: sanitizeString(b.method, 32),
      tanggal: sanitizeString(b.tanggal, 10) || null,
      nominal: Number(b.nominal),
      bukti_url: sanitizeString(b.buktiUrl, 500),
      status: "PENDING",
    };

    let saved: Record<string, unknown> | null = null;
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { data, error } = await sb.from("payment_confirmations").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      saved = (data ?? null) as Record<string, unknown> | null;
    } catch (e) {
      logServerError("payment-confirm-db", e);
    }
    const sheets = await postSheets({ action: "payment_confirm", row });
    return NextResponse.json({ ok: true, id: saved?.id ?? null, sheets });
  } catch (e) {
    logServerError("payment-confirm", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`payment-confirm-list:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !["admin", "teacher"].includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { data, error } = await sb.from("payment_confirmations").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, source: "db", rows: data });
    } catch (e) {
      logServerError("payment-confirm-list-db", e);
      return NextResponse.json({ ok: true, source: "empty", rows: [] });
    }
  } catch (e) {
    logServerError("payment-confirm-list", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

// PATCH /api/payment-confirm {id, status} — verifikasi finance (admin only).
export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`payment-verify:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || s.role !== "admin") {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const id = Number(raw.id);
    const status = String(raw.status ?? "");
    if (!Number.isInteger(id) || !["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    }
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { error } = await sb.from("payment_confirmations").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    } catch (e) {
      logServerError("payment-verify-db", e);
      return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
    }
    const sheets = await postSheets({ action: "payment_verify", id, status });
    return NextResponse.json({ ok: true, sheets });
  } catch (e) {
    logServerError("payment-verify", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
