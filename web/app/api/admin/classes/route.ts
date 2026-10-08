// GET/POST/PATCH/DELETE /api/admin/classes — Fitur Kelas di Dashboard (Step 1-4).
// Step 1 LIST: daftar kelas + okupansi (terisi/kuota, %).
// Step 2 TAMBAH: buat kelas baru (id auto CLS-XXXXXX bila kosong).
// Step 3 EDIT/DETAIL: update parsial + detail termasuk daftar siswa.
// Step 4 HAPUS: hapus kelas kosong (tolak bila masih ada membership aktif).
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ADMIN_ROLES, APPROVER_ROLES } from "@/lib/session";
import {
  checkRateLimit,
  getClientIp,
  logServerError,
  safeErrorMessage,
  sanitizeObject,
  sanitizeString,
} from "@/lib/security";
import {
  classCreateServerSchema,
  classDeleteServerSchema,
  classUpdateServerSchema,
} from "@/lib/schemas";

// GET /api/admin/classes?q=&status=&kategori= — list + okupansi.
// Butuh login admin penuh. Dashboard publik pakai fallback mock bila 403.
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-classes-list:${ip}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !ADMIN_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const status = (url.searchParams.get("status") ?? "").trim();
    const kategori = (url.searchParams.get("kategori") ?? "").trim();
    const detailId = (url.searchParams.get("id") ?? "").trim();

    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();

      // Mode detail: 1 kelas + siswa terdaftar + sesi.
      if (detailId) {
        const { data: cls, error: clsErr } = await sb.from("classes").select("*").eq("id", detailId).single();
        if (clsErr || !cls) return NextResponse.json({ ok: false, error: safeErrorMessage(404) }, { status: 404 });
        const { data: members } = await sb
          .from("class_membership")
          .select("enrollment_id,student_id,status,sisa,activated_at,expires_at")
          .eq("class_id", detailId)
          .order("activated_at", { ascending: false })
          .limit(200);
        const studentIds = (members ?? []).map((m) => String(m.student_id)).filter(Boolean);
        let students: Record<string, unknown>[] = [];
        if (studentIds.length > 0) {
          const { data: stu } = await sb
            .from("mst_students")
            .select("student_id,nama,full_name,email,wa,current_status")
            .in("student_id", studentIds.slice(0, 200));
          students = (stu ?? []) as Record<string, unknown>[];
        }
        const { data: sessions } = await sb
          .from("class_sessions")
          .select("session_id,seq,tanggal,status")
          .eq("class_id", detailId)
          .order("seq", { ascending: true })
          .limit(50);
        const { count } = await sb
          .from("class_membership")
          .select("enrollment_id", { count: "exact", head: true })
          .eq("class_id", detailId)
          .in("status", ["PENDING", "ACTIVE"]);
        return NextResponse.json({
          ok: true,
          source: "db",
          class: cls,
          occupancy: { filled: count ?? 0, kuota: (cls as Record<string, unknown>).kuota ?? 0 },
          members: members ?? [],
          students,
          sessions: sessions ?? [],
        });
      }

      let query = sb.from("classes").select("*").order("id", { ascending: true }).limit(200);
      if (status) query = query.eq("class_status", status);
      if (kategori) query = query.eq("kategori", kategori);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as Record<string, unknown>[];

      // Okupansi per kelas (1 query per kelas, max 200 — cukup untuk dashboard).
      const withOcc = await Promise.all(
        rows.map(async (r) => {
          const cid = String(r.id ?? "");
          const { count } = await sb
            .from("class_membership")
            .select("enrollment_id", { count: "exact", head: true })
            .eq("class_id", cid)
            .in("status", ["PENDING", "ACTIVE"]);
          const filled = count ?? 0;
          const kuota = Number(r.kuota ?? 0);
          return {
            ...r,
            filled,
            remaining: kuota > 0 ? Math.max(0, kuota - filled) : 0,
            occupancy_pct: kuota > 0 ? Math.round((filled / kuota) * 100) : 0,
          } as Record<string, unknown>;
        })
      );

      if (q) {
        const filtered = withOcc.filter((r) => {
          const nama = String(r.nama ?? "").toLowerCase();
          const id = String(r.id ?? "").toLowerCase();
          const guru = String(r.guru ?? r.teacher_name ?? "").toLowerCase();
          return nama.includes(q) || id.includes(q) || guru.includes(q);
        });
        return NextResponse.json({ ok: true, source: "db", rows: filtered });
      }
      return NextResponse.json({ ok: true, source: "db", rows: withOcc });
    } catch (e) {
      logServerError("admin-classes-list-db", e);
      return NextResponse.json({ ok: true, source: "empty", rows: [] });
    }
  } catch (e) {
    logServerError("admin-classes-list", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

// POST /api/admin/classes — Step 2 TAMBAH.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-classes-create:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !APPROVER_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = classCreateServerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(400), detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, { status: 400 });
    }
    const b = sanitizeObject({ ...parsed.data } as Record<string, unknown>);
    const { supabaseServer } = await import("@/lib/supabase");
    const { nextId } = await import("@/lib/ids");
    const sb = supabaseServer();

    let id = sanitizeString(b.id, 32);
    if (!id) {
      id = await nextId(sb, "classes", "id", "CLS");
    } else {
      const { data: exists } = await sb.from("classes").select("id").eq("id", id).maybeSingle();
      if (exists) return NextResponse.json({ ok: false, error: `ID ${id} sudah dipakai` }, { status: 409 });
    }

    const row = {
      id,
      nama: sanitizeString(b.nama, 160),
      level: b.level,
      kategori: b.kategori ?? "PUBLIC",
      jadwal: sanitizeString(b.jadwal, 200),
      guru: sanitizeString(b.guru, 100),
      harga: Number(b.harga),
      harga_coret: Number(b.harga_coret ?? 0),
      kuota: Number(b.kuota),
      min_students: Number(b.min_students ?? 3),
      sesi_count: Number(b.sesi_count ?? 4),
      class_status: b.class_status ?? "DRAFT",
      deskripsi: sanitizeString(b.deskripsi, 2000),
      meet_link: sanitizeString(b.meet_link, 500),
      meet: sanitizeString(b.meet_link, 500),
      teacher_name: sanitizeString(b.teacher_name || b.guru, 100),
      learning_objective: sanitizeString(b.learning_objective, 2000),
      pilot_class_id: sanitizeString(b.pilot_class_id, 32),
    };
    const { error } = await sb.from("classes").insert(row);
    if (error) throw new Error(error.message);
    try {
      await sb.from("audit_log").insert({
        actor: s.sub,
        action: "CLASS_CREATE",
        object_type: "CLASS",
        object_id: id,
        reason: "dashboard",
        meta: { nama: row.nama },
      });
    } catch { /* audit best-effort */ }
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    logServerError("admin-classes-create", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : safeErrorMessage(500) }, { status: 500 });
  }
}

// PATCH /api/admin/classes — Step 3 EDIT.
export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-classes-update:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !APPROVER_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = classUpdateServerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(400), detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, { status: 400 });
    }
    const { id, ...rest } = parsed.data;
    const clean: Record<string, unknown> = {};
    const str = (v: unknown, n: number) => sanitizeString(v, n);
    if (rest.nama !== undefined) clean.nama = str(rest.nama, 160);
    if (rest.level !== undefined) clean.level = rest.level;
    if (rest.kategori !== undefined) clean.kategori = rest.kategori;
    if (rest.jadwal !== undefined) clean.jadwal = str(rest.jadwal, 200);
    if (rest.guru !== undefined) {
      clean.guru = str(rest.guru, 100);
      if (rest.teacher_name === undefined) clean.teacher_name = str(rest.guru, 100);
    }
    if (rest.teacher_name !== undefined) clean.teacher_name = str(rest.teacher_name, 100);
    if (rest.harga !== undefined) clean.harga = Number(rest.harga);
    if (rest.harga_coret !== undefined) clean.harga_coret = Number(rest.harga_coret);
    if (rest.kuota !== undefined) clean.kuota = Number(rest.kuota);
    if (rest.min_students !== undefined) clean.min_students = Number(rest.min_students);
    if (rest.sesi_count !== undefined) clean.sesi_count = Number(rest.sesi_count);
    if (rest.class_status !== undefined) clean.class_status = rest.class_status;
    if (rest.deskripsi !== undefined) clean.deskripsi = str(rest.deskripsi, 2000);
    if (rest.learning_objective !== undefined) clean.learning_objective = str(rest.learning_objective, 2000);
    if (rest.meet_link !== undefined) {
      clean.meet_link = str(rest.meet_link, 500);
      clean.meet = str(rest.meet_link, 500);
    }
    if (rest.pilot_class_id !== undefined) clean.pilot_class_id = str(rest.pilot_class_id, 32);
    if (Object.keys(clean).length === 0) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    }
    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const { error } = await sb.from("classes").update(clean).eq("id", sanitizeString(id, 32));
    if (error) throw new Error(error.message);
    try {
      await sb.from("audit_log").insert({
        actor: s.sub,
        action: "CLASS_UPDATE",
        object_type: "CLASS",
        object_id: String(id),
        reason: "dashboard",
        meta: clean,
      });
    } catch { /* best-effort */ }
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    logServerError("admin-classes-update", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : safeErrorMessage(500) }, { status: 500 });
  }
}

// DELETE /api/admin/classes — Step 4 HAPUS (hanya kelas kosong).
export async function DELETE(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-classes-delete:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !APPROVER_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    // Dukung ?id= juga untuk kemudahan fetch DELETE tanpa body.
    try {
      const u = new URL(req.url);
      const qid = u.searchParams.get("id");
      if (qid && !raw.id) raw.id = qid;
    } catch { /* abaikan */ }
    const parsed = classDeleteServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const id = sanitizeString(parsed.data.id, 32);
    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const { count } = await sb
      .from("class_membership")
      .select("enrollment_id", { count: "exact", head: true })
      .eq("class_id", id)
      .in("status", ["PENDING", "ACTIVE"]);
    if ((count ?? 0) > 0) {
      return NextResponse.json({ ok: false, error: `Kelas ${id} masih punya ${count} siswa aktif — pindahkan dulu sebelum hapus` }, { status: 409 });
    }
    const { error } = await sb.from("classes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    try {
      await sb.from("audit_log").insert({
        actor: s.sub,
        action: "CLASS_DELETE",
        object_type: "CLASS",
        object_id: id,
        reason: "dashboard",
        meta: {},
      });
    } catch { /* best-effort */ }
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    logServerError("admin-classes-delete", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : safeErrorMessage(500) }, { status: 500 });
  }
}
