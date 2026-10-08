// /api/chat — Chat murid ↔ teacher/staff (1 thread per STU-XXXXXX).
// GET: murid → thread miliknya; teacher/staff → ?student_id= atau ?list=1.
// POST {student_id?, text}: murid kirim ke thread sendiri; teacher/staff ke thread murid.
// Penyimpanan file lokal (lib/chat.ts). Polling dari UI tiap beberapa detik.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/session";
import {
  checkRateLimit,
  getClientIp,
  logServerError,
  safeErrorMessage,
  sanitizeString,
} from "@/lib/security";
import { chatSendServerSchema } from "@/lib/schemas";
import { ensureThread, getThread, readChatDB, threadSummary, writeChatDB } from "@/lib/chat";



async function studentName(studentId: string): Promise<string> {
  try {
    const { supabaseServer } = await import("@/lib/supabase");
    const db = supabaseServer();
    const { data } = await db
      .from("mst_students")
      .select("preferred_name,full_name,nama")
      .eq("student_id", studentId)
      .maybeSingle();
    const d = (data ?? {}) as Record<string, unknown>;
    return (
      (typeof d.preferred_name === "string" && d.preferred_name) ||
      (typeof d.full_name === "string" && d.full_name) ||
      (typeof d.nama === "string" && d.nama) ||
      studentId
    );
  } catch {
    return studentId;
  }
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`chat-list:${ip}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const url = new URL(req.url);
    const db = await readChatDB();

    if (s.role === "student") {
      const t = getThread(db, s.sub);
      if (t) {
        t.read_student_at = new Date().toISOString();
        await writeChatDB(db).catch(() => {});
      }
      return NextResponse.json({
        ok: true,
        thread: t ? { ...t } : { student_id: s.sub, student_name: "", messages: [] },
      });
    }
    if (!ADMIN_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    if (url.searchParams.get("list") === "1") {
      const rows = Object.values(db.threads)
        .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
        .slice(0, 100)
        .map(threadSummary);
      return NextResponse.json({ ok: true, threads: rows });
    }
    const sid = (url.searchParams.get("student_id") ?? "").trim();
    if (!sid) return NextResponse.json({ ok: false, error: "student_id wajib" }, { status: 400 });
    const t = getThread(db, sid);
    if (t) {
      t.read_staff_at = new Date().toISOString();
      await writeChatDB(db).catch(() => {});
    }
    return NextResponse.json({ ok: true, thread: t ?? { student_id: sid, student_name: "", messages: [] } });
  } catch (e) {
    logServerError("chat-list", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`chat-send:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = chatSendServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    let studentId: string;
    let from: string;
    if (s.role === "student") {
      const want = sanitizeString(parsed.data.student_id, 16);
      if (want && want !== s.sub) {
        return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
      }
      studentId = s.sub;
      from = `student:${s.sub}`;
    } else {
      if (!ADMIN_ROLES.includes(s.role)) {
        return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
      }
      studentId = sanitizeString(parsed.data.student_id, 16);
      if (!studentId) return NextResponse.json({ ok: false, error: "student_id wajib" }, { status: 400 });
      from = s.role === "teacher" ? `teacher:${s.sub}` : `staff:${s.sub}`;
    }

    const text = sanitizeString(parsed.data.text, 1000);
    if (!text) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    const db = await readChatDB();
    const name = await studentName(studentId);
    const t = ensureThread(db, studentId, name);
    const now = new Date().toISOString();
    t.messages.push({ id: `${Date.now()}-${t.messages.length}`, from, text, at: now });
    if (t.messages.length > 500) t.messages = t.messages.slice(-500);
    t.updated_at = now;
    if (s.role === "student") t.read_student_at = now;
    else t.read_staff_at = now;
    await writeChatDB(db);
    return NextResponse.json({ ok: true, at: now });
  } catch (e) {
    logServerError("chat-send", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
