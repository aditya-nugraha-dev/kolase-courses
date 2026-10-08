// /api/admin/users — Database staff (khusus role staff: admin/founder/academic/systems).
// GET: daftar teacher (+kelas yang diajar) & student (+kelas & trial).
// DELETE {type: student|teacher, id}: hapus permanen + seluruh data terkait murid.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/session";
import {
  checkRateLimit,
  getClientIp,
  logServerError,
  safeErrorMessage,
  sanitizeString,
} from "@/lib/security";
import { userDeleteServerSchema } from "@/lib/schemas";

// GET /api/admin/users — database teacher + student untuk staff.
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-users:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !(STAFF_ROLES as readonly string[]).includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    try {
      const { supabaseServer } = await import("@/lib/supabase");
      const sb = supabaseServer();

      const { data: teachers } = await sb
        .from("mst_teachers")
        .select("teacher_id,nama,email,wa")
        .order("nama", { ascending: true })
        .limit(200);
      const { data: classes } = await sb
        .from("classes")
        .select("id,nama,guru,teacher_name,level,class_status")
        .limit(200);
      const { data: students } = await sb
        .from("mst_students")
        .select("student_id,nama,full_name,preferred_name,email,wa,current_status,placement_total,tgl_daftar")
        .order("tgl_daftar", { ascending: false })
        .limit(300);
      const { data: memberships } = await sb
        .from("class_membership")
        .select("student_id,class_id,status,sisa")
        .in("status", ["PENDING", "ACTIVE"])
        .limit(500);
      const { data: trials } = await sb
        .from("trials")
        .select("student_id,status,sessions_delivered")
        .in("status", ["STARTED", "COMPLETED"])
        .limit(500);

      const memByStudent: Record<string, Array<{ class_id: string; status: string; sisa: number }>> = {};
      for (const m of (memberships ?? []) as Record<string, unknown>[]) {
        const sid = String(m.student_id ?? "");
        if (!sid) continue;
        (memByStudent[sid] ||= []).push({
          class_id: String(m.class_id ?? ""),
          status: String(m.status ?? ""),
          sisa: Number(m.sisa ?? 0),
        });
      }
      const trialByStudent: Record<string, string> = {};
      for (const t of (trials ?? []) as Record<string, unknown>[]) {
        trialByStudent[String(t.student_id ?? "")] = `${t.status} ${t.sessions_delivered ?? 0}/7`;
      }
      const teacherRows: Array<Record<string, unknown>> = ((teachers ?? []) as Array<Record<string, unknown>>).map((t) => {
        const nama = String(t.nama ?? "");
        const taught = ((classes ?? []) as Array<Record<string, unknown>>)
          .filter((c) => {
            const g = `${c.guru ?? ""} ${c.teacher_name ?? ""}`.toLowerCase();
            return nama !== "" && g.includes(nama.toLowerCase());
          })
          .map((c) => ({ id: String(c.id ?? ""), nama: String(c.nama ?? ""), status: String(c.class_status ?? "") }));
        const row: Record<string, unknown> = { ...t, classes: taught };
        return row;
      });

      const match = (v: string) => !q || v.toLowerCase().includes(q);
      const outTeachers = teacherRows.filter(
        (t) => match(String(t.nama ?? "")) || match(String(t.email ?? "")) || match(String(t.teacher_id ?? ""))
      );
      const outStudents = ((students ?? []) as Array<Record<string, unknown>>)
        .map((x) => {
          const row: Record<string, unknown> = {
            ...x,
            classes: memByStudent[String(x.student_id ?? "")] ?? [],
            trial: trialByStudent[String(x.student_id ?? "")] ?? "—",
          };
          return row;
        })
        .filter(
          (x) =>
            match(String(x.full_name ?? x.nama ?? "")) ||
            match(String(x.email ?? "")) ||
            match(String(x.student_id ?? ""))
        );

      return NextResponse.json({
        ok: true,
        source: "db",
        teachers: outTeachers,
        students: outStudents,
      });
    } catch (e) {
      logServerError("admin-users-db", e);
      return NextResponse.json({ ok: true, source: "empty", teachers: [], students: [] });
    }
  } catch (e) {
    logServerError("admin-users", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}

// DELETE /api/admin/users {type, id} — hapus permanen (staff saja, konfirmasi di UI).
export async function DELETE(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-users-delete:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !(STAFF_ROLES as readonly string[]).includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = userDeleteServerSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const id = sanitizeString(parsed.data.id, 64);

    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const errors: string[] = [];

    if (parsed.data.type === "teacher") {
      const { error } = await sb.from("mst_teachers").delete().eq("teacher_id", id);
      if (error) errors.push(error.message);
      try {
        await sb.from("photo_uploads").delete().eq("entity_type", "teacher").eq("entity_id", id);
      } catch { /* abaikan */ }
    } else {
      // Hapus data murid berurutan (FK: attendance → observasi → sesi → ledger → membership → payment → master).
      const { data: mems } = await sb.from("class_membership").select("enrollment_id").eq("student_id", id);
      const enrs = ((mems ?? []) as Array<{ enrollment_id: string }>).map((m) => m.enrollment_id).filter(Boolean);
      const step = async (table: string, col: string, val: string | string[]) => {
        try {
          const vals = Array.isArray(val) ? val : [val];
          if (vals.length === 0) return;
          const { error } = vals.length === 1
            ? await sb.from(table).delete().eq(col, vals[0])
            : await sb.from(table).delete().in(col, vals);
          if (error) errors.push(`${table}: ${error.message}`);
        } catch (e) {
          errors.push(`${table}: ${e instanceof Error ? e.message : "gagal"}`);
        }
      };
      if (enrs.length > 0) {
        await step("sessions", "enrollment_id", enrs);
        await step("txn_entitlement_ledger", "enrollment_id", enrs);
        await step("class_membership", "enrollment_id", enrs);
      }
      await step("session_attendance", "student_id", id);
      await step("pilot_observations", "student_id", id);
      await step("pilot_postclass", "student_id", id);
      await step("pilot_placements", "student_id", id);
      await step("pilot_registrations", "student_id", id);
      await step("txn_payments", "student_id", id);
      await step("trials", "student_id", id);
      await step("payment_confirmations", "student_id", id);
      try {
        await sb.from("photo_uploads").delete().eq("entity_type", "student").eq("entity_id", id);
      } catch { /* abaikan */ }
      // Hapus thread chat lokal (best-effort).
      try {
        const { readChatDB, writeChatDB } = await import("@/lib/chat");
        const db = await readChatDB();
        if (db.threads[id]) {
          delete db.threads[id];
          await writeChatDB(db);
        }
      } catch { /* abaikan */ }
      const { error } = await sb.from("mst_students").delete().eq("student_id", id);
      if (error) errors.push(`mst_students: ${error.message}`);
    }

    try {
      await sb.from("audit_log").insert({
        actor: s.sub,
        action: parsed.data.type === "teacher" ? "TEACHER_DELETE" : "STUDENT_DELETE",
        object_type: parsed.data.type === "teacher" ? "TEACHER" : "STUDENT",
        object_id: id,
        reason: "database staff",
        meta: { errors },
      });
    } catch { /* best-effort */ }

    if (errors.length > 0) {
      return NextResponse.json({ ok: false, error: errors.join("; ") }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    logServerError("admin-users-delete", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : safeErrorMessage(500) }, { status: 500 });
  }
}
