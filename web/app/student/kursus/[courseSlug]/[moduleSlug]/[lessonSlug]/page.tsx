import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  Globe2,
  Mic,
  Quote,
  Sparkles,
  Target,
  Volume2,
} from "lucide-react";
import { Badge, Card } from "@/app/components/ui";
import { flattenLessons, getCourse, getLesson } from "@/lib/course-content";
import LessonActions from "./LessonActions";
import QuizPanel from "./QuizPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const course = getCourse(courseSlug);
  const found = course ? getLesson(course, moduleSlug, lessonSlug) : undefined;
  return {
    title: found ? `${found.lesson.title} — KOLASE` : "Lesson — KOLASE",
    description: found?.lesson.objective,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  const found = getLesson(course, moduleSlug, lessonSlug);
  if (!found) notFound();

  const { module, lesson } = found;
  const flat = flattenLessons(course);
  const flatIndex = flat.findIndex(
    (item) => item.moduleSlug === moduleSlug && item.lesson.slug === lessonSlug
  );
  const current = flat[flatIndex];
  const previous = flatIndex > 0 ? flat[flatIndex - 1] : undefined;
  const next = flatIndex >= 0 && flatIndex < flat.length - 1 ? flat[flatIndex + 1] : undefined;
  const lessonKey = `${moduleSlug}/${lessonSlug}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/student/kursus/${course.slug}`}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-navy hover:underline"
        >
          <ArrowLeft size={15} /> {course.title}
        </Link>
        <span className="text-ink/25">/</span>
        <span className="text-sm font-semibold text-ink/50">{module.title}</span>
      </div>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="navy">
            Modul {current?.moduleNumber ?? 1} • Lesson {current?.lessonNumber ?? 1}
          </Badge>
          <Badge tone="sand">{lesson.duration} menit</Badge>
          <Badge tone="slate">{lesson.format}</Badge>
        </div>
        <h1 className="font-display mt-3 text-2xl font-extrabold leading-tight text-ink">
          {lesson.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">{lesson.objective}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="rounded-2xl">
            <h2 className="font-display flex items-center gap-2 text-lg font-extrabold text-ink">
              <BookOpen size={18} className="text-navy" /> Frasa kunci
            </h2>
            <p className="mt-1 text-xs text-ink/55">
              Pakai minimal dua frasa ini di speaking mission.
            </p>
            <div className="mt-3 space-y-2">
              {lesson.keyPhrases.map((item) => (
                <div
                  key={item.phrase}
                  className="rounded-xl border border-sand/30 bg-ivory px-4 py-3"
                >
                  <p className="flex items-start gap-2 text-sm font-extrabold text-ink">
                    <Quote size={14} className="mt-0.5 shrink-0 text-sand-deep" />
                    {item.phrase}
                  </p>
                  <p className="mt-1 pl-5 text-xs leading-relaxed text-ink/60">{item.meaning}</p>
                </div>
              ))}
            </div>
          </Card>

          {lesson.deepDive ? (
            <Card className="rounded-2xl">
              <Badge tone="sand">{lesson.deepDive.label}</Badge>
              <h2 className="font-display mt-2 text-lg font-extrabold text-ink">
                {lesson.deepDive.title}
              </h2>
              <div className="mt-2 space-y-2">
                {lesson.deepDive.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink/70">
                    {paragraph}
                  </p>
                ))}
              </div>
              {lesson.deepDive.bullets ? (
                <ul className="mt-3 space-y-1.5">
                  {lesson.deepDive.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm leading-relaxed text-ink/75"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sand-deep" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {lesson.deepDive.example ? (
                <p className="mt-3 rounded-xl bg-ivory px-4 py-3 text-sm italic leading-relaxed text-ink/75">
                  “{lesson.deepDive.example}”
                </p>
              ) : null}
              {lesson.deepDive.takeaway ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-extrabold text-navy">
                  <Sparkles size={14} /> {lesson.deepDive.takeaway}
                </p>
              ) : null}
            </Card>
          ) : null}

          {lesson.glossary ? (
            <Card className="rounded-2xl">
              <h2 className="font-display flex items-center gap-2 text-lg font-extrabold text-ink">
                <Globe2 size={18} className="text-navy" /> Glosarium
              </h2>
              <div className="mt-3 divide-y divide-sand/30">
                {lesson.glossary.map((term) => (
                  <div key={term.term} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-extrabold text-ink">{term.term}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-navy/70">
                      <Volume2 size={12} /> /{term.pronunciation}/
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/65">{term.meaning}</p>
                    <p className="mt-1 text-xs italic leading-relaxed text-ink/55">
                      “{term.example}”
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {lesson.quiz ? (
            <section aria-labelledby="quiz">
              <div className="mb-2">
                <p className="text-xs font-extrabold tracking-[0.2em] text-navy">CEK PEMAHAMAN</p>
                <h2 id="quiz" className="font-display mt-1 text-xl font-extrabold text-ink">
                  Kuis singkat
                </h2>
              </div>
              <QuizPanel courseSlug={course.slug} lessonKey={lessonKey} questions={lesson.quiz} />
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card className="rounded-2xl bg-navy text-ivory">
            <h2 className="font-display flex items-center gap-2 text-lg font-extrabold">
              <Mic size={18} className="text-sand" /> Speaking mission
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ivory/80">{lesson.mission}</p>
            <div className="mt-3 rounded-xl bg-ivory/10 p-3">
              <p className="text-[10px] font-extrabold tracking-wide text-sand">CONTOH</p>
              <p className="mt-1 text-xs italic leading-relaxed text-ivory/75">
                “{lesson.missionExample}”
              </p>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ivory/55">
              <Clock3 size={12} /> Rekam sekali, dengarkan, lalu rekam ulang.
            </p>
          </Card>

          <LessonActions
            courseSlug={course.slug}
            lessonKey={lessonKey}
            selfCheck={lesson.selfCheck}
          />

          <Card className="rounded-2xl">
            <h2 className="font-display flex items-center gap-2 text-base font-extrabold text-ink">
              <Target size={16} className="text-navy" /> Exit performance
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink/65">{module.exit}</p>
          </Card>
        </aside>
      </div>

      <nav className="flex flex-col gap-3 border-t border-sand/40 pt-4 sm:flex-row sm:items-stretch sm:justify-between">
        {previous ? (
          <Link
            href={`/student/kursus/${course.slug}/${previous.moduleSlug}/${previous.lesson.slug}`}
            className="group flex min-h-[56px] items-center gap-3 rounded-xl border border-sand/40 bg-paper px-4 py-3 transition hover:border-navy"
          >
            <ArrowLeft size={16} className="shrink-0 text-ink/40 group-hover:text-navy" />
            <span>
              <span className="block text-[10px] font-extrabold tracking-wide text-ink/45">
                SEBELUMNYA
              </span>
              <span className="block text-sm font-bold text-ink">{previous.lesson.title}</span>
            </span>
          </Link>
        ) : (
          <Link
            href={`/student/kursus/${course.slug}`}
            className="group flex min-h-[56px] items-center gap-3 rounded-xl border border-sand/40 bg-paper px-4 py-3 transition hover:border-navy"
          >
            <ArrowLeft size={16} className="shrink-0 text-ink/40 group-hover:text-navy" />
            <span className="text-sm font-bold text-ink">Kembali ke modul</span>
          </Link>
        )}

        {next ? (
          <Link
            href={`/student/kursus/${course.slug}/${next.moduleSlug}/${next.lesson.slug}`}
            className="group flex min-h-[56px] items-center justify-between gap-3 rounded-xl border border-sand/40 bg-paper px-4 py-3 text-right transition hover:border-navy sm:min-w-[260px]"
          >
            <span>
              <span className="block text-[10px] font-extrabold tracking-wide text-ink/45">
                BERIKUTNYA
              </span>
              <span className="block text-sm font-bold text-ink">{next.lesson.title}</span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-ink/40 group-hover:text-navy" />
          </Link>
        ) : (
          <Link
            href={`/student/kursus/${course.slug}`}
            className="group flex min-h-[56px] items-center justify-end gap-3 rounded-xl border border-sand/40 bg-paper px-4 py-3 text-right transition hover:border-navy sm:min-w-[260px]"
          >
            <span className="text-sm font-bold text-ink">Selesai. Kembali ke kursus</span>
            <ArrowRight size={16} className="shrink-0 text-ink/40 group-hover:text-navy" />
          </Link>
        )}
      </nav>
    </div>
  );
}
