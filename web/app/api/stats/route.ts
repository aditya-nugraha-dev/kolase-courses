// GET /api/stats — agregat big data KOLASE (khusus staff: admin/founder/academic/systems).
// Ringkasan: murid/guru/staff, omzet, okupansi kelas, funnel trial,
// distribusi placement, kehadiran, gain Pre-vs-Post, flag integritas.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/session";
import {
  checkRateLimit,
  getClientIp,
  logServerError,
  safeErrorMessage,
} from "@/lib/security";

type Row = Record<string, unknown>;
const num = (v: unknown) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown) => String(v ?? "");

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`stats:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: safeErrorMessage(429) }, { status: 429 });
  try {
    const s = await getSession();
    if (!s || !(STAFF_ROLES as readonly string[]).includes(s.role)) {
      return NextResponse.json({ ok: false, error: safeErrorMessage(403) }, { status: 403 });
    }
    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();

    const [students, teachers, staff, payments, membership, trials, placements, postclass, attendance, classes] =
      await Promise.all([
        sb.from("mst_students").select("student_id,current_status,tgl_daftar").limit(2000),
        sb.from("mst_teachers").select("teacher_id").limit(1000),
        sb.from("mst_staff").select("staff_id,role").limit(1000),
        sb.from("txn_payments").select("trx_id,nominal,method,status,tgl").limit(2000),
        sb.from("class_membership").select("enrollment_id,student_id,class_id,status,sisa").limit(2000),
        sb.from("trials").select("trial_id,student_id,class_id,status").limit(2000),
        sb.from("pilot_placements").select("pilot_student_id,student_id,placement_total,pre_check_score").limit(2000),
        sb.from("pilot_postclass").select("pilot_student_id,student_id,post_check_total").limit(2000),
        sb.from("session_attendance").select("hadir").limit(5000),
        sb.from("classes").select("id,nama,kuota,class_status").limit(200),
      ]);
    for (const r of [students, teachers, staff, payments, membership, trials, placements, postclass, attendance, classes]) {
      if (r.error) throw new Error(r.error.message);
    }
    const S = ((students.data ?? []) as Row[]);
    const T = ((teachers.data ?? []) as Row[]);
    const F = ((staff.data ?? []) as Row[]);
    const P = ((payments.data ?? []) as Row[]);
    const M = ((membership.data ?? []) as Row[]);
    const R = ((trials.data ?? []) as Row[]);
    const PL = ((placements.data ?? []) as Row[]);
    const PO = ((postclass.data ?? []) as Row[]);
    const A = ((attendance.data ?? []) as Row[]);
    const C = ((classes.data ?? []) as Row[]);

    // --- Overview ---
    const byStatus: Record<string, number> = {};
    for (const x of S) byStatus[str(x.current_status) || "UNKNOWN"] = (byStatus[str(x.current_status) || "UNKNOWN"] ?? 0) + 1;
    const staffByRole: Record<string, number> = {};
    for (const x of F) staffByRole[str(x.role) || "unknown"] = (staffByRole[str(x.role) || "unknown"] ?? 0) + 1;

    // --- Revenue ---
    const verified = P.filter((x) => x.status === "VERIFIED");
    const pending = P.filter((x) => x.status === "PENDING");
    const byMethod: Record<string, { pending: number; verified: number }> = {};
    for (const x of P) {
      const m = str(x.method) || "—";
      byMethod[m] ||= { pending: 0, verified: 0 };
      if (x.status === "VERIFIED") byMethod[m].verified += num(x.nominal);
      else if (x.status === "PENDING") byMethod[m].pending += num(x.nominal);
    }

    // --- Occupancy per kelas ---
    const occByClass: Record<string, number> = {};
    for (const m of M) {
      if (m.status === "PENDING" || m.status === "ACTIVE") occByClass[str(m.class_id)] = (occByClass[str(m.class_id)] ?? 0) + 1;
    }
    const occupancy = C.map((c) => ({
      id: str(c.id),
      nama: str(c.nama),
      status: str(c.class_status),
      terisi: occByClass[str(c.id)] ?? 0,
      kuota: num(c.kuota) || 0,
    }));

    // --- Funnel trial ---
    const funnel: Record<string, number> = { STARTED: 0, COMPLETED: 0, CONVERTED: 0, DROPPED: 0 };
    for (const t of R) {
      const k = str(t.status);
      if (k in funnel) funnel[k] += 1;
      else funnel[k] = (funnel[k] ?? 0) + 1;
    }
    const decided = (funnel.COMPLETED ?? 0) + (funnel.CONVERTED ?? 0) + (funnel.DROPPED ?? 0);

    // --- Placement (skor valid numerik saja) ---
    const validTotals = PL.map((x) => x.placement_total).filter((n) => typeof n === "number") as number[];
    const placement = {
      n: validTotals.length,
      avg: validTotals.length ? Math.round((validTotals.reduce((a, b) => a + b, 0) / validTotals.length) * 10) / 10 : 0,
      confirmed: validTotals.filter((n) => n >= 30).length,
    };

    // --- Attendance ---
    const present = A.filter((x) => x.hadir === "PRESENT" || x.hadir === "LATE").length;

    // --- Gain Pre-Check vs Post-Check 0-10 (per murid, nilai terakhir) ---
    const preById = new Map<string, number>();
    for (const x of PL) {
      const id = str(x.pilot_student_id || x.student_id);
      if (id && typeof x.pre_check_score === "number") preById.set(id, x.pre_check_score);
    }
    const gains: number[] = [];
    for (const x of PO) {
      const id = str(x.pilot_student_id || x.student_id);
      if (id && typeof x.post_check_total === "number") {
        const pre = preById.get(id);
        if (pre !== undefined) gains.push(Math.round((num(x.post_check_total) - pre) * 100) / 100);
      }
    }

    // --- Integritas ---
    const negativeSisa = M.filter((m) => num(m.sisa) < 0).map((m) => str(m.enrollment_id));
    const weekAgo = Date.now() - 7 * 86400000;
    const stalePending = P.filter((x) => x.status === "PENDING" && new Date(str(x.tgl) || Date.now()).getTime() < weekAgo);

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      overview: {
        students: S.length,
        studentsByStatus: byStatus,
        teachers: T.length,
        staffByRole,
      },
      revenue: {
        verified: verified.reduce((a, x) => a + num(x.nominal), 0),
        verifiedCount: verified.length,
        pending: pending.reduce((a, x) => a + num(x.nominal), 0),
        pendingCount: pending.length,
        byMethod,
      },
      occupancy,
      funnel: { ...funnel, decided },
      placement,
      attendance: {
        records: A.length,
        present,
        presentRate: A.length ? Math.round((present / A.length) * 1000) / 10 : 0,
      },
      gain: {
        n: gains.length,
        avg: gains.length ? Math.round((gains.reduce((a, b) => a + b, 0) / gains.length) * 100) / 100 : 0,
      },
      integrity: {
        negativeSisa,
        stalePendingCount: stalePending.length,
        stalePendingTotal: stalePending.reduce((a, x) => a + num(x.nominal), 0),
      },
    });
  } catch (e) {
    logServerError("stats", e);
    return NextResponse.json({ ok: false, error: safeErrorMessage(500) }, { status: 500 });
  }
}
