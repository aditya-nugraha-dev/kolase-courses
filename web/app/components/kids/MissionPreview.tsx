import Link from "next/link";
import {
  Compass,
  Hammer,
  Lock,
  MessageCircle,
  Mic,
  Star,
} from "lucide-react";
import { COURSES } from "@/lib/course-content";

const STAGE = [
  {
    icon: Compass,
    ring: "bg-cyan/15 text-cyan-deep",
    bar: "bg-cyan",
    label: "text-cyan-deep",
  },
  {
    icon: Hammer,
    ring: "bg-violet-soft text-violet-deep",
    bar: "bg-violet",
    label: "text-violet-deep",
  },
  {
    icon: Mic,
    ring: "bg-sand-soft text-ink",
    bar: "bg-sand",
    label: "text-ink",
  },
  {
    icon: MessageCircle,
    ring: "bg-violet-soft text-navy",
    bar: "bg-navy",
    label: "text-navy",
  },
];

export default function MissionPreview() {
  const course = COURSES[0];
  if (!course) return null;

  return (
    <section aria-labelledby="mission-preview" className="mt-10">
      <div className="text-center">
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">DI DALAM LMS</p>
        <h2 id="mission-preview" className="font-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Peta 12 Misi Little Speakers
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
          Empat tahap, dua belas misi pendek. Anak selalu tahu langkah berikutnya,
          dan setiap misi selesai mendapat bintang.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {course.modules.map((module, index) => {
          const style = STAGE[index % STAGE.length];
          const Icon = style.icon;
          return (
            <div key={module.slug} className="overflow-hidden rounded-3xl border border-sand/40 bg-paper shadow-sm">
              <div className={`h-1.5 ${style.bar}`} />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${style.ring}`}>
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className={`text-[11px] font-extrabold tracking-wide ${style.label}`}>
                      TAHAP {index + 1} - {module.sessions}
                    </p>
                    <h3 className="font-display text-lg font-extrabold text-ink">{module.title}</h3>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink/60">{module.objective}</p>

                <ul className="mt-3 space-y-1.5">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.slug} className="flex items-center gap-2 rounded-xl bg-ivory/70 px-3 py-2">
                      <Lock size={13} className="shrink-0 text-ink/30" />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink/80">
                        {lesson.title}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold text-ink/45">
                        <Star size={11} /> 10
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-navy to-violet-deep p-5 text-ivory sm:flex-row">
        <div>
          <p className="font-display text-lg font-extrabold">Masuk untuk membuka misi</p>
          <p className="mt-0.5 text-xs text-ivory/75">
            Kumpulkan bintang, jaga streak, dan buka badge Little Legend.
          </p>
        </div>
        <Link
          href="/masuk?next=/student/kursus"
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-xl bg-sand px-5 py-3 text-sm font-extrabold text-ink hover:bg-sand-deep"
        >
          Masuk ke LMS
        </Link>
      </div>
    </section>
  );
}
