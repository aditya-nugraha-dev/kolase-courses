// POST /api/register — hardened: rate-limit, honeypot, CSRF, Turnstile (opsional),
// timing anti-bot, Zod server-side, sanitasi anti-XSS, error generik.
// ID kanonikal: student STU-###### seumur hidup, teacher TCH-XXXXXX, staff ACT-XXXXXX.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { nextId } from "@/lib/ids";
import { postSheets } from "@/lib/sheets";
import { registerServerSchema } from "@/lib/schemas";
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

const TABLES = {
  student: { table: "mst_students", col: "student_id", prefix: "STU" },
  teacher: { table: "mst_teachers", col: "teacher_id", prefix: "TCH" },
  staff: { table: "mst_staff", col: "staff_id", prefix: "ACT" },
} as const;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`register:${ip}`);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  try {
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // 1) Honeypot — tolak bot diam-diam dengan error generik.
    if (isHoneypotFilled(raw)) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    // 2) CSRF double-submit (wajib untuk browser flow; /daftar & /core sudah ambil /api/csrf).
    const cookieToken = req.headers.get("cookie")?.match(new RegExp(`${CSRF_COOKIE}=([^;]+)`))?.[1] ?? null;
    const { header, bodyToken } = extractCsrfToken(req, raw);
    const presented = header ?? bodyToken;
    if (!cookieToken || !presented || !csrfTokensMatch(cookieToken, presented)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }

    // 3) Timing anti-bot: form yang diisi <3 detik dianggap otomatis.
    if (typeof raw.formStartedAt === "number" && Date.now() - raw.formStartedAt < 3000) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    }

    // 4) Turnstile (bila secret diset di server).
    const tt = await verifyTurnstile(typeof raw.turnstileToken === "string" ? raw.turnstileToken : null, ip);
    if (!tt.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });

    // 5) Zod server-side + sanitasi anti-XSS.
    const parsed = registerServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const b = sanitizeObject({ ...parsed.data } as Record<string, unknown>);
    const role = b.role as keyof typeof TABLES;
    const nama = sanitizeString(b.nama, 100);
    const email = sanitizeString(b.email, 160).toLowerCase();
    const wa = sanitizeString(b.wa, 20);

    const sb = supabaseServer();
    const t = TABLES[role];
    const id = await nextId(sb, t.table, t.col, t.prefix);
    const row: Record<string, unknown> =
      role === "student"
        ? { student_id: id, nama, email, wa, tgl_daftar: new Date().toISOString().slice(0, 10) }
        : role === "teacher"
          ? { teacher_id: id, nama, email, wa }
          : { staff_id: id, nama, email, wa, role: "admin" };

    let pilot_student_id: string | null = null;
    if (role === "student") {
      pilot_student_id = id;
      const ageNum = parseInt(String(b.age ?? b.age_group ?? ""), 10);
      const segment = (b.segment as string) ?? (!isNaN(ageNum) && ageNum >= 6 && ageNum <= 12 ? "KIDS" : !isNaN(ageNum) && ageNum >= 13 ? "TEENS_ADULTS" : "");
      Object.assign(row, {
        pilot_student_id: id,
        segment,
        full_name: sanitizeString(b.full_name ?? nama, 100),
        preferred_name: sanitizeString(b.preferred_name ?? "", 100),
        age_group: sanitizeString((b.age_group as string) ?? (b.age as string) ?? "", 10),
        guardian_name: sanitizeString(b.guardian_name, 100),
        guardian_whatsapp: sanitizeString(b.guardian_whatsapp, 20),
        guardian_consent: sanitizeString(b.guardian_consent, 20),
        domicile: sanitizeString(b.domicile, 120),
        current_activity: sanitizeString(b.current_activity, 160),
        learning_goal: sanitizeString(b.learning_goal, 500),
        main_difficulty: sanitizeString(b.main_difficulty, 500),
        current_status: "REGISTERED",
        confirmation_status: "PENDING",
      });
    }
    // Parameterized via Supabase SDK (tanpa string concatenation query).
    const { error } = await sb.from(t.table).insert(row);
    if (error) throw new Error(error.message);
    const sheets = await postSheets({ action: "register", role, row });

    let sheetsPilot = null;
    if (role === "student") {
      try {
        const today = new Date().toISOString();
        sheetsPilot = await postSheets({
          action: "register_pilot",
          registration: {
            "Cap waktu": today, "Full Name": row.full_name ?? nama, "Preferred Name": row.preferred_name ?? "",
            Email: email, "No. WhatsApp": wa, Age: String(b.age_group ?? b.age ?? ""), Domicile: row.domicile ?? "",
            "Current Activities": row.current_activity ?? "", "Learning Goal": row.learning_goal ?? "",
            "Main Difficulties": row.main_difficulty ?? "", "Guardian Name": row.guardian_name ?? "",
            "Guardian WhatsApp": row.guardian_whatsapp ?? "", "Guardian Consent": row.guardian_consent ?? "",
          },
          student: {
            Student_ID: pilot_student_id ?? "", Full_Name: row.full_name ?? nama, Preferred_Name: row.preferred_name ?? "",
            Email: email, WhatsApp: wa, Age_Group: row.age_group ?? "",
            Guardian_Name: row.guardian_name ?? "", Guardian_WhatsApp: row.guardian_whatsapp ?? "",
            Guardian_Consent: row.guardian_consent ?? "", Domicile: row.domicile ?? "",
            Current_Activity: row.current_activity ?? "", Registration_Date: today.slice(0, 10),
            Learning_Goal: row.learning_goal ?? "", Main_Difficulty: row.main_difficulty ?? "",
            Current_Status: "REGISTERED", Confirmation_Status: "PENDING", Last_Updated: today,
          },
        });
        try {
          await sb.from("pilot_registrations").insert({
            student_id: id, pilot_student_id: pilot_student_id ?? "",
            full_name: row.full_name ?? nama, email, whatsapp: wa,
          });
        } catch { /* tabel pilot belum ada = skip */ }
      } catch { sheetsPilot = null; }
    }
    return NextResponse.json({ ok: true, id, pilot_student_id, sheets, sheetsPilot });
  } catch (e) {
    logServerError("register", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
