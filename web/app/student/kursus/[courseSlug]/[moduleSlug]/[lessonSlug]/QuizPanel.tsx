"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Badge, Button } from "@/app/components/ui";
import type { QuizQuestion } from "@/lib/course-content";
import { saveQuizResult } from "@/lib/course-progress";

export default function QuizPanel({
  courseSlug,
  lessonKey,
  questions,
}: {
  courseSlug: string;
  lessonKey: string;
  questions: QuizQuestion[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const question = questions[index];
  if (!question) return null;

  const isLast = index === questions.length - 1;
  const isCorrect = submitted && selected === question.correct;

  const submit = () => {
    if (!selected || submitted) return;
    const nextScore = score + (selected === question.correct ? 1 : 0);
    setScore(nextScore);
    setFinalScore(nextScore);
    setSubmitted(true);
  };

  const next = () => {
    if (!submitted) return;
    if (isLast) {
      saveQuizResult(courseSlug, lessonKey, finalScore, questions.length);
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setSubmitted(false);
  };

  const reset = () => {
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
    setFinalScore(0);
  };

  if (finished) {
    const percent = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="rounded-2xl border border-sand/40 bg-paper p-5">
        <Badge tone={percent >= 70 ? "green" : "amber"}>
          {percent >= 70 ? "SIAP LANJUT" : "ULANGI SEBENTAR"}
        </Badge>
        <h3 className="font-display mt-3 text-xl font-extrabold text-ink">
          Skor kamu: {finalScore} dari {questions.length}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink/65">
          {percent >= 70
            ? "Pola dasarnya sudah terlihat. Lanjut ke speaking mission dan tandai lesson ini selesai."
            : "Baca ulang feedback di setiap soal, lalu ulangi kuis. Fokus pada pola, bukan hafalan."}
        </p>
        <Button variant="secondary" onClick={reset} className="mt-4">
          <RotateCcw size={15} /> Ulangi kuis
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sand/40 bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <Badge tone="slate">
          Soal {index + 1} dari {questions.length}
        </Badge>
        <span className="text-xs font-bold text-ink/50">Skor {score}</span>
      </div>

      <p className="mt-3 text-sm font-bold leading-relaxed text-ink">{question.prompt}</p>

      <div className="mt-3 space-y-2">
        {question.options.map((option) => {
          const chosen = selected === option.id;
          const correctOption = submitted && option.id === question.correct;
          const wrongChoice = submitted && chosen && option.id !== question.correct;

          return (
            <button
              key={option.id}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(option.id)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                correctOption
                  ? "border-cyan/40 bg-cyan/10 text-cyan-deep"
                  : wrongChoice
                    ? "border-rose-300 bg-rose-50 text-rose-900"
                    : chosen
                      ? "border-navy bg-ivory text-ink"
                      : "border-sand/40 bg-paper text-ink/75 hover:border-navy hover:bg-ivory"
              }`}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-extrabold">
                {option.id.toUpperCase()}
              </span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {submitted ? (
        <div
          aria-live="polite"
          className={`mt-3 rounded-xl p-3 text-xs leading-relaxed ${
            isCorrect ? "bg-cyan/10 text-cyan-deep" : "bg-rose-50 text-rose-900"
          }`}
        >
          <p className="flex items-center gap-1.5 font-extrabold">
            {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {isCorrect ? "Tepat." : "Belum tepat."}
          </p>
          <p className="mt-1">{question.feedback}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {!submitted ? (
          <Button onClick={submit} disabled={!selected}>
            Cek jawaban
          </Button>
        ) : (
          <Button onClick={next}>{isLast ? "Lihat skor" : "Soal berikutnya"}</Button>
        )}
      </div>
    </div>
  );
}
