export type LessonProgress = {
  completed: boolean;
  quizScore?: number;
  quizTotal?: number;
  updatedAt: string;
};

export type ProgressStore = Record<string, Record<string, LessonProgress>>;

export const PROGRESS_EVENT = "kolase-progress";
export const PROGRESS_KEY = "kolase.course.progress.v1";

type RemoteRow = {
  course_slug: string;
  lesson_key: string;
  completed: boolean;
  quiz_score: number | null;
  quiz_total: number | null;
  updated_at: string;
};

// localStorage dipisah per murid agar perangkat bersama tidak mencampur progres.
let ownerId: string | null = null;

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function storageKey(): string {
  return ownerId ? `${PROGRESS_KEY}:${ownerId}` : PROGRESS_KEY;
}

export function setProgressOwner(id: string | null): void {
  ownerId = id;
  if (!hasWindow() || !id) return;
  try {
    const scoped = `${PROGRESS_KEY}:${id}`;
    if (!window.localStorage.getItem(scoped)) {
      const legacy = window.localStorage.getItem(PROGRESS_KEY);
      if (legacy) {
        window.localStorage.setItem(scoped, legacy);
        window.localStorage.removeItem(PROGRESS_KEY);
      }
    }
  } catch {
    /* localStorage diblokir: progres tetap jalan di memori halaman */
  }
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function getProgressOwner(): string | null {
  return ownerId;
}

export function loadProgress(): ProgressStore {
  if (!hasWindow()) return {};
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as ProgressStore;
  } catch {
    return {};
  }
}

function persist(store: ProgressStore): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(store));
  } catch {
    /* kuota penuh / mode privat */
  }
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

function postLesson(courseSlug: string, lessonKey: string, progress: LessonProgress): void {
  if (!ownerId) return;
  if (typeof fetch !== "function") return;
  void fetch("/api/course-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_slug: courseSlug,
      lesson_key: lessonKey,
      completed: progress.completed,
      quiz_score: progress.quizScore ?? null,
      quiz_total: progress.quizTotal ?? null,
    }),
    keepalive: true,
  }).catch(() => {
    /* offline: data lokal tetap tersimpan, POST dicoba lagi saat lesson berikutnya */
  });
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
  const next: LessonProgress = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  course[lessonKey] = next;
  store[courseSlug] = course;
  persist(store);
  postLesson(courseSlug, lessonKey, next);
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

export function mergeRemoteProgress(rows: RemoteRow[]): void {
  if (!hasWindow() || rows.length === 0) return;
  const store = loadProgress();
  let changed = false;

  for (const row of rows) {
    if (!row.course_slug || !row.lesson_key) continue;
    const course = store[row.course_slug] ?? {};
    const current = course[row.lesson_key];
    const remoteTime = Date.parse(row.updated_at);
    const localTime = current ? Date.parse(current.updatedAt) : 0;
    if (current && Number.isFinite(localTime) && localTime >= remoteTime) continue;
    course[row.lesson_key] = {
      completed: Boolean(row.completed),
      quizScore: row.quiz_score ?? undefined,
      quizTotal: row.quiz_total ?? undefined,
      updatedAt: Number.isFinite(remoteTime) ? row.updated_at : new Date().toISOString(),
    };
    store[row.course_slug] = course;
    changed = true;
  }

  if (changed) persist(store);
}

export async function syncProgressFromServer(): Promise<void> {
  if (!ownerId || typeof fetch !== "function") return;
  try {
    const res = await fetch("/api/course-progress", { cache: "no-store" });
    if (!res.ok) return;
    const json = (await res.json()) as { ok?: boolean; rows?: RemoteRow[] };
    if (json.ok && Array.isArray(json.rows)) mergeRemoteProgress(json.rows);
  } catch {
    /* offline: pakai progres lokal */
  }
}
