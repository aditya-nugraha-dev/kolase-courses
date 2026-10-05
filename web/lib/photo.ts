// KOLASE — helper validasi upload foto per ID (server-only).
// Entity: student STU-XXXXXX | teacher TCH-XXXXXX | staff ACT-XXXXXX
// | class CLS-XXXXXX / ID kelas bebas | payment ID numerik / TXN-YYYY-####.
import { join } from "node:path";

export const PHOTO_ENTITIES = ["student", "teacher", "staff", "class", "payment"] as const;
export type PhotoEntity = (typeof PHOTO_ENTITIES)[number];

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const PHOTO_ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const ID_PATTERNS: Record<PhotoEntity, RegExp> = {
  student: /^STU-\d{6}$/,
  teacher: /^(TCH-\d{6}|.+@.+\..+)$/, // TCH-XXXXXX atau email guru
  staff: /^(ACT-\d{6}|.+@.+\..+)$/, // ACT-XXXXXX atau email staff
  class: /^[A-Za-z0-9][A-Za-z0-9\-_]{2,31}$/, // CLS-XXXXXX atau ID kelas
  payment: /^(\d+|TXN-\d{4}-\d{4}|STU-\d{6})$/, // id konfirmasi / TXN / STU pemilik
};

export function normalizeEntity(input: unknown): PhotoEntity | null {
  if (typeof input !== "string") return null;
  const v = input.trim().toLowerCase();
  return (PHOTO_ENTITIES as readonly string[]).includes(v) ? (v as PhotoEntity) : null;
}

export function isValidEntityId(entity: PhotoEntity, id: unknown): boolean {
  if (typeof id !== "string") return false;
  return ID_PATTERNS[entity].test(id.trim());
}

export function safeIdSegment(id: string): string {
  // Hanya [A-Za-z0-9-_.@], sisanya jadi "_"; cegah path traversal.
  return id.trim().replace(/[^A-Za-z0-9\-_.@]/g, "_").slice(0, 64) || "unknown";
}

export function uploadPublicDir(): string {
  // public/uploads/<entity>/ — bisa dioverride via PHOTO_UPLOAD_DIR.
  return process.env.PHOTO_UPLOAD_DIR || join(process.cwd(), "public", "uploads");
}

export function extForMime(mime: string): string | null {
  return PHOTO_ALLOWED_MIME[mime] ?? null;
}
