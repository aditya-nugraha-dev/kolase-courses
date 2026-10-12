"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Badge, Card } from "../../components/ui";

interface Stats {
  at: string;
  overview: { students: number; studentsByStatus: Record<string, number>; teachers: number; staffByRole: Record<string, number> };
  revenue: { verified: number; verifiedCount: number; pending: number; pendingCount: number; byMethod: Record<string, { pending: number; verified: number }> };
  occupancy: Array<{ id: string; nama: string; status: string; terisi: number; kuota: number }>;
  funnel: Record<string, number>;
  placement: { n: number; avg: number; confirmed: number };
  attendance: { records: number; present: number; presentRate: number };
  gain: { n: number; avg: number };
  integrity: { negativeSisa: string[]; stalePendingCount: number; stalePendingTotal: number };
}

const rp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const TABS = ["students", "teachers", "staff", "payments", "membership", "ledger", "trials", "placements", "attendance"] as const;

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-ink/70"><span>{label}</span><span className="font-bold text-ink">{value}</span></div>
      <div className="mt-1 h-2 rounded-full bg-ink/10"><div className="h-2 rounded-full bg-navy" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function DataClient() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        if (j.ok) setData(j as Stats);
        else setErr("Gagal memuat (butuh login staff + Supabase).");
      })
      .catch(() => { if (live) setErr("Gagal memuat (butuh login staff + Supabase)."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  if (loading) return <Card><p className="text-sm">Memuat agregat…</p></Card>;
  if (err || !data) return <Card><p className="text-sm">{err || "Tidak ada data."}</p></Card>;

  const fmax = Math.max(1, ...Object.values(data.funnel).map(Number));
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><p className="text-xs text-ink/60">Murid</p><p className="text-2xl font-extrabold">{data.overview.students}</p></Card>
        <Card><p className="text-xs text-ink/60">Omzet Verified</p><p className="text-2xl font-extrabold">{rp(data.revenue.verified)}</p><p className="text-xs text-ink/60">{data.revenue.verifiedCount} trx</p></Card>
        <Card><p className="text-xs text-ink/60">Pending</p><p className="text-2xl font-extrabold">{rp(data.revenue.pending)}</p><p className="text-xs text-ink/60">{data.revenue.pendingCount} trx</p></Card>
        <Card><p className="text-xs text-ink/60">Kehadiran</p><p className="text-2xl font-extrabold">{data.attendance.presentRate}%</p><p className="text-xs text-ink/60">{data.attendance.present}/{data.attendance.records} hadir</p></Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-bold">Funnel Trial</h3>
          {Object.entries(data.funnel).map(([k, v]) => <Bar key={k} label={k} value={Number(v)} max={fmax} />)}
        </Card>
        <Card>
          <h3 className="mb-2 font-bold">Placement & Gain</h3>
          <p className="text-sm">Tes: <b>{data.placement.n}</b> • Rata-rata: <b>{data.placement.avg}/50</b> • A2 confirmed: <b>{data.placement.confirmed}</b></p>
          <p className="mt-1 text-sm">Gain Pre→Post: <b>{data.gain.avg >= 0 ? "+" : ""}{data.gain.avg}</b> <span className="text-ink/60">({data.gain.n} murid)</span></p>
          <h3 className="mb-2 mt-4 font-bold">Okupansi Kelas</h3>
          {data.occupancy.length === 0 && <p className="text-sm text-ink/60">Belum ada kelas.</p>}
          {data.occupancy.map((c) => (
            <div key={c.id} className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{c.nama || c.id} <Badge>{c.status || "—"}</Badge></span>
              <span className="font-bold">{c.terisi}/{c.kuota || "—"}</span>
            </div>
          ))}
        </Card>
      </div>

      {(data.integrity.negativeSisa.length > 0 || data.integrity.stalePendingCount > 0) && (
        <Card>
          <h3 className="mb-2 font-bold">Flag Integritas</h3>
          {data.integrity.negativeSisa.length > 0 && <p className="text-sm">Sisa negatif: <b>{data.integrity.negativeSisa.join(", ")}</b> — rekonsiliasi ledger.</p>}
          {data.integrity.stalePendingCount > 0 && <p className="text-sm">Pending &gt;7 hari: <b>{data.integrity.stalePendingCount} trx ({rp(data.integrity.stalePendingTotal)})</b></p>}
        </Card>
      )}

      <Card>
        <h3 className="mb-2 font-bold">Ekspor CSV</h3>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <a key={t} href={`/api/stats/export?tab=${t}`} className="inline-flex items-center gap-1 rounded-lg border border-navy px-3 py-2 text-sm font-bold text-navy hover:bg-navy hover:text-ivory">
              <Download size={14} /> {t}
            </a>
          ))}
        </div>
      </Card>
      <p className="text-xs text-ink/50">Diambil {new Date(data.at).toLocaleString("id-ID")} • sumber Supabase (service_role).</p>
    </div>
  );
}
