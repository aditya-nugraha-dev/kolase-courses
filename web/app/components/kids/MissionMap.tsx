"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Hammer,
  Map,
  MessageCircle,
  Mic,
  PlayCircle,
  Star,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { loadProgress, PROGRESS_EVENT } from "@/lib/course-progress";
import { STARS_PER_CORRECT, STARS_PER_MISSION } from "@/lib/rewards";

export type MissionLesson = {
  slug: string;
  title: string;
  duration: number;
  format: string;
};

export type MissionModule = {
  slug: string;
  title: string;
  sessions: string;
  objective: string;
  lessons: MissionLesson[];
};

const STAGE_STYLE = [
  {
    icon: Compass,
    chip: "bg-cyan text-white",
    soft: "bg-cyan/10",
    border: "border-cyan/30",
    text: "text-cyan-deep",
  },
  {
    icon: Hammer,
    chip: "bg-violet text-white",
    soft: "bg-violet-soft",
    border: "border-violet/25",
    text: "text-violet-deep",
  },
  {
    icon: Mic,
    chip: "bg-sand text-ink",
    soft: "bg-sand-soft",
    border: "border-sand/40",
    text: "text-ink",
  },
  {
    icon: MessageCircle,
    chip: "bg-navy text-ivory",
    soft: "bg-violet-soft",
    border: "border-navy/25",
    text: "text-navy",
  },
];

export default function MissionMap({
  courseSlug,
  modules,
}: {
  courseSlug: string;
  modules: MissionModule[];
}) {
  const [store, setStore] = useState<Record<string, { completed?: boolean; quizScore?: number; quizTotal?: number }>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setStore(loadProgress()[courseSlug] ?? {});
      setReady(true);
    };
    sync();
    window.addEventListener(PROGRESS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [courseSlug]);

  const allLessons = modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ moduleSlug: module.slug, lessonSlug: lesson.slug }))
  );
  const nextKey = allLessons.find(
    (item) => !store[`${item.moduleSlug}/${item.lessonSlug}`]?.completed
  );
  const nextHref = nextKey
    ? `/student/kursus/${courseSlug}/${nextKey.moduleSlug}/${nextKey.lessonSlug}`
    : null;

  const completed = allLessons.filter(
    (item) => store[`${item.moduleSlug}/${item.lessonSlug}`]?.completed
  ).length;
  const total = allLessons.length;

  return (
    <section aria-labelledby="mission-map" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-navy">PETA MISI</p>
          <h2 id="mission-map" className="font-display mt-1 text-xl font-extrabold text-ink">
            Petualangan Little Speakers
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            {ready ? `${completed} dari ${total} misi selesai.` : "Memuat petualanganmu..."}
          </p>
        </div>
        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-sand px-4 py-2.5 text-sm font-extrabold text-ink transition hover:bg-sand-deep"
          >
            <PlayCircle size={16} /> Lanjutkan misi
          </Link>
        ) : (
          <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-cyan/10 px-4 py-2.5 text-sm font-extrabold text-cyan-deep">
            <CheckCircle2 size={16} /> Semua misi selesai
          </span>
        )}
      </div>

      <div className="space-y-4">
        {modules.map((module, index) => {
          const style = STAGE_STYLE[index % STAGE_STYLE.length];
          const StageIcon = style.icon;
          const moduleLessons = module.lessons.map((lesson) => {
            const key = `${module.slug}/${lesson.slug}`;
            return { lesson, key, progress: store[key] };
          });
          const done = moduleLessons.filter((item) => item.progress?.completed).length;
          const percent = module.lessons.length > 0 ? Math.round((done / module.lessons.length) * 100) : 0;
          const stageComplete = module.lessons.length > 0 && done === module.lessons.length;

          return (
            <div
              key={module.slug}
              className={cn(
                "relative overflow-hidden rounded-3xl border bg-paper p-4 sm:p-5",
                style.border
              )}
            >
              <div className={cn("absolute inset-x-0 top-0 h-1.5", style.soft)} />
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                    style.chip
                  )}
                >
                  <StageIcon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-[11px] font-extrabold tracking-wide", style.text)}>
                      TAHAP {index + 1}
                    </span>
                    <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold text-ink/50">
                      {module.sessions}
                    </span>
                    {stageComplete ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-extrabold text-cyan-deep">
                        <CheckCircle2 size={11} /> TUNTAS
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-ink">{module.title}</h3>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-extrabold text-ink">
                    {done}
                    <span className="text-sm text-ink/40">/{module.lessons.length}</span>
                  </p>
                  <p className="text-[10px] font-bold text-ink/45">misi</p>
                </div>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-ink/60">{module.objective}</p>

              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-ivory"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-label={`Progres tahap ${module.title} ${percent} persen`}
              >
                <div
                  className="h-full rounded-full bg-sand transition-[width] duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {moduleLessons.map(({ lesson, progress }, lessonIndex) => {
                  const doneLesson = Boolean(progress?.completed);
                  const isNext = nextKey?.moduleSlug === module.slug && nextKey?.lessonSlug === lesson.slug;
                  const stars =
                    (doneLesson ? STARS_PER_MISSION : 0) +
                    (typeof progress?.quizScore === "number" ? progress.quizScore * STARS_PER_CORRECT : 0);

                  return (
                    <Link
                      key={lesson.slug}
                      href={`/student/kursus/${courseSlug}/${module.slug}/${lesson.slug}`}
                      className={cn(
                        "group flex min-h-[96px] flex-col justify-between rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md",
                        doneLesson
                          ? "border-cyan/40 bg-cyan/5"
                          : isNext
                            ? "border-sand bg-sand-soft/40 ring-2 ring-sand/40"
                            : "border-sand/30 bg-ivory/60"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                            doneLesson
                              ? "bg-cyan text-white"
                              : isNext
                                ? "bg-sand text-ink"
                                : "bg-paper text-ink/45"
                          )}
                        >
                          {doneLesson ? <CheckCircle2 size={16} /> : lessonIndex + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold leading-snug text-ink">{lesson.title}</p>
                          <p className="mt-0.5 text-[10px] font-semibold text-ink/45">
                            {lesson.duration} menit
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-ink/55">
                          <Star
                            size={12}
                            className={stars > 0 ? "text-sand-deep" : "text-ink/25"}
                            fill={stars > 0 ? "currentColor" : "none"}
                          />
                          {stars > 0 ? `${stars} bintang` : doneLesson ? "Selesai" : "Belum dimulai"}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-extrabold",
                            isNext ? "text-sand-deep" : "text-navy opacity-0 group-hover:opacity-100"
                          )}
                        >
                          {isNext ? "LANJUT" : "BUKA"} <ArrowRight size={11} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 rounded-xl bg-ivory px-3 py-2 text-[11px] text-ink/55">
        <Map size={13} className="shrink-0 text-navy" />
        Setiap misi selesai = 10 bintang. Setiap jawaban kuis benar = 3 bintang.
      </p>
    </section>
  );
}
