"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Badge, Button, Card, Field, Input, Select, Textarea, Toast } from "./ui";
import TurnstileBox from "./TurnstileBox";
import { detectLeadershipHint } from "@/lib/leadership";
import { SCHEDULE_OPTIONS } from "@/lib/mock";
import {
  QUIZ,
  a2FitFromScores,
  placementMetaSchema,
  registrationSchema,
  scorePreCheck,
  scoreQuiz,
  type RegistrationValues,
} from "@/lib/placement";

type Step = 1 | 2 | 3;

interface ConfirmData {
  studentId: string;
  attemptId: string;
  placementTotal: number;
  preCheck: number;
  a2Fit: string;
  offline: boolean;
}

async function postJSON(path: string, body: unknown, csrf?: string) {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<Record<string, unknown>>;
}

// Mock ID offline — dipanggil hanya dari event handler (bukan render).
function makeMockId(prefix: string): string {
  const rand = Math.floor(100000 + Math.random() * 899999);
  return `${prefix}-${String(rand)}`;
}

export default function RegistrationWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"dark" | "green" | "red">("dark");
  const [sending, setSending] = useState(false);
  const [regValues, setRegValues] = useState<RegistrationValues | null>(null);
  const [studentId, setStudentId] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [honesty, setHonesty] = useState(false);
  const [writing, setWriting] = useState("");
  const [metaError, setMetaError] = useState("");
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  // Anti-bot & CSRF: token + waktu mulai isi + honeypot (harus kosong).
  const [csrf, setCsrf] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState("");
  const [hpWebsite, setHpWebsite] = useState("");
  const [hpNickname, setHpNickname] = useState("");

  useEffect(() => {
    fetch("/api/csrf").then((r) => r.json()).then((j) => {
      if (typeof j.csrfToken === "string") setCsrf(j.csrfToken);
    }).catch(() => {});
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistrationValues>();
  const ageGroup = watch("ageGroup");
  const fullNameVal = watch("fullName") ?? "";
  const leadershipHint = fullNameVal ? detectLeadershipHint(String(fullNameVal)) : null;

  const quizScore = useMemo(() => scoreQuiz(answers), [answers]);
  const preScore = useMemo(() => scorePreCheck(writing), [writing]);
  const answeredCount = Object.keys(answers).length;

  const showToast = (msg: string, tone: "dark" | "green" | "red" = "dark") => {
    setToast(msg);
    setToastTone(tone);
    window.setTimeout(() => setToast(""), 3500);
  };

  // ---- Step 1 submit: validasi Zod manual + POST /api/register ----
  const onRegister = async (data: RegistrationValues) => {
    const parsed = registrationSchema.safeParse(data);
    if (!parsed.success) {
      showToast("Periksa kembali form — ada field yang belum valid.", "red");
      return;
    }
    setSending(true);
    try {
      const payload = {
        role: "student",
        nama: data.fullName,
        email: data.email,
        wa: data.wa,
        full_name: data.fullName,
        preferred_name: data.preferredName,
        age_group: data.ageGroup,
        age: data.ageGroup,
        domicile: data.domicile,
        current_activity: data.currentActivity,
        learning_goal: data.learningGoal,
        main_difficulty: data.mainDifficulty,
        schedule_option: data.scheduleOption,
        guardian_name: data.guardianName ?? "",
        guardian_whatsapp: data.guardianWhatsapp ?? "",
        guardian_consent: data.guardianConsent ? "YES" : "",
        csrfToken: csrf,
        formStartedAt,
        turnstileToken,
        website: hpWebsite,
        nickname: hpNickname,
      };
      const json = await postJSON("/api/register", payload, csrf);
      const sid = String(json.pilot_student_id ?? json.id ?? "");
      if (json.ok && sid) {
        setRegValues(parsed.data);
        setStudentId(sid);
        setStep(2);
        showToast(`Registrasi tersimpan. Student ID: ${sid}`, "green");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(String(json.error ?? "register gagal"));
      }
    } catch {
      // Fallback preview offline agar UX tetap jalan
      const mockId = makeMockId("STU");
      setRegValues(parsed.data);
      setStudentId(mockId);
      setStep(2);
      showToast(`Backend offline — lanjut mode preview (${mockId}).`, "dark");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSending(false);
    }
  };

  // ---- Step 2 submit: validasi + POST /api/placement ----
  const onPlacement = async () => {
    const meta = placementMetaSchema.safeParse({ honesty, writingResponse: writing });
    if (!meta.success) {
      setMetaError(meta.error.issues[0]?.message ?? "Lengkapi placement check.");
      showToast("Lengkapi deklarasi + recount + semua soal.", "red");
      return;
    }
    if (answeredCount < QUIZ.length) {
      setMetaError(`Masih ada ${QUIZ.length - answeredCount} soal belum dijawab.`);
      showToast("Jawab semua 10 soal screening dulu.", "red");
      return;
    }
    setMetaError("");
    setSending(true);
    try {
      const writingScore = preScore.total;
      const placementTotal = Math.min(50, quizScore.auto40 + writingScore);
      const body = {
        pilot_student_id: studentId,
        honesty_declaration: "Saya mengerjakan secara mandiri tanpa alat bantu penerjemah.",
        language_use_score: quizScore.language,
        vocabulary_score: quizScore.vocabulary,
        reading_score: quizScore.reading,
        listening_score: quizScore.listening,
        placement_auto_score: quizScore.auto40,
        writing_response: writing,
        writing_score: writingScore,
        placement_total: placementTotal,
        pre_check_response: writing,
        pre_check_score: preScore.total,
        csrfToken: csrf,
        formStartedAt,
        turnstileToken,
        website: hpWebsite,
        nickname: hpNickname,
      };
      let attemptId = "";
      let offline = false;
      try {
        const json = await postJSON("/api/placement", body, csrf);
        if (json.ok) attemptId = String(json.attempt_id ?? "");
        else throw new Error(String(json.error ?? "placement gagal"));
      } catch {
        offline = true;
        attemptId = makeMockId("ATM");
      }
      const fit = a2FitFromScores(placementTotal, preScore.total);
      setConfirm({ studentId, attemptId, placementTotal, preCheck: preScore.total, a2Fit: fit, offline });
      setStep(3);
      showToast(offline ? "Tersimpan mode preview (offline)." : "Placement tersimpan. Menunggu review.", "green");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Stepper */}
      <ol className="grid grid-cols-3 gap-2 text-center text-xs font-bold sm:text-sm">
        {[
          { n: 1, t: "Registration" },
          { n: 2, t: "Placement" },
          { n: 3, t: "Konfirmasi" },
        ].map((s) => (
          <li
            key={s.n}
            className={`rounded-xl border px-2 py-2.5 ${step === s.n ? "border-ink bg-ink text-ivory" : step > s.n ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-sand/40 bg-paper text-ink/60"}`}
          >
            {s.n}. {s.t}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <form onSubmit={handleSubmit(onRegister)} className="mt-6 space-y-4">
          {/* Honeypot anti-bot: tersembunyi dari manusia, bot akan mengisinya */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <input tabIndex={-1} autoComplete="off" placeholder="website" value={hpWebsite} onChange={(e) => setHpWebsite(e.target.value)} />
            <input tabIndex={-1} autoComplete="off" placeholder="nickname" value={hpNickname} onChange={(e) => setHpNickname(e.target.value)} />
          </div>
          <Card className="space-y-4 rounded-xl">
            <h2 className="font-display text-lg font-extrabold text-ink">Step 1 — Student Registration (GForm 1)</h2>
            {leadershipHint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                Nama <b>{leadershipHint.displayName}</b> terdaftar untuk peran <b>{leadershipHint.title}</b> — wizard ini khusus Student.
                Silakan masuk via <button type="button" onClick={() => router.push("/masuk")} className="font-bold text-navy hover:underline">/masuk</button> dengan peran yang sesuai saja.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" error={errors.fullName?.message}>
                <Input placeholder="cth. Aisyah Rahma" {...register("fullName")} />
              </Field>
              <Field label="Preferred Name" error={errors.preferredName?.message}>
                <Input placeholder="cth. Aisyah" {...register("preferredName")} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <Input type="email" placeholder="nama@email.id" {...register("email")} />
              </Field>
              <Field label="WhatsApp Number" error={errors.wa?.message}>
                <Input placeholder="08xxxxxxxxxx" {...register("wa")} />
              </Field>
              <Field label="Age Group" error={errors.ageGroup?.message}>
                <Select defaultValue="" {...register("ageGroup")}>
                  <option value="" disabled>Pilih usia</option>
                  <option value="<13">&lt;13</option>
                  <option value="13-15">13–15</option>
                  <option value="16-17">16–17</option>
                  <option value="18-24">18–24</option>
                  <option value="25+">25+</option>
                </Select>
              </Field>
              <Field label="Domicile" error={errors.domicile?.message}>
                <Input placeholder="cth. Tangerang" {...register("domicile")} />
              </Field>
              <Field label="Current Activity" error={errors.currentActivity?.message}>
                <Input placeholder="cth. Pelajar SMA / Mahasiswa / Bekerja" {...register("currentActivity")} />
              </Field>
              <Field label="Schedule Option Preference" error={errors.scheduleOption?.message}>
                <Select defaultValue="" {...register("scheduleOption")}>
                  <option value="" disabled>Pilih jadwal</option>
                  {SCHEDULE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Learning Goal" error={errors.learningGoal?.message}>
              <Textarea rows={2} placeholder="cth. Bisa cerita pengalaman masa lalu dengan runtut" {...register("learningGoal")} />
            </Field>
            <Field label="Main Difficulty" error={errors.mainDifficulty?.message}>
              <Textarea rows={2} placeholder="cth. Takut salah grammar saat speaking" {...register("mainDifficulty")} />
            </Field>
            {ageGroup === "<13" && (
              <div className="grid gap-4 rounded-xl border border-sand/50 bg-sand-soft/40 p-4 sm:grid-cols-2">
                <p className="text-sm font-bold text-ink sm:col-span-2">Data Wali (wajib untuk &lt;13 — Little Speakers)</p>
                <Field label="Nama Wali" error={errors.guardianName?.message}>
                  <Input placeholder="cth. Bunda Aisyah" {...register("guardianName")} />
                </Field>
                <Field label="WA Wali" error={errors.guardianWhatsapp?.message}>
                  <Input placeholder="08xxxxxxxxxx" {...register("guardianWhatsapp")} />
                </Field>
                <label className="flex cursor-pointer gap-2.5 text-sm text-ink/80 sm:col-span-2">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-navy" {...register("guardianConsent")} />
                  Saya wali murid dan menyetujui anak mengikuti assessment & kelas
                </label>
                {errors.guardianName && <p className="text-xs font-semibold text-rose-600 sm:col-span-2">{errors.guardianName.message}</p>}
              </div>
            )}
            <div className="space-y-2 rounded-xl bg-ivory p-4 text-sm">
              {[
                { k: "meetReady" as const, t: "Perangkat saya Google Meet-ready (kamera, mic, internet stabil)" },
                { k: "full90" as const, t: "Saya berkomitmen penuh 90 menit tanpa terputus" },
                { k: "dataConsent" as const, t: "Saya setuju data dipakai untuk placement & penjadwalan kelas" },
              ].map((c) => (
                <label key={c.k} className="flex cursor-pointer gap-2.5 text-ink/80">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-navy" {...register(c.k)} />
                  {c.t}
                </label>
              ))}
              {(errors.meetReady || errors.full90 || errors.dataConsent) && (
                <p className="text-xs font-semibold text-rose-600">Centang ketiga komitmen untuk lanjut.</p>
              )}
            </div>
            <TurnstileBox onToken={setTurnstileToken} />
          </Card>
          <Button type="submit" disabled={sending} className="w-full">
            {sending ? <Loader2 className="animate-spin" size={18} /> : <>Lanjut ke Placement Check <ArrowRight size={18} /></>}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <Card className="rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-extrabold text-ink">Step 2 — Placement & Pre-Check (GForm 2)</h2>
              <Badge tone="navy">{studentId || "STU-XXXXXX"}</Badge>
            </div>
            <label className="mt-3 flex cursor-pointer gap-2.5 rounded-xl bg-sand-soft p-3 text-sm text-ink/80">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-navy" checked={honesty} onChange={(e) => setHonesty(e.target.checked)} />
              Saya menyatakan mengerjakan secara mandiri & jujur tanpa alat bantu penerjemah.
            </label>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <Badge tone="slate">Terjawab {answeredCount}/{QUIZ.length}</Badge>
              <Badge tone="blue">Auto {quizScore.auto40}/40</Badge>
              <Badge tone="amber">Pre-Check {preScore.total}/10</Badge>
            </div>
          </Card>

          {QUIZ.map((q, i) => (
            <Card key={q.id} className="rounded-xl">
              <p className="text-xs font-extrabold text-navy">{q.sectionLabel} • Soal {i + 1}</p>
              <p className="mt-1 text-sm font-bold text-ink">{q.question}</p>
              <div className="mt-2 grid gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className={`rounded-xl border px-4 py-2.5 text-left text-sm ${answers[q.id] === oi ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/80 hover:border-sand-deep"}`}
                  >
                    <b className="mr-2">{String.fromCharCode(65 + oi)}.</b>{opt}
                  </button>
                ))}
              </div>
            </Card>
          ))}

          <Card className="rounded-xl">
            <h3 className="font-display text-base font-extrabold text-ink">Pre-Check Writing — recount akhir pekan (0–10)</h3>
            <p className="mt-1 text-sm text-ink/70">Prompt: <i>What did you do last weekend? Write 4–6 sentences.</i> Dikerjakan tanpa bantuan guru.</p>
            <Textarea rows={5} value={writing} onChange={(e) => setWriting(e.target.value)} placeholder="Last weekend I …" className="mt-3" />
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Badge tone="slate">Task {preScore.task}/2</Badge>
              <Badge tone="slate">Past {preScore.past}/3</Badge>
              <Badge tone="slate">Vocab {preScore.vocab}/2</Badge>
              <Badge tone="slate">Org {preScore.org}/2</Badge>
              <Badge tone="slate">Compre {preScore.compre}/1</Badge>
              <Badge tone="amber">Total {preScore.total}/10</Badge>
            </div>
            {metaError && <p className="mt-2 text-xs font-semibold text-rose-600">{metaError}</p>}
          </Card>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => setStep(1)} className="sm:w-auto"><ArrowLeft size={18} /> Kembali</Button>
            <Button onClick={onPlacement} disabled={sending} className="flex-1">
              {sending ? <Loader2 className="animate-spin" size={18} /> : <>Submit Placement <CheckCircle2 size={18} /></>}
            </Button>
          </div>
          <p className="text-center text-xs text-ink/60">Estimasi placement total: <b>{Math.min(50, quizScore.auto40 + preScore.total)}/50</b> (auto {quizScore.auto40}/40 + writing {preScore.total}/10)</p>
        </div>
      )}

      {step === 3 && confirm && (
        <Card className="mt-6 rounded-xl text-center">
          <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
          <h2 className="font-display mt-2 text-xl font-extrabold text-ink">Pendaftaran & Placement Terkirim</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink/70">
            {confirm.offline
              ? "Backend offline — data tersimpan sebagai preview lokal. Tim akan menghubungi untuk verifikasi."
              : "Tim akademik akan mereview dalam maks. 1×24 jam kerja via WhatsApp."}
          </p>
          <div className="mx-auto mt-4 grid max-w-md gap-2 text-left text-sm">
            {[
              ["Student ID", confirm.studentId],
              ["Attempt ID", confirm.attemptId],
              ["Placement Total", `${confirm.placementTotal}/50`],
              ["Pre-Check", `${confirm.preCheck}/10`],
              ["A2 Fit", confirm.a2Fit.replace("_", " ")],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-xl bg-ivory px-4 py-2.5">
                <span className="text-ink/60">{k}</span><b className="text-ink">{v}</b>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Badge tone={confirm.a2Fit === "A2_CONFIRMED" ? "green" : confirm.a2Fit === "PLACEMENT_PENDING" ? "amber" : "slate"}>
              {confirm.a2Fit === "A2_CONFIRMED" ? "Cocok untuk A2 Pilot — menunggu Class Match 3–5" : confirm.a2Fit === "PLACEMENT_PENDING" ? "Placement Review — menunggu keputusan tim" : "Level lain — tim akan rekomendasikan jalur yang pas"}
            </Badge>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="dark" onClick={() => router.push("/")}>Kembali ke Beranda</Button>
            <Button variant="secondary" onClick={() => router.push("/dashboard")}>Lihat Dashboard</Button>
          </div>
          {regValues && (
            <p className="mt-4 text-xs text-ink/60">Terima kasih, {regValues.preferredName} ({regValues.email}) — preferensi: {regValues.scheduleOption}.</p>
          )}
        </Card>
      )}

      <Toast message={toast} tone={toastTone} />
    </div>
  );
}

// Re-export agar tree-shaking aman bila diimpor parsial
export type { Step };
export { z };
