// POST /api/upload-photo — upload foto per ID (publik, hardened).
// Form multipart: entityType (student|teacher|staff|class|payment),
// entityId (STU-XXXXXX / TCH-XXXXXX / ACT-XXXXXX / CLS-XXXXXX / id payment),
// photo (File jpg/png/webp ≤5MB), csrfToken, website (honeypot).
// Simpan: public/uploads/<entity>/<SAFEID>-<timestamp>.<ext> → { ok, url }.
// GET /api/upload-photo?entityType=&entityId= — daftar foto per ID
// (coba Supabase photo_uploads dulu, fallback scan folder lokal).
import { NextResponse } from "next/server";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  PHOTO_MAX_BYTES,
  extForMime,
  isValidEntityId,
  normalizeEntity,
  safeIdSegment,
  uploadPublicDir,
} from "@/lib/photo";
import {
  checkRateLimit,
  csrfTokensMatch,
  getClientIp,
  isHoneypotFilled,
  logServerError,
  safeErrorMessage,
} from "@/lib/security";
import { CSRF_COOKIE } from "@/lib/session";

function csrfFrom(req: Request, form: FormData): { cookie: string | null; presented: string | null } {
  const cookie = req.headers.get("cookie")?.match(new RegExp(`${CSRF_COOKIE}=([^;]+)`))?.[1] ?? null;
  const header = req.headers.get("x-csrf-token") ?? req.headers.get("x-xsrf-token");
  const raw = form.get("csrfToken") ?? form.get("csrf_token") ?? form.get("_csrf");
  const bodyToken = typeof raw === "string" ? raw : null;
  return { cookie, presented: header ?? bodyToken };
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`upload-photo:${ip}`, 20, 60_000);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }
  try {
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    const hp: Record<string, unknown> = {};
    for (const k of ["website", "nickname", "company_hp", "url_hp"]) {
      const v = form.get(k);
      if (typeof v === "string") hp[k] = v;
    }
    if (isHoneypotFilled(hp)) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });

    const { cookie, presented } = csrfFrom(req, form);
    if (!cookie || !presented || !csrfTokensMatch(cookie, presented)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }

    const entity = normalizeEntity(form.get("entityType"));
    const entityId = typeof form.get("entityId") === "string" ? String(form.get("entityId")).trim() : "";
    if (!entity || !entityId || !isValidEntityId(entity, entityId)) {
      return NextResponse.json({ ok: false, error: "ID tidak valid untuk tipe tersebut." }, { status: 400 });
    }

    const file = form.get("photo");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "File foto wajib diisi." }, { status: 400 });
    }
    const ext = extForMime(file.type);
    if (!ext) {
      return NextResponse.json({ ok: false, error: "Format harus JPG/PNG/WebP." }, { status: 400 });
    }
    if (file.size > PHOTO_MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "Ukuran maksimal 5 MB." }, { status: 400 });
    }

    const safeId = safeIdSegment(entityId);
    const name = `${safeId}-${Date.now()}.${ext}`;
    const dir = join(uploadPublicDir(), entity);
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, name), bytes);
    const url = `/uploads/${entity}/${name}`;

    // Catat ke Supabase bila env tersedia (best-effort, upload tetap sukses tanpa DB).
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      await sb.from("photo_uploads").insert({
        entity_type: entity,
        entity_id: entityId,
        file_url: url,
        file_path: `${entity}/${name}`,
        mime: file.type,
        size_bytes: file.size,
        uploaded_by: ip,
      });
    } catch (e) {
      logServerError("upload-photo-db", e);
    }

    return NextResponse.json({ ok: true, url, entityType: entity, entityId, size: file.size, mime: file.type });
  } catch (e) {
    logServerError("upload-photo", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`upload-photo-list:${ip}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const u = new URL(req.url);
    const entity = normalizeEntity(u.searchParams.get("entityType"));
    const entityId = (u.searchParams.get("entityId") ?? "").trim();
    if (!entity || !entityId || !isValidEntityId(entity, entityId)) {
      return NextResponse.json({ ok: false, error: "Parameter entityType/entityId tidak valid." }, { status: 400 });
    }

    // 1) Coba Supabase.
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();
      const { data, error } = await sb
        .from("photo_uploads")
        .select("id,entity_type,entity_id,file_url,mime,size_bytes,created_at")
        .eq("entity_type", entity)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) return NextResponse.json({ ok: true, source: "db", rows: data });
    } catch (e) {
      logServerError("upload-photo-list-db", e);
    }

    // 2) Fallback: scan folder lokal.
    try {
      const safeId = safeIdSegment(entityId);
      const dir = join(uploadPublicDir(), entity);
      const files = await readdir(dir).catch(() => [] as string[]);
      const rows: Array<Record<string, unknown>> = [];
      for (const f of files) {
        if (!f.startsWith(`${safeId}-`)) continue;
        const full = join(dir, f);
        const st = await stat(full).catch(() => null);
        if (!st || !st.isFile()) continue;
        rows.push({
          entity_type: entity,
          entity_id: entityId,
          file_url: `/uploads/${entity}/${f}`,
          size_bytes: st.size,
          created_at: st.mtime.toISOString(),
        });
      }
      rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      return NextResponse.json({ ok: true, source: "local", rows });
    } catch (e) {
      logServerError("upload-photo-list-local", e);
      return NextResponse.json({ ok: true, source: "empty", rows: [] });
    }
  } catch (e) {
    logServerError("upload-photo-list", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
