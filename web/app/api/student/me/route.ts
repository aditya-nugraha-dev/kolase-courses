// GET /api/student/me — profil + kelas + progres milik sesi student.
// RBAC: sesi student|admin|teacher. Student hanya bisa lihat miliknya sendiri.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { logServerError, safeErrorMessage } from "@/lib/security";

export async function GET() {
  try {
    const s = await getSession();
    if (!s || !["student", "admin", "teacher"].includes(s.role)) {
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
          const classId = (stu as Record<string, unknown>).class_id ?? "CLS-000001";
          const { data: cls } = await sb.from("classes").select("*").eq("id", String(classId)).limit(1).maybeSingle();
          return NextResponse.json({ ok: true, source: "db", student: stu, class: cls ?? null });
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
