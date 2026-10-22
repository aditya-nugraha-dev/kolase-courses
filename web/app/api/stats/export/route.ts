// GET /api/stats/export?tab=students|teachers|... — unduh CSV (khusus staff).
// Allowlist tabel+kolom tetap; sanitasi formula-injection untuk Excel.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/session";
import {
  checkRateLimit,
  getClientIp,
  logServerError,
  safeErrorMessage,
} from "@/lib/security";
import { statsExportSchema } from "@/lib/schemas";

const TABS = {
  students: { table: "mst_students", order: "tgl_daftar", desc: true, file: "murid", cols: ["student_id", "nama", "email", "wa", "tgl_daftar", "current_status", "placement_total"] },
  teachers: { table: "mst_teachers", order: "nama", desc: false, file: "guru", cols: ["teacher_id", "nama", "email", "wa"] },
  staff: { table: "mst_staff", order: "staff_id", desc: false, file: "staff", cols: ["staff_id", "nama", "email", "wa", "role"] },
  payments: { table: "txn_payments", order: "tgl", desc: true, file: "pembayaran", cols: ["trx_id", "enrollment_id", "student_id", "class_id", "nominal", "method", "status", "tgl"] },
  membership: { table: "class_membership", order: "enrollment_id", desc: false, file: "membership", cols: ["enrollment_id", "student_id", "class_id", "status", "sisa", "activated_at", "expires_at"] },
  ledger: { table: "txn_entitlement_ledger", order: "at", desc: true, file: "ledger", cols: ["at", "enrollment_id", "student_id", "delta", "reason", "balance_after"] },
  placements: { table: "pilot_placements", order: "created_at", desc: true, file: "placement", cols: ["pilot_student_id", "placement_total", "pre_check_score", "created_at"] },
  attendance: { table: "session_attendance", order: "recorded_at", desc: true, file: "absensi", cols: ["session_id", "student_id", "hadir", "recorded_by", "recorded_at"] },
} as const;

// Cegah CSV formula injection (=,+,-,@ di awal sel) + escape kutip RFC 4180.
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`stats-export:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !(STAFF_ROLES as readonly string[]).includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const url = new URL(req.url);
    const parsed = statsExportSchema.safeParse({ tab: url.searchParams.get("tab") ?? "" });
    if (!parsed.success) return NextResponse.json({ ok: false, error: safeErrorMessage(400) }, { status: 400 });
    const cfg = TABS[parsed.data.tab];

    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const { data, error } = await sb
      .from(cfg.table)
      .select(cfg.cols.join(","))
      .order(cfg.order, { ascending: !cfg.desc })
      .limit(2000);
    if (error) throw new Error(error.message);

    const head = cfg.cols.join(",");
    const body = ((data ?? []) as unknown as Array<Record<string, unknown>>)
      .map((r) => cfg.cols.map((c) => cell(r[c])).join(","))
      .join("\r\n");
    const csv = "\uFEFF" + head + "\r\n" + body + "\r\n";
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="kolase-${cfg.file}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    logServerError("stats-export", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
