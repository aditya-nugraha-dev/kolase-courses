import { z } from "zod";

// Step 1: Student Registration (GFORM 1 RAW)
export const registrationSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap min. 3 karakter"),
  preferredName: z.string().min(2, "Nama panggilan wajib diisi"),
  email: z.string().email("Email tidak valid"),
  wa: z.string().min(9, "Nomor WhatsApp min. 9 digit").regex(/^[+0-9][0-9\- ]+$/, "Nomor WhatsApp tidak valid"),
  ageGroup: z.enum(["<13", "13-15", "16-17", "18-24", "25+"], { message: "Pilih kelompok usia" }),
  domicile: z.string().min(3, "Domisili wajib diisi"),
  currentActivity: z.string().min(3, "Kegiatan saat ini wajib diisi"),
  learningGoal: z.string().min(5, "Ceritakan tujuan belajarmu (min. 5 karakter)"),
  mainDifficulty: z.string().min(5, "Ceritakan kesulitan utamamu (min. 5 karakter)"),
  scheduleOption: z.string().min(3, "Pilih preferensi jadwal"),
  guardianName: z.string().trim().max(100).optional().default(""),
  guardianWhatsapp: z.string().trim().max(20).optional().default(""),
  guardianConsent: z.boolean().optional().default(false),
  meetReady: z.literal(true, { message: "Centang kesiapan Google Meet" }),
  full90: z.literal(true, { message: "Centang komitmen 90 menit penuh" }),
  dataConsent: z.literal(true, { message: "Persetujuan data wajib dicentang" }),
}).refine((v) => v.ageGroup !== "<13" || (v.guardianName?.trim().length >= 3 && /^[+0-9][0-9\- ]{8,19}$/.test(v.guardianWhatsapp?.trim() ?? "") && v.guardianConsent === true), {
  message: "Untuk <13: nama wali, WA wali valid, dan persetujuan wali wajib",
  path: ["guardianName"],
});

export type RegistrationValues = z.infer<typeof registrationSchema>;

// Step 2: Placement & Pre-Check (GFORM 2 RAW)
export const placementMetaSchema = z.object({
  honesty: z.literal(true, { message: "Deklarasi kejujuran wajib dicentang" }),
  writingResponse: z.string().min(20, "Tulis recount min. 20 karakter (target 4–6 kalimat)"),
});

export interface QuizQuestion {
  id: string;
  section: "language" | "vocabulary" | "reading" | "listening";
  sectionLabel: string;
  question: string;
  options: [string, string, string, string];
  answer: number; // index 0-3
}

export const QUIZ: QuizQuestion[] = [
  { id: "q1", section: "language", sectionLabel: "Language Use", question: "She ___ to school yesterday.", options: ["go", "went", "goes", "going"], answer: 1 },
  { id: "q2", section: "language", sectionLabel: "Language Use", question: "I ___ TV last night.", options: ["watched", "watch", "watches", "watching"], answer: 0 },
  { id: "q3", section: "language", sectionLabel: "Language Use", question: "They ___ football on Sunday.", options: ["played", "play", "plays", "playing"], answer: 0 },
  { id: "q4", section: "vocabulary", sectionLabel: "Vocabulary", question: `"Finally" artinya …`, options: ["pada akhirnya", "di awal", "tidak pernah", "selalu"], answer: 0 },
  { id: "q5", section: "vocabulary", sectionLabel: "Vocabulary", question: "Lawan kata “crowded” adalah …", options: ["quiet", "noisy", "busy", "full"], answer: 0 },
  { id: "q6", section: "vocabulary", sectionLabel: "Vocabulary", question: `"Stayed home" artinya …`, options: ["tetap di rumah", "pergi dari rumah", "berkunjung", "keluar"], answer: 0 },
  { id: "q7", section: "reading", sectionLabel: "Reading", question: `Bacaan: “Last Saturday, Rina woke up at 7am. Then she visited her grandmother.” Apa yang Rina lakukan pertama?`, options: ["Bangun jam 7 pagi", "Mengunjungi nenek", "Makan siang", "Menonton TV"], answer: 0 },
  { id: "q8", section: "reading", sectionLabel: "Reading", question: `Kata “then” pada bacaan menunjukkan …`, options: ["urutan kejadian", "alasan", "pertentangan", "akhir cerita"], answer: 0 },
  { id: "q9", section: "listening", sectionLabel: "Listening", question: `Bayangkan audio: “I went to the market, after that I cooked lunch.” Apa yang terjadi duluan?`, options: ["Pergi ke pasar", "Memasak makan siang", "Makan malam", "Tidur"], answer: 0 },
  { id: "q10", section: "listening", sectionLabel: "Listening", question: `Frasa “after that” menandakan …`, options: ["kejadian berikutnya", "kebiasaan lampau", "rencana masa depan", "opini"], answer: 0 },
];

const PAST_VERBS = ["went", "had", "saw", "ate", "did", "stayed", "watched", "visited", "played", "woke", "cooked", "cleaned", "helped", "met", "bought", "took", "made", "got", "was", "were"];
const TIME_MARKERS = ["last weekend", "on saturday", "on sunday", "in the morning", "then", "after that", "finally", "yesterday", "last night", "last saturday", "last sunday", "first", "next", "at night", "in the afternoon", "in the evening"];

export interface PreCheckBreakdown {
  task: number; // 0-2
  past: number; // 0-3
  vocab: number; // 0-2
  org: number; // 0-2
  compre: number; // 0-1
  total: number; // 0-10
}

export function scorePreCheck(text: string): PreCheckBreakdown {
  const t = text.toLowerCase();
  const sentences = text.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 2);
  const words = t.split(/\s+/).filter(Boolean);
  const pastHits = PAST_VERBS.filter((v) => t.includes(v)).length + (t.match(/\b\w+ed\b/g)?.length ?? 0) / 2;
  const markerHits = TIME_MARKERS.filter((m) => t.includes(m)).length;

  const task = sentences.length >= 4 ? 2 : sentences.length >= 2 ? 1 : 0;
  const past = pastHits >= 4 ? 3 : pastHits >= 2 ? 2 : pastHits >= 1 ? 1 : 0;
  const vocab = markerHits >= 2 ? 2 : markerHits >= 1 ? 1 : 0;
  const org = markerHits >= 2 && sentences.length >= 4 ? 2 : sentences.length >= 3 ? 1 : 0;
  const compre = words.length >= 25 ? 1 : 0;
  return { task, past, vocab, org, compre, total: Math.min(10, task + past + vocab + org + compre) };
}

export function scoreQuiz(answers: Record<string, number>): {
  language: number; vocabulary: number; reading: number; listening: number; auto40: number; correct: number;
} {
  const by = (sec: QuizQuestion["section"]) => QUIZ.filter((q) => q.section === sec);
  const calc = (sec: QuizQuestion["section"]) => {
    const qs = by(sec);
    const correct = qs.filter((q) => answers[q.id] === q.answer).length;
    return Math.round((correct / qs.length) * 10);
  };
  const language = calc("language");
  const vocabulary = calc("vocabulary");
  const reading = calc("reading");
  const listening = calc("listening");
  const correct = QUIZ.filter((q) => answers[q.id] === q.answer).length;
  return { language, vocabulary, reading, listening, auto40: language + vocabulary + reading + listening, correct };
}

export function a2FitFromScores(placementTotal: number, preCheck: number): "A2_CONFIRMED" | "PLACEMENT_PENDING" | "OTHER_LEVEL" {
  if (placementTotal >= 25 && preCheck >= 4) return "A2_CONFIRMED";
  if (placementTotal >= 15) return "PLACEMENT_PENDING";
  return "OTHER_LEVEL";
}
