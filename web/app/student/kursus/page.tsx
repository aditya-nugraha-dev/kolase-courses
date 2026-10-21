import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  LibraryBig,
  MessageSquare,
  Mic,
  Target,
} from "lucide-react";
import { Badge, Card } from "@/app/components/ui";
import { COURSES, flattenLessons, totalLessons } from "@/lib/course-content";
import CourseProgress from "./CourseProgress";

export const metadata: Metadata = {
  title: "Kursus Saya — KOLASE",
  description:
    "Modul, lesson, frasa kunci, kuis, dan resource library KOLASE dalam satu tempat.",
};

const LMS_FEATURES = [
  {
    icon: BookOpenCheck,
    title: "Modul terstruktur",
    body: "Setiap modul punya tujuan, exit performance, dan urutan lesson yang jelas.",
  },
  {
    icon: MessageSquare,
    title: "Frasa kunci",
    body: "Frasa yang langsung bisa dipakai, bukan daftar kosakata yang menggantung.",
  },
  {
    icon: Mic,
    title: "Speaking mission",
    body: "Setiap lesson berakhir dengan rekaman pendek dan contoh jawaban.",
  },
  {
    icon: ClipboardCheck,
    title: "Kuis + feedback",
    body: "Soal berbasis situasi, dengan penjelasan mengapa jawaban lain keliru.",
  },
  {
    icon: LibraryBig,
    title: "Glosarium",
    body: "Istilah teknis diterjemahkan ke bahasa sehari-hari, lengkap dengan contoh.",
  },
  {
    icon: Target,
    title: "Self-check",
    body: "Murid menilai sendiri sebelum menandai lesson selesai.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Learn",
    body: "Baca tujuan, frasa kunci, dan konteks pemakaiannya.",
  },
  {
    number: "02",
    title: "Practice",
    body: "Kerjakan kuis dan speaking mission. Rekam, lalu dengarkan ulang.",
  },
  {
    number: "03",
    title: "Show",
    body: "Tandai selesai setelah self-check. Lanjut ke lesson berikutnya.",
  },
];

export default function KursusPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">LEARNING HUB</p>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">Kursus Saya</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink/70">
          Modul, latihan, kuis, dan resource yang kamu pakai di kelas live. Semua
          materi disusun untuk dipakai, bukan cuma dibaca.
        </p>
      </header>

      {COURSES.map((course) => {
        const lessons = flattenLessons(course);
        const lessonKeys = lessons.map((item) => item.key);
        const firstLesson = lessons[0];

        return (
          <Card key={course.slug} className="rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="navy">{course.level}</Badge>
              <Badge tone="sand">{course.modules.length} modul</Badge>
              <Badge tone="slate">{totalLessons(course)} lesson</Badge>
            </div>
            <h2 className="font-display mt-3 text-xl font-extrabold text-ink">{course.title}</h2>
            <p className="text-sm font-bold text-navy">{course.subtitle}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">{course.promise}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink/55">
              <Clock3 size={14} /> {course.format}
            </p>

            <div className="mt-4">
              <CourseProgress courseSlug={course.slug} lessonKeys={lessonKeys} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/student/kursus/${course.slug}`}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory transition hover:bg-navy"
              >
                Buka kursus <ArrowRight size={16} />
              </Link>
              {firstLesson ? (
                <Link
                  href={`/student/kursus/${course.slug}/${firstLesson.moduleSlug}/${firstLesson.lesson.slug}`}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-sand bg-paper px-5 py-3 text-sm font-bold text-ink transition hover:border-ink"
                >
                  Mulai lesson 1
                </Link>
              ) : null}
            </div>
          </Card>
        );
      })}

      <section aria-labelledby="lms-features">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-navy">DI DALAM LMS</p>
            <h2 id="lms-features" className="font-display mt-1 text-xl font-extrabold text-ink">
              Apa yang kamu dapat
            </h2>
          </div>
          <GraduationCap className="hidden text-sand-deep sm:block" size={26} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {LMS_FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-sand/40 bg-paper p-4">
              <feature.icon size={18} className="text-navy" />
              <h3 className="mt-2 text-sm font-extrabold text-ink">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/65">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Card className="rounded-2xl bg-navy text-ivory">
        <p className="text-xs font-extrabold tracking-[0.2em] text-sand">RITME BELAJAR</p>
        <h2 className="font-display mt-1 text-xl font-extrabold">Learn, practice, show.</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="rounded-xl bg-ivory/10 p-4">
              <span className="font-display text-2xl font-extrabold text-sand">{step.number}</span>
              <h3 className="mt-1 text-sm font-extrabold">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ivory/75">{step.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-ivory/60">
          <CheckCircle2 size={14} /> Progress saat ini tersimpan di perangkat ini.
        </p>
      </Card>
    </div>
  );
}
