// GET /api/kalender?y=2026&m=10 — sesi kelas publik per bulan (tanpa login).
// Dipakai halaman /kalender + navbar Kalender.
import { NextResponse } from "next/server";
import { logServerError } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const now = new Date();
    const y = Number(url.searchParams.get("y") ?? now.getFullYear());
    const m = Number(url.searchParams.get("m") ?? now.getMonth() + 1);
    if (!Number.isInteger(y) || y < 2020 || y > 2100 || !Number.isInteger(m) || m < 1 || m > 12) {
      return NextResponse.json({ ok: false, error: "Bulan tidak valid" }, { status: 400 });
    }
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    const last = new Date(y, m, 0).getDate();
    const to = `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;

    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const { data: sessions, error } = await sb
      .from("class_sessions")
      .select("session_id,class_id,seq,tanggal,status")
      .gte("tanggal", from)
      .lte("tanggal", to)
      .order("tanggal", { ascending: true })
      .limit(300);
    if (error) throw new Error(error.message);

    const classIds = [...new Set(((sessions ?? []) as Record<string, unknown>[]).map((s) => String(s.class_id ?? "")))].filter(Boolean);
    const names: Record<string, string> = {};
    if (classIds.length > 0) {
      const { data: cls } = await sb.from("classes").select("id,nama,jadwal").in("id", classIds.slice(0, 100));
      for (const c of (cls ?? []) as Record<string, unknown>[]) {
        names[String(c.id)] = String(c.nama ?? c.id);
      }
    }
    const rows = ((sessions ?? []) as Record<string, unknown>[]).map((s) => ({
      ...s,
      class_name: names[String(s.class_id ?? "")] ?? String(s.class_id ?? ""),
    }));
    return NextResponse.json({ ok: true, source: "db", y, m, rows });
  } catch (e) {
    logServerError("kalender", e);
    return NextResponse.json({ ok: true, source: "empty", rows: [] });
  }
}
