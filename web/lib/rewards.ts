import { COURSES, flattenLessons } from "./course-content";
import { getProgressOwner, loadProgress, PROGRESS_EVENT } from "./course-progress";

// Sistem reward ramah anak: bintang, level, streak, dan badge.
// Bintang & badge DIHITUNG dari progres (bukan ditambah manual) supaya
// tidak bisa dobel saat murid membuka ulang lesson. Hanya streak yang
// disimpan terpisah karena butuh riwayat hari aktif.

export const REWARD_EVENT = "kolase-rewards";
export const REWARD_KEY = "kolase.rewards.v1";

export type BadgeId =
  | "first-hello"
  | "explorer"
  | "builder"
  | "speaker"
  | "communicator"
  | "quiz-whiz"
  | "perfect-quiz"
  | "three-day-streak"
  | "star-collector"
  | "all-missions";

export type BadgeDef = {
  id: BadgeId;
  title: string;
  description: string;
  hint: string;
  tone: "cyan" | "violet" | "sand" | "navy";
};

export const BADGES: BadgeDef[] = [
  {
    id: "first-hello",
    title: "First Hello",
    description: "Menyelesaikan misi pertama.",
    hint: "Selesaikan 1 misi apa saja.",
    tone: "cyan",
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Menuntaskan tahap Explorer.",
    hint: "Selesaikan semua misi Explorer.",
    tone: "cyan",
  },
  {
    id: "builder",
    title: "Builder",
    description: "Menuntaskan tahap Builder.",
    hint: "Selesaikan semua misi Builder.",
    tone: "violet",
  },
  {
    id: "speaker",
    title: "Speaker",
    description: "Menuntaskan tahap Speaker.",
    hint: "Selesaikan semua misi Speaker.",
    tone: "sand",
  },
  {
    id: "communicator",
    title: "Communicator",
    description: "Menuntaskan tahap Communicator.",
    hint: "Selesaikan semua misi Communicator.",
    tone: "navy",
  },
  {
    id: "quiz-whiz",
    title: "Quiz Whiz",
    description: "Menjawab kuis dengan rata-rata 80% atau lebih.",
    hint: "Kumpulkan minimal 4 jawaban benar di kuis.",
    tone: "violet",
  },
  {
    id: "perfect-quiz",
    title: "Perfect Quiz",
    description: "Mendapat skor penuh di satu kuis.",
    hint: "Jawab semua soal benar dalam satu kuis.",
    tone: "sand",
  },
  {
    id: "three-day-streak",
    title: "3-Day Streak",
    description: "Belajar 3 hari berturut-turut.",
    hint: "Buka LMS tiga hari berurutan.",
    tone: "cyan",
  },
  {
    id: "star-collector",
    title: "Star Collector",
    description: "Mengumpulkan 100 bintang.",
    hint: "Kumpulkan 100 bintang dari misi dan kuis.",
    tone: "sand",
  },
  {
    id: "all-missions",
    title: "Little Legend",
    description: "Menuntaskan seluruh 12 misi Little Speakers.",
    hint: "Selesaikan semua misi di semua tahap.",
    tone: "navy",
  },
];

export const BADGE_BY_ID: Record<BadgeId, BadgeDef> = BADGES.reduce(
  (map, badge) => {
    map[badge.id] = badge;
    return map;
  },
  {} as Record<BadgeId, BadgeDef>
);

export const LEVELS = [
  "Word Explorer",
  "Sentence Builder",
  "Brave Speaker",
  "Star Communicator",
  "Little Legend",
];

export const STARS_PER_LEVEL = 60;
export const STARS_PER_MISSION = 10;
export const STARS_PER_CORRECT = 3;

export type RewardSummary = {
  stars: number;
  maxStars: number;
  level: number;
  levelTitle: string;
  starsIntoLevel: number;
  starsForNextLevel: number;
  nextLevelTitle: string | null;
  completedMissions: number;
  totalMissions: number;
  quizCorrect: number;
  quizAnswered: number;
  quizPercent: number | null;
  streakDays: number;
  bestStreak: number;
  earnedBadges: BadgeId[];
  nextBadge: BadgeDef | null;
};

type RewardStore = {
  streakDays: number;
  bestStreak: number;
  lastVisit: string;
};

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function rewardKey(): string {
  const owner = getProgressOwner();
  return owner ? `${REWARD_KEY}:${owner}` : REWARD_KEY;
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayDiff(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00`);
  const b = Date.parse(`${to}T00:00:00`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

export function getRewardStore(): RewardStore {
  if (!hasWindow()) return { streakDays: 0, bestStreak: 0, lastVisit: "" };
  try {
    const raw = window.localStorage.getItem(rewardKey());
    if (!raw) return { streakDays: 0, bestStreak: 0, lastVisit: "" };
    const parsed = JSON.parse(raw) as Partial<RewardStore>;
    return {
      streakDays: typeof parsed.streakDays === "number" ? parsed.streakDays : 0,
      bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
      lastVisit: typeof parsed.lastVisit === "string" ? parsed.lastVisit : "",
    };
  } catch {
    return { streakDays: 0, bestStreak: 0, lastVisit: "" };
  }
}

// Dicatat sekali per hari saat murid membuka portal.
export function touchStreak(): RewardStore {
  if (!hasWindow()) return getRewardStore();
  const today = todayKey();
  const store = getRewardStore();
  if (store.lastVisit === today) return store;

  const gap = store.lastVisit ? dayDiff(store.lastVisit, today) : Number.POSITIVE_INFINITY;
  const streakDays = gap === 1 ? store.streakDays + 1 : 1;
  const next: RewardStore = {
    streakDays,
    bestStreak: Math.max(store.bestStreak, streakDays),
    lastVisit: today,
  };
  try {
    window.localStorage.setItem(rewardKey(), JSON.stringify(next));
  } catch {
    /* localStorage diblokir: streak hanya berlaku di sesi ini */
  }
  window.dispatchEvent(new Event(REWARD_EVENT));
  return next;
}

export function computeRewards(): RewardSummary {
  const course = COURSES[0];
  const lessons = flattenLessons(course);
  const store = loadProgress()[course.slug] ?? {};
  const streak = getRewardStore();

  let completedMissions = 0;
  let quizCorrect = 0;
  let quizAnswered = 0;
  let totalQuizQuestions = 0;
  let hasPerfectQuiz = false;

  for (const item of lessons) {
    const progress = store[item.key];
    totalQuizQuestions += item.lesson.quiz?.length ?? 0;
    if (progress?.completed) completedMissions += 1;
    if (
      typeof progress?.quizScore === "number" &&
      typeof progress?.quizTotal === "number" &&
      progress.quizTotal > 0
    ) {
      quizCorrect += progress.quizScore;
      quizAnswered += progress.quizTotal;
    }
    if (
      typeof progress?.quizScore === "number" &&
      typeof progress?.quizTotal === "number" &&
      progress.quizTotal > 0 &&
      progress.quizScore === progress.quizTotal
    ) {
      hasPerfectQuiz = true;
    }
  }

  const stars = completedMissions * STARS_PER_MISSION + quizCorrect * STARS_PER_CORRECT;
  const maxStars = lessons.length * STARS_PER_MISSION + totalQuizQuestions * STARS_PER_CORRECT;
  const level = Math.min(LEVELS.length, Math.floor(stars / STARS_PER_LEVEL) + 1);
  const starsIntoLevel = stars % STARS_PER_LEVEL;
  const isMaxLevel = level >= LEVELS.length;
  const streakDays = streak.streakDays;

  const earned: BadgeId[] = [];
  if (completedMissions >= 1) earned.push("first-hello");
  for (const [index, module] of course.modules.entries()) {
    const keys = module.lessons.map((lesson) => `${module.slug}/${lesson.slug}`);
    const allDone = keys.every((key) => Boolean(store[key]?.completed));
    if (!allDone) continue;
    const id = (["explorer", "builder", "speaker", "communicator"] as const)[index];
    if (id) earned.push(id);
  }
  if (quizAnswered >= 4 && quizCorrect / quizAnswered >= 0.8) earned.push("quiz-whiz");
  if (hasPerfectQuiz) earned.push("perfect-quiz");
  if (streakDays >= 3) earned.push("three-day-streak");
  if (stars >= 100) earned.push("star-collector");
  if (completedMissions === lessons.length && lessons.length > 0) earned.push("all-missions");

  const nextBadge = BADGES.find((badge) => !earned.includes(badge.id)) ?? null;

  return {
    stars,
    maxStars,
    level,
    levelTitle: LEVELS[level - 1] ?? LEVELS[0],
    starsIntoLevel: isMaxLevel ? STARS_PER_LEVEL : starsIntoLevel,
    starsForNextLevel: STARS_PER_LEVEL,
    nextLevelTitle: isMaxLevel ? null : LEVELS[level] ?? null,
    completedMissions,
    totalMissions: lessons.length,
    quizCorrect,
    quizAnswered,
    quizPercent: quizAnswered > 0 ? Math.round((quizCorrect / quizAnswered) * 100) : null,
    streakDays,
    bestStreak: streak.bestStreak,
    earnedBadges: earned,
    nextBadge,
  };
}

export { PROGRESS_EVENT };
