"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { countCompleted, PROGRESS_EVENT } from "@/lib/course-progress";

export default function CourseProgress({
  courseSlug,
  lessonKeys,
}: {
  courseSlug: string;
  lessonKeys: string[];
}) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const update = () => setDone(countCompleted(courseSlug, lessonKeys));
    update();
    window.addEventListener(PROGRESS_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [courseSlug, lessonKeys]);

  const total = lessonKeys.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-ivory p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-navy">
            <CheckCircle2 size={14} /> Progress kursus
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {done} dari {total} misi selesai
          </p>
        </div>
        <span className="font-display text-2xl font-extrabold text-navy">{percent}%</span>
      </div>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Progress kursus ${percent} persen`}
      >
        <div
          className="h-full rounded-full bg-sand-deep transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-ink/50">
        Progress tersimpan di akunmu dan disinkronkan ke perangkat lain saat online.
      </p>
    </div>
  );
}
