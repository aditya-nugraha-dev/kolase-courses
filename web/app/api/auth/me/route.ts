// GET /api/auth/me — kembalikan role+sub+nama dari sesi terverifikasi, atau 401 generik.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { logServerError, safeErrorMessage } from "@/lib/security";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
  let nama = "";
  try {
    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    if (s.role === "student") {
      const { data } = await sb.from("mst_students").select("preferred_name,full_name,nama").eq("student_id", s.sub).maybeSingle();
      const d = (data ?? {}) as Record<string, unknown>;
      nama = (typeof d.preferred_name === "string" && d.preferred_name) || (typeof d.full_name === "string" && d.full_name) || (typeof d.nama === "string" && d.nama) || "";
    } else if (s.role === "teacher") {
      const { data } = await sb.from("mst_teachers").select("nama").eq("teacher_id", s.sub).maybeSingle();
      nama = String((data as Record<string, unknown> | null)?.nama ?? "");
    } else {
      const { data } = await sb.from("mst_staff").select("nama").eq("staff_id", s.sub).maybeSingle();
      nama = String((data as Record<string, unknown> | null)?.nama ?? "");
    }
  } catch (e) {
    logServerError("auth-me-nama", e);
  }
  return NextResponse.json({ ok: true, role: s.role, sub: s.sub, email: s.email ?? null, nama });
}
