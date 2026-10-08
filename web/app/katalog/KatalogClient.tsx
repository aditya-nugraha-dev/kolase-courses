"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Gift, Search } from "lucide-react";
import { Badge, Card, Input } from "../components/ui";

interface ClassRow {
  id: string;
  nama: string;
  level: string;
  kategori: string;
  jadwal: string;
  guru: string;
  teacher_name?: string;
  harga: number;
  kuota: number;
  sesi_count: number;
  class_status: string;
  deskripsi?: string;
  filled: number;
  occupancy_pct: number;
}

const FILTERS = ["ALL", "OPEN", "COMING_SOON", "FULL"] as const;

export default function KatalogClient() {
  const [rows, setRows] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [f, setF] = useState<string>("ALL");

  useEffect(() => {
    let live = true;
    fetch("/api/katalog")
      .then((r) => r.json())
      .then((j) => {
        if (live && j.ok && Array.isArray(j.rows)) setRows(j.rows as ClassRow[]);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((c) => {
      if (f !== "ALL" && c.class_status !== f) return false;
      if (!query) return true;
      return `${c.nama} ${c.id} ${c.guru} ${c.level}`.toLowerCase().includes(query);
    });
  }, [rows, q, f]);

  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">KATALOG • PILIH KELASMU</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">
          Katalog Kelas KOLASE
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/70">
          Belum yakin? <Link href="/daftar" className="font-bold text-navy underline">Mulai trial 7 sesi gratis</Link> dulu — tanpa bayar.
        </p>

        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kelas / guru…" className="pl-10" aria-label="Cari kelas" />
          </div>
          <div className="flex gap-2">
            {FILTERS.map((x) => (
              <button
                key={x}
                onClick={() => setF(x)}
                aria-pressed={f === x}
                className={`rounded-full border px-3.5 py-2 text-xs font-bold ${f === x ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70"}`}
              >
                {x === "ALL" ? "Semua" : x.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="mt-8 text-center text-sm text-ink/60">Memuat katalog…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-center text-sm text-ink/60">Belum ada kelas yang cocok.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card key={c.id} className="flex flex-col rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <code className="rounded bg-ivory px-2 py-0.5 text-xs font-bold">{c.id}</code>
                  <Badge tone={c.class_status === "OPEN" ? "green" : c.class_status === "FULL" ? "red" : "amber"}>
                    {c.class_status.replace("_", " ")}
                  </Badge>
                </div>
                <h2 className="font-display mt-2 text-lg font-extrabold text-ink">{c.nama}</h2>
                <p className="mt-1 text-xs text-ink/60">{c.level} • {c.kategori} • {c.sesi_count} sesi</p>
                <p className="mt-1 text-sm text-ink/70">{c.jadwal}</p>
                <p className="text-sm text-ink/70">dengan <b>{c.guru || c.teacher_name || "Tim KOLASE"}</b></p>
                {c.deskripsi && <p className="mt-1 line-clamp-2 text-xs text-ink/55">{c.deskripsi}</p>}
                <div className="mt-2">
                  <p className="text-xs font-bold text-ink/70">{c.filled}/{c.kuota} terisi • {c.occupancy_pct}%</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ivory">
                    <div
                      className={`h-full rounded-full ${c.occupancy_pct >= 100 ? "bg-rose-500" : c.occupancy_pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, c.occupancy_pct)}%` }}
                    />
                  </div>
                </div>
                <p className="font-display mt-3 text-xl font-extrabold text-ink">
                  Rp {Number(c.harga ?? 0).toLocaleString("id-ID")}
                </p>
                <div className="mt-3 grid gap-2">
                  <Link href="/daftar" className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-ink px-4 py-2 text-sm font-bold text-ivory hover:bg-navy">
                    Daftar Kelas Ini
                  </Link>
                  <Link href="/daftar" className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-sand-soft px-4 py-2 text-sm font-bold text-ink hover:bg-sand">
                    <Gift size={15} /> Coba 7 Sesi Gratis
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
