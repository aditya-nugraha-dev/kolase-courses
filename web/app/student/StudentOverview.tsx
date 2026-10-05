"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, GraduationCap, TrendingUp } from "lucide-react";
import { Badge, Card } from "../components/ui";

// Overview: status pendaftaran, level fit, jadwal kelas terdekat.
interface MeData {
  ok: boolean;
  source?: string;
  student: Record<string, unknown>;
  class: Record<string, unknown> | null;
}

const get = (o: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v) return v;
    if (typeof v === "number") return String(v);
  }
  return "—";
};

export default function StudentOverview() {
  const [data, setData] = useState<MeData | null>(null);

  useEffect(() => {
    fetch("/api/student/me").then((r) => r.json()).then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-sm text-ink/60">Memuat data portal…</p>;

  const st = (data.student ?? {}) as Record<string, unknown>;
  const cls = (data.class ?? {}) as Record<string, unknown>;
  const sid = get(st, "studentId", "student_id");
  const name = get(st, "fullName", "full_name", "nama");
  const status = get(st, "status", "current_status", "Current_Status");
  const fit = get(st, "a2Fit", "a2_fit");
  const placement = get(st, "placementScore", "placement_total");
  const pre = get(st, "preCheck", "pre_check_score");
  const post = get(st, "postCheck", "post_check_score");
  const gain = get(st, "gainScore", "gain_score");
  const classId = get(st, "classId", "class_id", "pilot_class_id");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">OVERVIEW DASHBOARD</p>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">Halo, {name} 👋</h1>
        <p className="mt-1 text-sm text-ink/70">
          Student ID <code className="rounded bg-sand-soft px-1.5 py-0.5 text-xs font-bold">{sid}</code>
          {data.source === "mock" && <span className="ml-2 text-xs text-ink/40">(preview)</span>}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl">
          <GraduationCap size={20} className="text-navy" />
          <p className="mt-2 text-xs font-bold text-ink/60">STATUS PENDAFTARAN</p>
          <p className="mt-1"><Badge tone="blue">{status}</Badge></p>
          <p className="mt-2 text-xs text-ink/60">REGISTERED → ASSIGNED → ACTIVE</p>
        </Card>
        <Card className="rounded-xl">
          <TrendingUp size={20} className="text-navy" />
          <p className="mt-2 text-xs font-bold text-ink/60">LEVEL FIT</p>
          <p className="mt-1"><Badge tone={fit === "A2_CONFIRMED" ? "green" : "amber"}>{fit}</Badge></p>
          <p className="mt-2 text-xs text-ink/60">Placement {placement}/50 • Pre {pre}/10</p>
        </Card>
        <Card className="rounded-xl">
          <CalendarDays size={20} className="text-navy" />
          <p className="mt-2 text-xs font-bold text-ink/60">JADWAL KELAS TERDEKAT</p>
          <p className="mt-1 font-display text-base font-extrabold text-ink">{classId}</p>
          <p className="mt-1 text-xs text-ink/60">{get(cls, "schedule", "jadwal")}</p>
        </Card>
      </div>

      <Card className="rounded-xl">
        <h2 className="font-display text-base font-extrabold text-ink">Ringkasan progres</h2>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["Pre-Check", `${pre}/10`],
            ["Post-Check", `${post}/10`],
            ["Gain", gain === "—" ? "—" : `+${gain}`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-ivory px-2 py-3">
              <p className="text-[11px] font-bold text-ink/60">{k}</p>
              <p className="font-display text-xl font-extrabold text-ink">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link href="/student/kelas" className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory hover:bg-navy">
            Buka Kelas & Materi <ArrowRight size={16} />
          </Link>
          <Link href="/student/progress" className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-sand bg-paper px-5 py-3 text-sm font-bold text-ink hover:border-ink">
            Lihat Feedback & Progres
          </Link>
        </div>
      </Card>
    </div>
  );
}
