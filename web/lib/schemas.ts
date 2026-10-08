// KOLASE — server-side Zod schemas (validasi KETAT sebelum DB).
// Semua string dibatasi panjang + pola; honeypot ditolak di handler.
import { z } from "zod";

const nameStr = z.string().trim().min(3).max(100);
const shortStr = z.string().trim().min(2).max(100);
const longStr = (min: number, max: number) => z.string().trim().min(min).max(max);
const emailStr = z.string().trim().email().max(160);
const waStr = z.string().trim().min(9).max(20).regex(/^[+0-9][0-9\- ]+$/);
const ageGroupEnum = z.enum(["<13", "13-15", "16-17", "18-24", "25+"]);

export const registerServerSchema = z.object({
  role: z.enum(["student", "teacher", "founder", "academic", "systems"]),
  nama: nameStr,
  email: emailStr,
  wa: waStr.optional().default(""),
  full_name: nameStr.optional(),
  preferred_name: shortStr.optional().default(""),
  age_group: ageGroupEnum.optional(),
  age: z.string().trim().max(10).optional().default(""),
  segment: z.enum(["KIDS", "TEENS_ADULTS"]).optional(),
  domicile: longStr(3, 120).optional().default(""),
  current_activity: longStr(3, 160).optional().default(""),
  learning_goal: longStr(5, 500).optional().default(""),
  main_difficulty: longStr(5, 500).optional().default(""),
  schedule_option: z.string().trim().max(160).optional().default(""),
  guardian_name: z.string().trim().max(100).optional().default(""),
  guardian_whatsapp: z.string().trim().max(20).optional().default(""),
  guardian_consent: z.string().trim().max(20).optional().default(""),
  // anti-bot: waktu isi form (ms epoch, dari client) + token turnstile opsional
  formStartedAt: z.number().int().positive().optional(),
  turnstileToken: z.string().max(2000).optional().default(""),
});

const score010 = z.number().int().min(0).max(10);

export const placementServerSchema = z.object({
  pilot_student_id: z.string().trim().max(16).optional().default(""),
  student_id: z.string().trim().max(16).optional().default(""),
  email: emailStr.optional().default(""),
  full_name: z.string().trim().max(100).optional().default(""),
  honesty_declaration: longStr(5, 300),
  language_use_score: score010,
  vocabulary_score: score010,
  reading_score: score010,
  listening_score: score010,
  writing_score: score010,
  writing_response: longStr(20, 2000),
  pre_check_response: longStr(20, 2000),
  pre_check_score: score010,
  formStartedAt: z.number().int().positive().optional(),
  turnstileToken: z.string().max(2000).optional().default(""),
}).refine((v) => v.pilot_student_id !== "" || v.student_id !== "", {
  message: "pilot_student_id atau student_id wajib",
});

export const studentLoginSchema = z.object({
  email: emailStr,
  // studentId opsional (legacy): bila diisi, pasangan ID+email diverifikasi.
  // Alur utama kini email-only — ID (STU-XXXXXX) auto-stack dari database.
  studentId: z.string().trim().regex(/^STU-\d{6}$/, "Format STU-XXXXXX").optional(),
});

export const teacherLoginSchema = z.object({
  email: emailStr,
});

export const founderLoginSchema = z.object({
  email: emailStr,
});

export const academicLoginSchema = z.object({
  email: emailStr,
});

export const systemsLoginSchema = z.object({
  email: emailStr,
});

export const staffLoginSchema = z.object({
  email: emailStr,
  adminKey: z.string().trim().min(8).max(200),
});

export const adminLoginSchema = z.object({
  adminKey: z.string().trim().min(8).max(200),
});

// Konfirmasi pembayaran (pengganti GForm 02_PAYMENT).
export const paymentConfirmServerSchema = z.object({
  nama: nameStr,
  studentId: z.string().trim().regex(/^STU-\d{6}$/, "Format STU-XXXXXX"),
  program: longStr(3, 160),
  method: z.enum(["QRIS", "Transfer Bank", "E-Wallet"]),
  tanggal: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD").optional().default(""),
  nominal: z.coerce.number().int().min(1000).max(100000000),
  buktiUrl: z.string().trim().max(500).optional().default(""),
  formStartedAt: z.number().int().positive().optional(),
  turnstileToken: z.string().max(2000).optional().default(""),
});

// Teacher Session Report (pengganti GForm 03_TEACHER_REPORT).
export const teacherReportServerSchema = z.object({
  classId: z.string().trim().min(3).max(32),
  tanggal: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD").optional().default(""),
  materi: z.string().trim().max(200).optional().default(""),
  hadir: z.string().trim().max(32).optional().default(""),
  catatan: longStr(5, 2000),
});

// Teacher Reschedule Request (pengganti GForm 04_TEACHER_REQUEST_RESCHEDULE).
export const rescheduleServerSchema = z.object({
  classId: z.string().trim().min(3).max(32),
  lama: z.string().trim().max(120).optional().default(""),
  baru: z.string().trim().min(3).max(120),
  alasan: z.string().trim().max(200).optional().default(""),
});

// Kelas — CRUD dashboard (mirror tabel classes + kolom pilot hybrid).
// Step 1 list, Step 2 tambah, Step 3 edit/detail, Step 4 hapus.
export const classCreateServerSchema = z.object({
  id: z.string().trim().regex(/^CLS-[A-Za-z0-9-]{1,24}$/, "Format CLS-XXXXXX").optional().default(""),
  nama: z.string().trim().min(3).max(160),
  level: z.enum(["A1", "A2", "B1", "PUB", "KIDS", "TEEN"]),
  kategori: z.enum(["PUBLIC", "CORE"]).optional().default("PUBLIC"),
  jadwal: z.string().trim().min(3).max(200),
  guru: z.string().trim().min(2).max(100),
  harga: z.coerce.number().int().min(0).max(100000000),
  harga_coret: z.coerce.number().int().min(0).max(100000000).optional().default(0),
  kuota: z.coerce.number().int().min(1).max(50),
  min_students: z.coerce.number().int().min(1).max(5).optional().default(3),
  sesi_count: z.coerce.number().int().min(1).max(45).optional().default(4),
  class_status: z.enum(["DRAFT", "OPEN", "FULL", "COMING_SOON", "CLOSED"]).optional().default("DRAFT"),
  deskripsi: z.string().trim().max(2000).optional().default(""),
  meet_link: z.string().trim().max(500).optional().default(""),
  teacher_name: z.string().trim().max(100).optional().default(""),
  learning_objective: z.string().trim().max(2000).optional().default(""),
  pilot_class_id: z.string().trim().max(32).optional().default(""),
});

export const classUpdateServerSchema = classCreateServerSchema.partial().extend({
  id: z.string().trim().min(3).max(32),
});

export const classDeleteServerSchema = z.object({
  id: z.string().trim().min(3).max(32),
});

// Trial 7 sesi gratis: mulai → progres per sesi → keputusan lanjut/berhenti.
// Lanjut = buatkan checkout kelas Kids (ENR + TXN PENDING) lalu ke /bayar.
export const trialCreateServerSchema = z.object({
  student_id: z.string().trim().regex(/^STU-\d{6}$/, "Format STU-XXXXXX").optional().default(""),
  class_id: z.string().trim().min(3).max(32).optional().default(""),
});

export const trialProgressServerSchema = z.object({
  trial_id: z.string().trim().regex(/^TRL-\d{6}$/, "Format TRL-XXXXXX"),
  sessions_delivered: z.coerce.number().int().min(0).max(7),
});

export const trialDecisionServerSchema = z.object({
  trial_id: z.string().trim().regex(/^TRL-\d{6}$/, "Format TRL-XXXXXX"),
  action: z.enum(["lanjut", "berhenti"]),
  method: z.enum(["QRIS", "Transfer Bank", "E-Wallet"]).optional().default("QRIS"),
});

// Materi kelas (diupload guru, dibaca murid sekelasnya).
export const materialDeleteServerSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Chat murid ↔ teacher/staff (1 thread per STU-XXXXXX).
export const chatSendServerSchema = z.object({
  student_id: z.string().trim().regex(/^STU-\d{6}$/, "Format STU-XXXXXX").optional().default(""),
  text: z.string().trim().min(1).max(1000),
});

// Database staff: hapus data murid / guru.
export const userDeleteServerSchema = z.object({
  type: z.enum(["student", "teacher"]),
  id: z.string().trim().min(3).max(64),
});
