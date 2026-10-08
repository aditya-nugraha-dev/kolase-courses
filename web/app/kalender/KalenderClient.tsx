"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge, Card } from "../components/ui";

interface SessionRow {
  session_id: string;
  class_id: string;
  class_name: string;
  seq: number;
  tanggal: string;
  status: string;
}

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function KalenderClient() {
  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async (yy: number, mm: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/kalender?y=${yy}&m=${mm}`);
      const j = await r.json();
      if (j.ok && Array.isArray(j.rows)) setRows(j.rows as SessionRow[]);
      else setRows([]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!live) return;
      await load(y, m);
    })();
    return () => {
      live = false;
    };
  }, [y, m, load]);

  const byDay = new Map<string, SessionRow[]>();
  for (const s of rows) {
    const d = String(s.tanggal).slice(0, 10);
    const arr = byDay.get(d) ?? [];
    arr.push(s);
    byDay.set(d, arr);
  }

  const first = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const total = new Date(y, m, 0).getDate();
  const prevTotal = new Date(y, m - 1, 0).getDate();
  const cells: Array<{ d: number; muted: boolean; key: string }> = [];
  for (let i = first - 1; i >= 0; i--) {
    const d = prevTotal - i;
    const pm = m === 1 ? 12 : m - 1;
    const py = m === 1 ? y - 1 : y;
    cells.push({ d, muted: true, key: `${py}-${String(pm).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  for (let d = 1; d <= total; d++) {
    cells.push({ d, muted: false, key: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }

  const prev = () => {
    if (m === 1) {
      setY(y - 1);
      setM(12);
    } else setM(m - 1);
    setSelected(null);
  };
  const next = () => {
    if (m === 12) {
      setY(y + 1);
      setM(1);
    } else setM(m + 1);
    setSelected(null);
  };

  const selRows = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">KALENDER • JADWAL SESI</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">
          Kalender Kelas
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/70">
          Klik tanggal bertitik untuk melihat sesi. Ingin ikut? <Link href="/daftar" className="font-bold text-navy underline">Mulai trial gratis</Link>.
        </p>

        <Card className="mx-auto mt-6 max-w-3xl rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink">{BULAN[m - 1]} {y}</h2>
            <span className="flex gap-1">
              <button aria-label="Bulan sebelumnya" onClick={prev} className="rounded-full p-2 text-ink/50 hover:bg-ivory hover:text-ink">
                <ChevronLeft size={16} />
              </button>
              <button aria-label="Bulan berikutnya" onClick={next} className="rounded-full p-2 text-ink/50 hover:bg-ivory hover:text-ink">
                <ChevronRight size={16} />
              </button>
            </span>
          </div>
          {loading ? (
            <p className="py-6 text-center text-sm text-ink/60">Memuat jadwal…</p>
          ) : (
            <>
              <div className="mt-2 grid grid-cols-7 text-center text-[10px] font-bold text-ink/40">
                {HARI.map((h) => <span key={h} className="py-1">{h}</span>)}
              </div>
              <div className="grid grid-cols-7 text-center">
                {cells.map((c) => {
                  const list = byDay.get(c.key) ?? [];
                  return (
                    <button
                      key={c.key}
                      disabled={c.muted || list.length === 0}
                      onClick={() => setSelected(c.key === selected ? null : c.key)}
                      className={`mx-auto flex min-h-[44px] w-full flex-col items-center justify-center rounded-xl text-sm transition ${
                        c.muted ? "text-ink/25" : list.length > 0 ? "font-bold text-ink hover:bg-sand-soft" : "text-ink/45"
                      } ${selected === c.key ? "bg-ink text-ivory" : ""}`}
                      aria-label={`${c.d} ${BULAN[m - 1]}${list.length > 0 ? ` (${list.length} sesi)` : ""}`}
                    >
                      <span>{c.d}</span>
                      {list.length > 0 && (
                        <span className="mt-0.5 flex gap-0.5">
                          {list.slice(0, 3).map((s) => (
                            <span key={s.session_id} className={`h-1.5 w-1.5 rounded-full ${selected === c.key ? "bg-sand" : "bg-orange-600"}`} />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        {selected && (
          <div className="mx-auto mt-4 max-w-3xl space-y-2">
            <p className="text-sm font-extrabold text-ink">Sesi tanggal {selected} ({selRows.length})</p>
            {selRows.map((s) => (
              <Card key={s.session_id} className="flex items-center gap-3 rounded-xl px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-sm font-extrabold text-navy">
                  S{s.seq}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm text-ink">{s.class_name}</b>
                  <span className="block truncate text-xs text-ink/55"><code>{s.class_id}</code> • {s.session_id}</span>
                </span>
                <Badge tone={s.status === "DONE" ? "green" : "slate"}>{s.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
