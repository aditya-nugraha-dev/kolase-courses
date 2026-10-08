// GET /api/student/me — profil + kelas + progres milik sesi student.
// RBAC: sesi student + admin penuh. Student hanya bisa lihat miliknya sendiri.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { STUDENT_AREA_ROLES } from "@/lib/session";
import { logServerError, safeErrorMessage } from "@/lib/security";

export async function GET() {
  try {
    const s = await getSession();
    if (!s || !STUDENT_AREA_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    }
    const lookupId = s.sub;

    const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasSupabase) {
      try {
        const { supabaseServer } = await import("@/lib/supabase");
        const sb = supabaseServer();
        const { data: stu } = await sb.from("mst_students").select("*").eq("student_id", lookupId).single();
        if (stu) {
          const s = stu as Record<string, unknown>;
          // Kelas via membership terbaru (ACTIVE/PENDING), fallback kolom lama.
          let membership: Record<string, unknown> | null = null;
          try {
            const { data: mem } = await sb
              .from("class_membership")
              .select("enrollment_id,class_id,status,sisa,activated_at,expires_at")
              .eq("student_id", lookupId)
              .in("status", ["ACTIVE", "PENDING"])
              .order("activated_at", { ascending: false, nullsFirst: false })
              .limit(1)
              .maybeSingle();
            if (mem) membership = mem as Record<string, unknown>;
          } catch { /* tanpa membership = belum checkout */ }
          // Trial 7 sesi gratis terbaru (untuk banner progres + prompt lanjut).
          let trial: Record<string, unknown> | null = null;
          try {
            const { data: tr } = await sb
              .from("trials")
              .select("trial_id,class_id,status,sessions_delivered,created_at,completed_at")
              .eq("student_id", lookupId)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (tr) trial = tr as Record<string, unknown>;
          } catch { /* abaikan */ }

          const classId =
            String(membership?.class_id ?? trial?.class_id ?? s.class_id ?? s.pilot_class_id ?? "CLS-000001");
          const { data: cls } = await sb.from("classes").select("*").eq("id", classId).limit(1).maybeSingle();
          const activeClass = cls ?? null;

          // Sesi mendatang (kanonikal class_sessions) untuk kalender + Upcoming.
          let sessions: Record<string, unknown>[] = [];
          try {
            const { data: ses } = await sb
              .from("class_sessions")
              .select("session_id,seq,tanggal,status")
              .eq("class_id", classId)
              .order("seq", { ascending: true })
              .limit(12);
            sessions = (ses ?? []) as Record<string, unknown>[];
          } catch { /* abaikan */ }

          // Tugas turunan: placement / post-class / observasi sudah ada atau belum.
          const tasks = { placement: false, postclass: false, observed: false };
          try {
            const { count: c1 } = await sb.from("pilot_placements").select("id", { count: "exact", head: true }).eq("student_id", lookupId);
            tasks.placement = (c1 ?? 0) > 0;
          } catch { /* abaikan */ }
          try {
            const { count: c2 } = await sb.from("pilot_postclass").select("id", { count: "exact", head: true }).eq("student_id", lookupId);
            tasks.postclass = (c2 ?? 0) > 0;
          } catch { /* abaikan */ }
          try {
            const { count: c3 } = await sb.from("pilot_observations").select("observation_id", { count: "exact", head: true }).eq("student_id", lookupId);
            tasks.observed = (c3 ?? 0) > 0;
          } catch { /* abaikan */ }

          return NextResponse.json({
            ok: true,
            source: "db",
            student: stu,
            class: activeClass,
            membership,
            sessions,
            tasks,
            trial,
          });
        }
      } catch (e) {
        logServerError("student-me-db", e);
      }
    }
    return NextResponse.json({ ok: false, error: safeErrorMessage(404) }, { status: 404 });
  } catch (e) {
    logServerError("student-me", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
