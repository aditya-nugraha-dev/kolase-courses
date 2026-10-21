import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Layers,
  LibraryBig,
  Mic,
  Target,
} from "lucide-react";
import { Badge, Card } from "@/app/components/ui";
import { flattenLessons, getCourse, totalLessons } from "@/lib/course-content";
import CourseProgress from "../CourseProgress";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  return {
    title: course ? `${course.title} — KOLASE` : "Kursus — KOLASE",
    description: course?.promise,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  const lessons = flattenLessons(course);
  const lessonKeys = lessons.map((item) => item.key);

  return (
    <div className="space-y-5">
      <Link
        href="/student/kursus"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-navy hover:underline"
      >
        <ArrowLeft size={15} /> Kembali ke Kursus Saya
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="navy">{course.level}</Badge>
          <Badge tone="sand">{course.modules.length} modul</Badge>
          <Badge tone="slate">{totalLessons(course)} lesson</Badge>
        </div>
        <h1 className="font-display mt-3 text-2xl font-extrabold text-ink">{course.title}</h1>
        <p className="text-sm font-bold text-navy">{course.subtitle}</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">{course.promise}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink/55">
          <Clock3 size={14} /> {course.format}
        </p>
      </header>

      <CourseProgress courseSlug={course.slug} lessonKeys={lessonKeys} />

      <Card className="rounded-2xl">
        <h2 className="font-display flex items-center gap-2 text-lg font-extrabold text-ink">
          <Target size={18} className="text-navy" /> Setelah kursus ini
        </h2>
        <ul className="mt-3 space-y-2">
          {course.outcomes.map((outcome) => (
            <li key={outcome} className="flex items-start gap-2 text-sm leading-relaxed text-ink/75">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sand-deep" />
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </Card>

      <section aria-labelledby="modules" className="space-y-3">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-navy">STRUKTUR</p>
          <h2 id="modules" className="font-display mt-1 text-xl font-extrabold text-ink">
            Modul dan lesson
          </h2>
        </div>

        {course.modules.map((module, moduleIndex) => (
          <Card key={module.slug} className="rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand-soft font-display text-base font-extrabold text-ink">
                {moduleIndex + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="slate">{module.sessions}</Badge>
                  <span className="text-[11px] font-bold text-ink/45">
                    {module.lessons.length} lesson
                  </span>
                </div>
                <h3 className="font-display mt-2 text-lg font-extrabold text-ink">{module.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/70">{module.objective}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-ivory px-4 py-3">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-ink/65">
                <ClipboardCheck size={15} className="mt-0.5 shrink-0 text-navy" />
                <span>
                  <span className="font-extrabold text-ink">Exit performance: </span>
                  {module.exit}
                </span>
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {module.lessons.map((lesson, lessonIndex) => {
                const href = `/student/kursus/${course.slug}/${module.slug}/${lesson.slug}`;
                return (
                  <Link
                    key={lesson.slug}
                    href={href}
                    className="group flex items-start gap-3 rounded-xl border border-sand/40 bg-paper px-4 py-3 transition hover:border-navy hover:bg-ivory"
                  >
                    <span className="mt-0.5 font-display text-sm font-extrabold text-sand-deep">
                      {moduleIndex + 1}.{lessonIndex + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-ink group-hover:text-navy">
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-ink/55">
                        {lesson.duration} menit • {lesson.format}
                      </span>
                    </span>
                    <ArrowRight
                      size={15}
                      className="mt-0.5 shrink-0 text-ink/30 transition group-hover:text-navy"
                    />
                  </Link>
                );
              })}
            </div>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl border-navy bg-navy text-ivory">
        <div className="flex items-start gap-3">
          <Mic size={20} className="mt-0.5 shrink-0 text-sand" />
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-sand">FINAL PROJECT</p>
            <h2 className="font-display mt-1 text-xl font-extrabold">
              The 2-Minute Unscripted Showcase
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ivory/75">
              Bicara 2 menit tanpa naskah, lalu jawab 2 pertanyaan susulan. Outline
              maksimal 5 kata kunci. Fokusnya bukan hafalan, tapi kemampuan menjaga
              alur saat tekanan naik.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-ivory/80">
              <span className="rounded-full border border-ivory/20 px-2.5 py-1">2 menit</span>
              <span className="rounded-full border border-ivory/20 px-2.5 py-1">Tanpa naskah</span>
              <span className="rounded-full border border-ivory/20 px-2.5 py-1">2 pertanyaan</span>
              <span className="rounded-full border border-ivory/20 px-2.5 py-1">Rubrik 5 kriteria</span>
            </div>
          </div>
        </div>
      </Card>

      <section aria-labelledby="resources">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-navy">RESOURCE LIBRARY</p>
            <h2 id="resources" className="font-display mt-1 text-xl font-extrabold text-ink">
              Materi pendukung
            </h2>
          </div>
          <LibraryBig className="hidden text-sand-deep sm:block" size={24} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {course.resources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/student/kursus/${course.slug}/${resource.moduleSlug}/${resource.lessonSlug}`}
              className="group rounded-2xl border border-sand/40 bg-paper p-4 transition hover:border-navy hover:bg-ivory"
            >
              <Badge tone="sand">{resource.type}</Badge>
              <h3 className="mt-2 text-sm font-extrabold text-ink group-hover:text-navy">
                {resource.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/65">{resource.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-navy">
                Buka di lesson <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-2xl bg-ivory p-4 text-xs leading-relaxed text-ink/60">
        <Layers size={15} className="mb-1 inline text-navy" /> Semua lesson mengikuti alur
        live 60 menit: retrieval, input, controlled practice, speaking task, feedback, lalu
        mission.
      </div>
    </div>
  );
}
