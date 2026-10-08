// GET /api/katalog — katalog kelas publik (tanpa login).
// Field aman katalog + okupansi terisi/kuota untuk halaman /katalog.
import { NextResponse } from "next/server";
import { logServerError, safeErrorMessage } from "@/lib/security";

export async function GET() {
  try {
    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const { data, error } = await sb
      .from("classes")
      .select("id,nama,level,kategori,jadwal,guru,teacher_name,harga,harga_coret,kuota,sesi_count,class_status,deskripsi,duration_minutes")
      .order("id", { ascending: true })
      .limit(100);
    if (error) throw new Error(error.message);
    const rows = await Promise.all(
      ((data ?? []) as Record<string, unknown>[]).map(async (r) => {
        const cid = String(r.id ?? "");
        let filled = 0;
        try {
          const { count } = await sb
            .from("class_membership")
            .select("enrollment_id", { count: "exact", head: true })
            .eq("class_id", cid)
            .in("status", ["PENDING", "ACTIVE"]);
          filled = count ?? 0;
        } catch { /* abaikan */ }
        const kuota = Number(r.kuota ?? 0);
        return {
          ...r,
          filled,
          remaining: kuota > 0 ? Math.max(0, kuota - filled) : 0,
          occupancy_pct: kuota > 0 ? Math.round((filled / kuota) * 100) : 0,
        };
      })
    );
    return NextResponse.json({ ok: true, source: "db", rows });
  } catch (e) {
    logServerError("katalog", e);
    return NextResponse.json({ ok: true, source: "empty", rows: [] });
  }
}

export async function POST() {
  return NextResponse.json({ ok: false, error: safeErrorMessage(404) }, { status: 404 });
}
