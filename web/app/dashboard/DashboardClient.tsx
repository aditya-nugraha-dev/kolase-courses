"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MOCK_CLASSES, MOCK_STUDENTS, type CurrentStatus } from "@/lib/mock";
import { Badge, Card, DataTable, Input } from "../components/ui";

const STATUS_FILTERS: Array<"ALL" | CurrentStatus> = ["ALL", "REGISTERED", "ASSIGNED", "COMPLETED"];

function fitTone(fit: string): "green" | "amber" | "slate" {
  if (fit === "A2_CONFIRMED") return "green";
  if (fit === "PLACEMENT_PENDING") return "amber";
  return "slate";
}

export default function DashboardClient() {
  const [status, setStatus] = useState<"ALL" | CurrentStatus>("ALL");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_STUDENTS.filter((s) => {
      if (status !== "ALL" && s.status !== status) return false;
      if (!q) return true;
      return s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });
  }, [status, query]);

  return (
    <div className="space-y-4">
      <Card className="rounded-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Name / Email…"
              className="pl-10"
              aria-label="Cari nama atau email"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter status">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={status === f}
                onClick={() => setStatus(f)}
                className={`rounded-full border px-4 py-2 text-xs font-bold ${status === f ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70 hover:border-sand-deep"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-ink/60">
          Menampilkan <b>{rows.length}</b> dari {MOCK_STUDENTS.length} siswa • Gain = Post − Pre (0–10) • Placement 0–50
        </p>
      </Card>

      <DataTable
        columns={["Student ID", "Full Name", "Placement", "A2 Fit", "Class ID", "Attendance", "Gain", "Status"]}
        rows={rows.map((s) => [
          <code key="id" className="rounded bg-ivory px-2 py-0.5 text-xs font-bold">{s.studentId}</code>,
          <span key="n"><b>{s.fullName}</b><br /><span className="text-xs text-ink/60">{s.email}</span></span>,
          <b key="p">{s.placementScore ?? "—"}</b>,
          <Badge key="f" tone={fitTone(s.a2Fit)}>{s.a2Fit}</Badge>,
          <code key="c" className="rounded bg-ivory text-navy">{s.classId}</code>,
          s.attendance ? <Badge key="a" tone={s.attendance === "ATTENDED" ? "green" : "red"}>{s.attendance}</Badge> : <span key="a" className="text-ink/40">—</span>,
          <b key="g" className={s.gainScore != null && s.gainScore > 0 ? "text-emerald-700" : ""}>
            {s.gainScore != null ? `+${s.gainScore}` : "—"}
          </b>,
          <Badge key="s" tone="blue">{s.status}</Badge>,
        ])}
      />

      <h2 className="font-display pt-2 text-lg font-extrabold text-ink">Content Calendar Preview (01)</h2>
      <DataTable
        columns={["Class ID", "Class", "Schedule", "Teacher", "Slots", "Status"]}
        rows={MOCK_CLASSES.map((c) => [
          <code key="id" className="rounded bg-ivory px-2 py-0.5 text-xs font-bold">{c.classId}</code>,
          <b key="n">{c.name}</b>,
          <span key="s" className="text-ink/70">{c.schedule}</span>,
          c.teacher,
          c.slots,
          <Badge key="st" tone={c.status === "OPEN" ? "green" : "slate"}>{c.status}</Badge>,
        ])}
      />
      <p className="text-xs text-ink/60">
        Data di atas mock preview. Data live via Supabase (<code>mst_students</code>, <code>classes</code>) & Google Sheets mirror — kelola via <a href="/core" className="font-bold text-navy">/core</a>.
      </p>
    </div>
  );
}
