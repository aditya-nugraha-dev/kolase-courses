"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, ClipboardCheck, Mic, Target } from "lucide-react";
import { Badge, Card } from "../../components/ui";
import { COURSES, flattenLessons } from "@/lib/course-content";
import {
  countCompleted,
  getLessonProgress,
  loadProgress,
  PROGRESS_EVENT,
} from "@/lib/course-progress";

export default function ProgressClient() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((value) => value + 1);
    update();
    window.addEventListener(PROGRESS_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const course = COURSES[0];
  const lessons = useMemo(() => flattenLessons(course), [course]);
  const lessonKeys = lessons.map((item) => item.key);
  const done = countCompleted(course.slug, lessonKeys);
  const total = lessonKeys.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const store = loadProgress()[course.slug] ?? {};
  let quizScore = 0;
  let quizTotal = 0;
  for (const item of lessons) {
    const progress = store[item.key];
    if (progress?.quizTotal && typeof progress.quizScore === "number") {
      quizScore += progress.quizScore;
      quizTotal += progress.quizTotal;
    }
  }
  const quizPercent = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : null;

  const modulesDone = course.modules.filter((module) => {
    const keys = module.lessons.map((lesson) => `${module.slug}/${lesson.slug}`);
    return countCompleted(course.slug, keys) === keys.length;
  }).length;

  const reco =
    percent === 0
      ? "Mulai dari misi Explorer: Hello, It's Me! Cukup 20 menit dan satu rekaman pendek."
      : percent < 50
        ? "Bagus, sudah mulai! Ulangi frasa kunci di rumah dan selesaikan satu misi lagi."
        : percent < 100
          ? "Hampir sampai. Latih Show & Tell 60 detik sebelum misi terakhir."
          : "Semua misi selesai. Saatnya Show & Tell di kelas dan rayakan keberaniannya!";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-navy">PROGRESS REPORT</p>
          <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">
            Perkembangan Little Speakers
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink/70">
            Ringkasan misi, kuis, dan tahap yang sudah dilalui. Tersinkron ke akunmu.
          </p>
        </div>
        <Link
          href={`/student/kursus/${course.slug}`}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-ivory hover:bg-navy"
        >
          Buka LMS <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-xl">
          <CheckCircle2 size={18} className="text-navy" />
          <p className="font-display mt-2 text-2xl font-extrabold text-ink">{done}/{total}</p>
          <p className="text-xs text-ink/60">Misi selesai</p>
        </Card>
        <Card className="rounded-xl">
          <ClipboardCheck size={18} className="text-navy" />
          <p className="font-display mt-2 text-2xl font-extrabold text-ink">
            {quizPercent != null ? `${quizPercent}%` : "—"}
          </p>
          <p className="text-xs text-ink/60">Rata-rata kuis</p>
        </Card>
        <Card className="rounded-xl">
          <Target size={18} className="text-navy" />
          <p className="font-display mt-2 text-2xl font-extrabold text-ink">
            {modulesDone}/{course.modules.length}
          </p>
          <p className="text-xs text-ink/60">Tahap selesai</p>
        </Card>
      </div>

      <Card className="rounded-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-extrabold text-ink">Progres keseluruhan</h2>
          <Badge tone={percent === 100 ? "green" : percent >= 50 ? "sand" : "slate"}>{percent}%</Badge>
        </div>
        <div
          className="mt-3 h-3 overflow-hidden rounded-full bg-ivory"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`Progres kursus ${percent} persen`}
        >
          <div className="h-full rounded-full bg-sand-deep transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-3 rounded-xl bg-sand-soft p-3 text-sm leading-relaxed text-ink/80">{reco}</p>
      </Card>

      <div className="space-y-3">
        {course.modules.map((module, index) => {
          const keys = module.lessons.map((lesson) => `${module.slug}/${lesson.slug}`);
          const moduleDone = countCompleted(course.slug, keys);
          return (
            <Card key={module.slug} className="rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-extrabold tracking-wide text-navy">TAHAP {index + 1}</p>
                  <h2 className="font-display text-lg font-extrabold text-ink">{module.title}</h2>
                </div>
                <Badge tone={moduleDone === keys.length ? "green" : "slate"}>
                  {moduleDone}/{keys.length} misi
                </Badge>
              </div>
              <ul className="mt-3 divide-y divide-sand/30">
                {module.lessons.map((lesson) => {
                  const progress = getLessonProgress(course.slug, `${module.slug}/${lesson.slug}`);
                  const complete = Boolean(progress?.completed);
                  return (
                    <li key={lesson.slug} className="flex items-center gap-3 py-2.5">
                      {complete ? (
                        <CheckCircle2 size={16} className="shrink-0 text-cyan-deep" />
                      ) : (
                        <Circle size={16} className="shrink-0 text-ink/25" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">{lesson.title}</span>
                        <span className="block truncate text-[11px] text-ink/50">
                          {lesson.duration} menit • {lesson.format}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] font-bold text-ink/55">
                        {progress?.quizTotal
                          ? `Kuis ${progress.quizScore}/${progress.quizTotal}`
                          : complete
                            ? "Selesai"
                            : "Belum"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-xl bg-navy text-ivory">
        <p className="text-xs font-extrabold tracking-[0.2em] text-sand">CATATAN</p>
        <h2 className="font-display mt-1 flex items-center gap-2 text-lg font-extrabold">
          <Mic size={18} className="text-sand" /> Fokus pada keberanian, bukan kesempurnaan
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ivory/75">
          Nilai kuis membantu guru melihat pola. Yang paling penting adalah anak mau
          mencoba, menyelesaikan misi, dan berani bicara lagi.
        </p>
      </Card>
    </div>
  );
}
