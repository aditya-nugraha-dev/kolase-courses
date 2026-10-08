// KOLASE — penyimpanan chat murid ↔ teacher (server-only).
// File JSON lokal (data/chat.json) agar tanpa migrasi DB.
// Produksi: migrasi ke tabel chat_messages (lihat supabase/chat_messages.sql).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface ChatMessage {
  id: string;
  from: string; // "student:STU-.." | "teacher:TCH-.." | "staff:.."
  text: string;
  at: string; // ISO
}

export interface ChatThread {
  student_id: string;
  student_name: string;
  messages: ChatMessage[];
  read_student_at: string;
  read_staff_at: string;
  updated_at: string;
}

interface ChatDB {
  threads: Record<string, ChatThread>;
}

function chatFile(): string {
  return process.env.CHAT_FILE || join(process.cwd(), "data", "chat.json");
}

export async function readChatDB(): Promise<ChatDB> {
  try {
    // File runtime (bukan bagian bundle) — jangan di-trace turbopack.
    const raw = await readFile(/*turbopackIgnore: true*/ chatFile(), "utf8");
    const j = JSON.parse(raw) as ChatDB;
    if (j && typeof j.threads === "object") return j;
  } catch { /* file belum ada = mulai kosong */ }
  return { threads: {} };
}

export async function writeChatDB(db: ChatDB): Promise<void> {
  await mkdir(/*turbopackIgnore: true*/ join(process.cwd(), "data"), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ chatFile(), JSON.stringify(db, null, 1), "utf8");
}

export function getThread(db: ChatDB, studentId: string): ChatThread | null {
  return db.threads[studentId] ?? null;
}

export function ensureThread(db: ChatDB, studentId: string, studentName: string): ChatThread {
  let t = db.threads[studentId];
  if (!t) {
    const now = new Date().toISOString();
    t = {
      student_id: studentId,
      student_name: studentName || studentId,
      messages: [],
      read_student_at: now,
      read_staff_at: now,
      updated_at: now,
    };
    db.threads[studentId] = t;
  }
  if (studentName && t.student_name === studentId) t.student_name = studentName;
  return t;
}

export function threadSummary(t: ChatThread): Record<string, unknown> {
  const last = t.messages[t.messages.length - 1] ?? null;
  const unreadStudent = t.messages.filter(
    (m) => !m.from.startsWith("student:") && m.at > t.read_student_at
  ).length;
  const unreadStaff = t.messages.filter(
    (m) => m.from.startsWith("student:") && m.at > t.read_staff_at
  ).length;
  return {
    student_id: t.student_id,
    student_name: t.student_name,
    count: t.messages.length,
    last_text: last ? String(last.text).slice(0, 80) : "",
    last_at: last?.at ?? t.updated_at,
    last_from: last?.from ?? "",
    unread_student: unreadStudent,
    unread_staff: unreadStaff,
  };
}
