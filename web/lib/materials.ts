// KOLASE — helper upload materi kelas oleh guru (server-only).
// Disimpan di public/uploads/materials/<SAFE-CLASS>/ + dicatat di photo_uploads
// (entity_type='class') agar tanpa migrasi skema. Batas 5MB mengikuti
// constraint photo_uploads.size_bytes (0–5242880).
import { join } from "node:path";

export const MATERIAL_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const MATERIAL_ALLOWED_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/mpeg": "mp3",
};

export function materialUploadDir(): string {
  return process.env.MATERIAL_UPLOAD_DIR || join(process.cwd(), "public", "uploads", "materials");
}

export function extForMaterialMime(mime: string): string | null {
  return MATERIAL_ALLOWED_MIME[mime] ?? null;
}

export function safeFileSegment(name: string): string {
  const base = name.split("/").pop()?.split("\\").pop() ?? "materi";
  return base.replace(/[^A-Za-z0-9\-_. ]/g, "_").replace(/\s+/g, "-").slice(0, 80) || "materi";
}

// Nama tampil dari file_path: <CLASS>-<ts>-<orig> → <orig>.
export function displayNameFromPath(filePath: string): string {
  const fname = filePath.split("/").pop() ?? filePath;
  const parts = fname.split("-");
  if (parts.length >= 3) return parts.slice(2).join("-");
  return fname;
}
