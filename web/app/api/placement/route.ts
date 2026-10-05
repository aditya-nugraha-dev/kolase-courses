// POST /api/placement — hardened: rate-limit, honeypot, CSRF, Turnstile (opsional),
// timing anti-bot, Zod server-side, sanitasi anti-XSS, error generik.
// Placement 50 poin KHUSUS Teens/Adults; tiap pengerjaan = ATM-###### baru.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { nextId } from "@/lib/ids";
import { postSheets } from "@/lib/sheets";
import { placementServerSchema } from "@/lib/schemas";
import {
  checkRateLimit,
  csrfTokensMatch,
  extractCsrfToken,
  getClientIp,
  isHoneypotFilled,
  logServerError,
  safeErrorMessage,
  sanitizeString,
  verifyTurnstile,
} from "@/lib/security";
import { CSRF_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`placement:${ip}`);
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

    const parsed = placementServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const b = parsed.data;
    const lang = b.language_use_score, vocab = b.vocabulary_score, read = b.reading_score, listen = b.listening_score;
    const auto = lang + vocab + read + listen;
    const total = auto + b.writing_score;
    if (total < 0 || total > 50) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    const writing_response = sanitizeString(b.writing_response, 2000);
    const pre_check_response = sanitizeString(b.pre_check_response, 2000);
    const honesty = sanitizeString(b.honesty_declaration, 300);
    const email = sanitizeString(b.email, 160).toLowerCase();
    const fullName = sanitizeString(b.full_name, 100);

    const sb = supabaseServer();
    let sid = sanitizeString(b.student_id, 16);
    let pid = sanitizeString(b.pilot_student_id, 16);
    if (!sid && pid) {
      const { data } = await sb.from("mst_students").select("student_id,email,nama,full_name,segment").eq("pilot_student_id", pid).single();
      if (data) { sid = data.student_id; }
      if (data && data.segment === "KIDS") return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    if (sid && !pid) {
      const { data } = await sb.from("mst_students").select("segment,pilot_student_id").eq("student_id", sid).single();
      if (data && data.segment === "KIDS") return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
      if (data && data.pilot_student_id) pid = data.pilot_student_id;
    }
    const attempt_id = await nextId(sb, "pilot_placements", "attempt_id", "ATM").catch(() => `ATM-${Date.now().toString().slice(-6)}`);
    if (sid) {
      try {
        await sb.from("mst_students").update({
          placement_total: total, pre_check_score: b.pre_check_score, current_status: "PLACEMENT_SUBMITTED",
          last_updated: new Date().toISOString(),
        }).eq("student_id", sid);
      } catch { /* kolom hybrid belum ada = skip */ }
      try {
        await sb.from("pilot_placements").insert({
          attempt_id, student_id: sid, pilot_student_id: pid, language_use_score: lang, vocabulary_score: vocab,
          reading_score: read, listening_score: listen, placement_auto_score: auto,
          writing_score: b.writing_score, placement_total: total, pre_check_score: b.pre_check_score,
        });
      } catch { /* tabel/kolom pilot belum ada = skip */ }
    }
    const now = new Date().toISOString();
    const sheets = await postSheets({
      action: "placement",
      placement: {
        Attempt_ID: attempt_id, Timestamp: now, Email: email, Student_ID: pid, Full_Name: fullName,
        Honesty_Declaration: honesty, Language_Use_Score: lang, Vocabulary_Score: vocab,
        Reading_Score: read, Listening_Score: listen, Placement_Auto_Score: auto,
        Writing_Response: writing_response, Writing_Score: b.writing_score,
        Placement_Total: total, Pre_Check_Response: pre_check_response, Pre_Check_Score: b.pre_check_score,
      },
      student_patch: {
        Student_ID: pid, Placement_Auto_Score: auto, Writing_Score: b.writing_score,
        Placement_Total: total, Pre_Check_Score: b.pre_check_score, Current_Status: "PLACEMENT_SUBMITTED",
      },
    });
    return NextResponse.json({ ok: true, attempt_id, student_id: sid || null, pilot_student_id: pid || null, placement_total: total, pre_check_score: b.pre_check_score, sheets });
  } catch (e) {
    logServerError("placement", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
