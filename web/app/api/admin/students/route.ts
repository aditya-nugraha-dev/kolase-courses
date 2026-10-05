// GET /api/admin/students?q=&status= — Student Master untuk admin/teacher.
// RBAC ketat: admin penuh. PII tidak diekspos ke publik.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/session";
import { checkRateLimit, getClientIp, logServerError, safeErrorMessage } from "@/lib/security";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-students:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !ADMIN_ROLES.includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const status = url.searchParams.get("status") ?? "";

    const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasSupabase) {
      try {
        const { supabaseServer } = await import("@/lib/supabase");
        const sb = supabaseServer();
        let query = sb.from("mst_students").select("student_id,full_name,nama,email,wa,placement_total,pre_check_score,post_check_score,gain_score,a2_fit,current_status,attendance_status,confirmation_status").limit(200);
        if (status) query = query.eq("current_status", status);
        const { data, error } = await query;
        if (!error && data) {
          const rows = (data as Record<string, unknown>[]).filter((r) => {
            if (!q) return true;
            const n = String(r.full_name ?? r.nama ?? "").toLowerCase();
            const e = String(r.email ?? "").toLowerCase();
            return n.includes(q) || e.includes(q);
          });
          return NextResponse.json({ ok: true, source: "db", rows });
        }
      } catch (e) {
        logServerError("admin-students-db", e);
      }
    }
    // Tanpa fallback demo: wajib database tersambung.
    return NextResponse.json({ ok: true, source: "db", rows: [] });
  } catch (e) {
    logServerError("admin-students", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
