import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Layers,
  LibraryBig,
  Mic,
  Target,
} from "lucide-react";
import { Badge, Card } from "@/app/components/ui";
import { flattenLessons, getCourse, totalLessons } from "@/lib/course-content";
import MissionMap from "@/app/components/kids/MissionMap";
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

      <MissionMap
        courseSlug={course.slug}
        modules={course.modules.map((module) => ({
          slug: module.slug,
          title: module.title,
          sessions: module.sessions,
          objective: module.objective,
          lessons: module.lessons.map((lesson) => ({
            slug: lesson.slug,
            title: lesson.title,
            duration: lesson.duration,
            format: lesson.format,
          })),
        }))}
      />

      <Card className="rounded-2xl border-navy bg-navy text-ivory">
        <div className="flex items-start gap-3">
          <Mic size={20} className="mt-0.5 shrink-0 text-sand" />
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-sand">FINAL PROJECT</p>
            <h2 className="font-display mt-1 text-xl font-extrabold">
              Show & Tell 60 Detik
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ivory/75">
              Tunjukkan satu benda favorit, ceritakan dalam 4 kalimat, lalu jawab
              satu pertanyaan. Fokusnya keberanian dan kejelasan, bukan hafalan.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-ivory/80">
              <span className="rounded-full border border-ivory/20 px-2.5 py-1">60 detik</span>
              <span className="rounded-full border border-ivory/20 px-2.5 py-1">1 benda favorit</span>
              <span className="rounded-full border border-ivory/20 px-2.5 py-1">4 kalimat</span>
              <span className="rounded-full border border-ivory/20 px-2.5 py-1">1 pertanyaan</span>
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
        <Layers size={15} className="mb-1 inline text-navy" /> Semua misi mengikuti alur
        kelas 60 menit: sapaan, contoh, latihan bersama, giliran bicara, umpan balik,
        lalu misi di rumah.
      </div>
    </div>
  );
}
