"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Compass,
  Crown,
  Flame,
  Hammer,
  MessageCircle,
  Mic,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  BADGES,
  computeRewards,
  PROGRESS_EVENT,
  REWARD_EVENT,
  STARS_PER_LEVEL,
  type BadgeId,
  type RewardSummary,
} from "@/lib/rewards";

const BADGE_ICON: Record<BadgeId, typeof Star> = {
  "first-hello": Sparkles,
  explorer: Compass,
  builder: Hammer,
  speaker: Mic,
  communicator: MessageCircle,
  "quiz-whiz": Brain,
  "perfect-quiz": Trophy,
  "three-day-streak": Flame,
  "star-collector": Star,
  "all-missions": Crown,
};

const BADGE_TONE: Record<string, string> = {
  cyan: "bg-cyan/15 text-cyan-deep border-cyan/30",
  violet: "bg-violet-soft text-violet-deep border-violet/25",
  sand: "bg-sand-soft text-ink border-sand/50",
  navy: "bg-navy text-ivory border-navy",
};

function useRewards(): RewardSummary {
  const [summary, setSummary] = useState<RewardSummary>(() => computeRewards());
  useEffect(() => {
    const update = () => setSummary(computeRewards());
    update();
    window.addEventListener(REWARD_EVENT, update);
    window.addEventListener(PROGRESS_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(REWARD_EVENT, update);
      window.removeEventListener(PROGRESS_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return summary;
}

export function RewardBar({ className }: { className?: string }) {
  const r = useRewards();
  const percent = Math.round((r.starsIntoLevel / STARS_PER_LEVEL) * 100);

  return (
    <section
      aria-label="Bintang dan level belajar"
      className={cn(
        "overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy via-violet-deep to-cyan-deep p-4 text-ivory shadow-lg sm:p-5",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand text-ink shadow-md">
            <Star size={24} fill="currentColor" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-ivory/70">
              LEVEL {r.level}
            </p>
            <p className="font-display text-lg font-extrabold leading-tight sm:text-xl">
              {r.levelTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-extrabold">
            <Star size={14} className="text-sand" fill="currentColor" /> {r.stars}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-extrabold">
            <Flame size={14} className="text-sand" /> {r.streakDays} hari
          </span>
        </div>
      </div>

      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-white/20"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Progres ke level berikutnya ${percent} persen`}
      >
        <div
          className="h-full rounded-full bg-sand transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-ivory/80">
        <span>
          {r.nextLevelTitle
            ? `${STARS_PER_LEVEL - r.starsIntoLevel} bintang lagi menuju ${r.nextLevelTitle}`
            : "Level tertinggi tercapai - luar biasa!"}
        </span>
        <span>
          {r.completedMissions}/{r.totalMissions} misi selesai
        </span>
      </div>

      {r.nextBadge ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-black/15 px-3 py-2">
          <Trophy size={15} className="shrink-0 text-sand" />
          <p className="text-[11px] leading-snug text-ivory/85">
            <span className="font-extrabold text-ivory">Badge berikutnya: {r.nextBadge.title}. </span>
            {r.nextBadge.hint}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export function BadgeShelf({ className }: { className?: string }) {
  const r = useRewards();
  const earned = new Set(r.earnedBadges);

  return (
    <section aria-labelledby="badges" className={cn("rounded-2xl border border-sand/40 bg-paper p-4 sm:p-5", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-navy">KOLEKSI BADGE</p>
          <h2 id="badges" className="font-display mt-1 text-xl font-extrabold text-ink">
            {r.earnedBadges.length} dari {BADGES.length} badge
          </h2>
        </div>
        <Trophy className="hidden text-sand-deep sm:block" size={26} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {BADGES.map((badge) => {
          const Icon = BADGE_ICON[badge.id];
          const has = earned.has(badge.id);
          return (
            <div
              key={badge.id}
              className={cn(
                "flex flex-col items-center rounded-2xl border px-2 py-3 text-center transition",
                has
                  ? BADGE_TONE[badge.tone]
                  : "border-dashed border-ink/15 bg-ivory/60 text-ink/35"
              )}
              title={has ? badge.description : badge.hint}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  has ? "bg-white/70" : "bg-ink/5"
                )}
              >
                <Icon size={19} />
              </span>
              <span className="mt-1.5 text-[11px] font-extrabold leading-tight">{badge.title}</span>
              <span className="mt-0.5 line-clamp-2 text-[10px] leading-tight opacity-70">
                {has ? badge.description : badge.hint}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
