export type LessonProgress = {
  completed: boolean;
  quizScore?: number;
  quizTotal?: number;
  updatedAt: string;
};

export type ProgressStore = Record<string, Record<string, LessonProgress>>;

export const PROGRESS_EVENT = "kolase-progress";
export const PROGRESS_KEY = "kolase.course.progress.v1";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function loadProgress(): ProgressStore {
  if (!hasWindow()) return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as ProgressStore;
  } catch {
    return {};
  }
}

function saveProgress(store: ProgressStore): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

function updateLesson(
  courseSlug: string,
  lessonKey: string,
  patch: Partial<LessonProgress>
): void {
  const store = loadProgress();
  const course = store[courseSlug] ?? {};
  const current = course[lessonKey] ?? {
    completed: false,
    updatedAt: new Date().toISOString(),
  };
  course[lessonKey] = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store[courseSlug] = course;
  saveProgress(store);
}

export function getLessonProgress(
  courseSlug: string,
  lessonKey: string
): LessonProgress | null {
  return loadProgress()[courseSlug]?.[lessonKey] ?? null;
}

export function setLessonCompleted(
  courseSlug: string,
  lessonKey: string,
  completed: boolean
): void {
  updateLesson(courseSlug, lessonKey, { completed });
}

export function saveQuizResult(
  courseSlug: string,
  lessonKey: string,
  score: number,
  total: number
): void {
  updateLesson(courseSlug, lessonKey, { quizScore: score, quizTotal: total });
}

export function countCompleted(courseSlug: string, lessonKeys: string[]): number {
  const course = loadProgress()[courseSlug] ?? {};
  return lessonKeys.reduce((count, key) => (course[key]?.completed ? count + 1 : count), 0);
}
