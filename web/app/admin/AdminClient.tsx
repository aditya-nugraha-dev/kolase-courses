"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Badge, Card, DataTable, Input } from "../components/ui";

interface Row {
  studentId: string;
  fullName: string;
  email: string;
  wa: string;
  fit: string;
  classId: string;
  attendance: string;
  placement: string;
  gain: string;
  status: string;
}

function normalize(r: Record<string, unknown>): Row {
  const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
  return {
    studentId: str(r.studentId ?? r.student_id),
    fullName: str(r.fullName ?? r.full_name ?? r.nama),
    email: str(r.email),
    wa: str(r.wa ?? r.WhatsApp ?? r.whatsapp),
    fit: str(r.a2Fit ?? r.a2_fit) || "PLACEMENT_PENDING",
    classId: str(r.classId ?? r.class_id) || "—",
    attendance: str(r.attendance ?? r.attendance_status) || "—",
    placement: str(r.placementScore ?? r.placement_total),
    gain: str(r.gainScore ?? r.gain_score),
    status: str(r.status ?? r.current_status) || "REGISTERED",
  };
}

const FILTERS = ["ALL", "REGISTERED", "ASSIGNED", "COMPLETED", "PLACEMENT_SUBMITTED"] as const;

export default function AdminClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [source, setSource] = useState("…");
  const [status, setStatus] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const p = new URLSearchParams();
    if (appliedQ.trim()) p.set("q", appliedQ.trim());
    if (status !== "ALL") p.set("status", status);
    fetch(`/api/admin/students?${p.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        if (j.ok && Array.isArray(j.rows)) {
          setRows(j.rows.map(normalize));
          setSource(j.source ?? "?");
        } else {
          setRows([]);
        }
      })
      .catch(() => { if (live) setRows([]); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [status, appliedQ]);

  const filtered = rows;

  const stats = useMemo(() => ({
    total: rows.length,
    confirmed: rows.filter((r) => r.fit === "A2_CONFIRMED").length,
    attended: rows.filter((r) => r.attendance === "ATTENDED").length,
  }), [rows]);

  const exportCsv = () => {
    const head = ["Student_ID", "Full_Name", "Email", "WhatsApp", "Level_Fit", "Class_ID", "Attendance", "Placement", "Gain", "Status"];
    const lines = filtered.map((r) => [r.studentId, r.fullName, r.email, r.wa, r.fit, r.classId, r.attendance, r.placement, r.gain, r.status]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "04_STUDENT_MASTER.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">04_STUDENT_MASTER • RESTRICTED</p>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">Student Master Table</h1>
        <p className="mt-1 text-sm text-ink/70">Sumber: <b>{source}</b> • Filter status, cari nama/email, export rekap CSV.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ["Total murid", stats.total],
          ["A2 Confirmed", stats.confirmed],
          ["Attended", stats.attended],
        ].map(([k, v]) => (
          <Card key={k as string} className="rounded-xl px-2 py-3">
            <p className="text-[11px] font-bold text-ink/60">{k}</p>
            <p className="font-display text-2xl font-extrabold text-ink">{v}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(e) => { e.preventDefault(); setLoading(true); setAppliedQ(query); }}
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search nama / email…" className="pl-10" aria-label="Cari nama atau email" />
          </div>
          <button type="submit" className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-ink px-4 py-2 text-sm font-bold text-ivory hover:bg-navy">
            Cari
          </button>
          <button type="button" onClick={exportCsv} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-sand bg-paper px-4 py-2 text-sm font-bold text-ink hover:border-ink">
            <Download size={16} /> Export CSV
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => { setLoading(true); setStatus(f); }} aria-pressed={status === f}
              className={`rounded-full border px-4 py-2 text-xs font-bold ${status === f ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70 hover:border-sand-deep"}`}>
              {f}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-ink/60">Memuat…</p>
      ) : (
        <DataTable
          columns={["Student ID", "Nama", "Kontak", "Level Fit", "Class", "Hadir", "Placement", "Gain", "Status"]}
          rows={filtered.map((r) => [
            <code key="id" className="rounded bg-ivory px-2 py-0.5 text-xs font-bold">{r.studentId}</code>,
            <b key="n">{r.fullName}</b>,
            <span key="c" className="text-xs text-ink/70">{r.email}<br />{r.wa}</span>,
            <Badge key="f" tone={r.fit === "A2_CONFIRMED" ? "green" : r.fit === "PLACEMENT_PENDING" ? "amber" : "slate"}>{r.fit}</Badge>,
            <code key="cl" className="rounded bg-ivory text-navy">{r.classId}</code>,
            r.attendance === "ATTENDED"
              ? <Badge key="a" tone="green">ATTENDED</Badge>
              : r.attendance === "NO_SHOW"
                ? <Badge key="a" tone="red">NO_SHOW</Badge>
                : <span key="a" className="text-ink/40">—</span>,
            <b key="p">{r.placement || "—"}</b>,
            <b key="g" className="text-emerald-700">{r.gain ? `+${r.gain}` : "—"}</b>,
            <Badge key="s" tone="blue">{r.status}</Badge>,
          ])}
        />
      )}
    </div>
  );
}
