// /api/materials — Materi pembelajaran per kelas (diupload guru, dibaca murid).
// Disimpan di public/uploads/materials/<CLASS>/ + photo_uploads (entity class).
// GET ?classId=: murid hanya kelasnya sendiri; guru/admin bebas (default kelas murid).
// POST multipart {classId, file}: guru/admin, PDF/DOC/DOCX/PPT/PPTX/JPG/PNG/WebP/MP3 ≤5MB.
// DELETE {id}: guru/admin — hapus file + baris.
import { NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSession } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/session";
import {
  checkRateLimit,
  getClientIp,
  logServerError,
  safeErrorMessage,
  sanitizeString,
} from "@/lib/security";
import { safeIdSegment } from "@/lib/photo";
import {
  displayNameFromPath,
  extForMaterialMime,
  MATERIAL_MAX_BYTES,
  materialUploadDir,
  safeFileSegment,
} from "@/lib/materials";
import { materialDeleteServerSchema } from "@/lib/schemas";

// Kelas-kelas yang boleh diakses sesi student (membership + trial aktif).
import type { SupabaseClient } from "@supabase/supabase-js";

async function ownClassIds(sb: SupabaseClient, studentId: string): Promise<string[]> {
  const ids = new Set<string>();
  try {
    const { data } = await sb.from("class_membership").select("class_id").eq("student_id", studentId);
    for (const r of (data ?? []) as Array<{ class_id: string }>) if (r.class_id) ids.add(String(r.class_id));
  } catch { /* abaikan */ }
  try {
    const { data } = await sb.from("trials").select("class_id").eq("student_id", studentId).in("status", ["STARTED", "COMPLETED"]);
    for (const r of (data ?? []) as Array<{ class_id: string }>) if (r.class_id) ids.add(String(r.class_id));
  } catch { /* abaikan */ }
  return [...ids];
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`materials-list:${ip}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    const url = new URL(req.url);
    let classId = (url.searchParams.get("classId") ?? "").trim();

    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    if (s.role === "student") {
      const own = await ownClassIds(sb, s.sub);
      if (!classId) {
        if (own.length === 0) return NextResponse.json({ ok: true, source: "empty", rows: [] });
        classId = own[0];
      } else if (!own.includes(classId)) {
        return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
      }
    }
    if (!classId) return NextResponse.json({ ok: false, error: "classId wajib" }, { status: 400 });

    try {
      const { data, error } = await sb
        .from("photo_uploads")
        .select("id,entity_id,file_url,file_path,mime,size_bytes,created_at")
        .eq("entity_type", "class")
        .eq("entity_id", classId)
        .like("file_path", "materials/%")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      const rows = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
        ...r,
        title: displayNameFromPath(String(r.file_path ?? "")),
      }));
      return NextResponse.json({ ok: true, source: "db", classId, rows });
    } catch (e) {
      logServerError("materials-list-db", e);
      return NextResponse.json({ ok: true, source: "empty", classId, rows: [] });
    }
  } catch (e) {
    logServerError("materials-list", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`materials-upload:${ip}`, 20, 60_000);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }
  try {
    const s = await getSession();
    if (!s || !ADMIN_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const classId = sanitizeString(form.get("classId"), 32);
    if (!classId) return NextResponse.json({ ok: false, error: "classId wajib" }, { status: 400 });

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "File materi wajib diisi." }, { status: 400 });
    }
    const ext = extForMaterialMime(file.type);
    if (!ext) {
      return NextResponse.json({ ok: false, error: "Format: PDF/DOC/DOCX/PPT/PPTX/JPG/PNG/WebP/MP3." }, { status: 400 });
    }
    if (file.size > MATERIAL_MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "Ukuran maksimal 5 MB." }, { status: 400 });
    }

    const safeClass = safeIdSegment(classId);
    const name = `${safeClass}-${Date.now()}-${safeFileSegment(file.name || `materi.${ext}`)}`;
    const dir = join(materialUploadDir(), safeClass);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));
    const filePath = `materials/${safeClass}/${name}`;
    const fileUrl = `/uploads/${filePath}`;

    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { data, error } = await sb
        .from("photo_uploads")
        .insert({
          entity_type: "class",
          entity_id: classId,
          file_url: fileUrl,
          file_path: filePath,
          mime: file.type,
          size_bytes: file.size,
          uploaded_by: s.sub,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, id: (data as { id: number }).id, url: fileUrl, title: file.name });
    } catch (e) {
      logServerError("materials-db", e);
      return NextResponse.json({ ok: true, url: fileUrl, title: file.name, note: "tersimpan lokal (DB belum tercatat)" });
    }
  } catch (e) {
    logServerError("materials-upload", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`materials-delete:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !ADMIN_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = materialDeleteServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const { data: row } = await sb
      .from("photo_uploads")
      .select("file_path")
      .eq("id", parsed.data.id)
      .eq("entity_type", "class")
      .maybeSingle();
    const fp = String((row as Record<string, unknown> | null)?.file_path ?? "");
    if (!fp.startsWith("materials/")) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(404) }, { status: 404 });
    }
    const { error } = await sb.from("photo_uploads").delete().eq("id", parsed.data.id);
    if (error) throw new Error(error.message);
    try {
      await unlink(join(materialUploadDir(), fp.replace(/^materials\//, "")));
    } catch { /* file mungkin sudah tidak ada */ }
    return NextResponse.json({ ok: true, id: parsed.data.id });
  } catch (e) {
    logServerError("materials-delete", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
