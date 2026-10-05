// GET /api/student/me — profil + kelas + progres milik sesi student.
// RBAC: sesi student|admin|teacher. Student hanya bisa lihat miliknya sendiri.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { logServerError, safeErrorMessage } from "@/lib/security";
import { MOCK_CLASSES, MOCK_STUDENTS } from "@/lib/mock";

export async function GET() {
  try {
    const s = await getSession();
    if (!s || !["student", "admin", "teacher"].includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
    }
    const studentId = s.role === "student" ? s.sub : s.sub; // admin preview: sub=admin -> demo STU-000001
    const lookupId = s.role === "student" ? studentId : "STU-000001";

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
    const stu = MOCK_STUDENTS.find((x) => x.studentId === lookupId) ?? MOCK_STUDENTS[0];
    const cls = MOCK_CLASSES.find((c) => c.classId === stu.classId) ?? MOCK_CLASSES[0];
    return NextResponse.json({ ok: true, source: "mock", student: stu, class: cls });
  } catch (e) {
    logServerError("student-me", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
