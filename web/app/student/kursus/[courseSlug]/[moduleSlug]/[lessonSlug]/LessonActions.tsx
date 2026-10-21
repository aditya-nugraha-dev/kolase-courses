"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Undo2 } from "lucide-react";
import { Badge, Button } from "@/app/components/ui";
import {
  getLessonProgress,
  PROGRESS_EVENT,
  setLessonCompleted,
} from "@/lib/course-progress";

export default function LessonActions({
  courseSlug,
  lessonKey,
  selfCheck,
}: {
  courseSlug: string;
  lessonKey: string;
  selfCheck: string[];
}) {
  const [checked, setChecked] = useState<boolean[]>(() => selfCheck.map(() => false));
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const sync = () => {
      const progress = getLessonProgress(courseSlug, lessonKey);
      setCompleted(Boolean(progress?.completed));
      if (progress?.completed) setChecked(selfCheck.map(() => true));
    };
    sync();
    window.addEventListener(PROGRESS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [courseSlug, lessonKey, selfCheck]);

  const allChecked = selfCheck.length === 0 || checked.every(Boolean);

  const toggle = (index: number) => {
    setChecked((current) => current.map((value, i) => (i === index ? !value : value)));
  };

  const complete = () => {
    setLessonCompleted(courseSlug, lessonKey, true);
    setCompleted(true);
  };

  const undo = () => {
    setLessonCompleted(courseSlug, lessonKey, false);
    setCompleted(false);
  };

  return (
    <div className="rounded-2xl border border-sand/40 bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold text-ink">Self-check</h3>
        {completed ? <Badge tone="green">SELESAI</Badge> : <Badge tone="slate">BELUM SELESAI</Badge>}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ink/60">
        Jujur saja. Checklist ini alat bantu, bukan ujian.
      </p>

      <div className="mt-3 space-y-2">
        {selfCheck.map((item, index) => (
          <label
            key={item}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-sand/30 bg-ivory px-4 py-3 text-sm leading-relaxed text-ink/75 transition hover:border-navy"
          >
            <input
              type="checkbox"
              checked={checked[index] ?? false}
              onChange={() => toggle(index)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-navy"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        {completed ? (
          <Button variant="secondary" onClick={undo}>
            <Undo2 size={15} /> Batalkan status selesai
          </Button>
        ) : (
          <Button onClick={complete} disabled={!allChecked}>
            <CheckCircle2 size={16} /> Tandai lesson selesai
          </Button>
        )}
        {!completed && !allChecked ? (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink/50">
            <Circle size={10} /> Centang semua poin dulu.
          </p>
        ) : null}
      </div>
    </div>
  );
}
