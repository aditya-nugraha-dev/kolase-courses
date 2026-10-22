"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  Clock3,
  Search,
  Users,
} from "lucide-react";
import { Badge, Card, Input } from "../components/ui";
import { PROGRAMS, SEGMENT_LABEL, priceLabel, type Segment } from "@/lib/catalog";

type Filter = "all" | Segment;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "kids", label: "Kids 6–12" },
  { id: "teens-adults", label: "Teens & Adults 13+" },
];

export default function KatalogClient() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return PROGRAMS.filter((p) => {
      if (f !== "all" && p.segment !== f) return false;
      if (!query) return true;
      return `${p.name} ${p.summary} ${p.assessment} ${p.ageLabel}`
        .toLowerCase()
        .includes(query);
    });
  }, [q, f]);

  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">
          KATALOG RESMI 2026
        </p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">
          Katalog Program KOLASE
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-ink/70">
          Dua segmen, empat program. Semua sesi 60 menit. Harga mengikuti
          KOL-SOP-INT-001 V1.4 §2.1.
        </p>

        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari program, usia, atau asesmen…"
              className="pl-10"
              aria-label="Cari program"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((x) => (
              <button
                key={x.id}
                onClick={() => setF(x.id)}
                aria-pressed={f === x.id}
                className={`rounded-full border px-3.5 py-2 text-xs font-bold ${
                  f === x.id
                    ? "border-ink bg-ink text-ivory"
                    : "border-sand/40 bg-paper text-ink/70"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 text-center text-sm text-ink/60">
            Belum ada program yang cocok.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {filtered.map((p) => (
              <Card key={p.id} className="flex flex-col rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone={p.segment === "kids" ? "sand" : "navy"}>
                    {SEGMENT_LABEL[p.segment]}
                  </Badge>
                  <Badge tone={p.status === "OPEN" ? "green" : "amber"}>
                    {p.status === "OPEN" ? "PENDAFTARAN DIBUKA" : "SEGERA"}
                  </Badge>
                </div>

                <h2 className="font-display mt-2 text-xl font-extrabold text-ink">
                  {p.name}
                </h2>
                <p className="text-xs font-bold text-navy">{p.ageLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.summary}</p>

                <div className="mt-3 grid gap-2 text-xs">
                  <p className="flex items-start gap-2 text-ink/70">
                    <CalendarCheck size={14} className="mt-0.5 shrink-0 text-navy" />
                    <span>
                      <b>{p.sessionsLabel}</b> • {p.durationMinutes} menit per sesi
                    </span>
                  </p>
                  <p className="flex items-start gap-2 text-ink/70">
                    <Users size={14} className="mt-0.5 shrink-0 text-navy" />
                    <span>{p.format}</span>
                  </p>
                  <p className="flex items-start gap-2 text-ink/70">
                    <ClipboardCheck size={14} className="mt-0.5 shrink-0 text-navy" />
                    <span>{p.assessment}</span>
                  </p>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {p.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs leading-relaxed text-ink/70"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sand-deep" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {p.packages ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.packages.map((pkg) => (
                      <span
                        key={pkg.sessions}
                        className="rounded-full border border-sand/50 bg-ivory px-2.5 py-1 text-[11px] font-bold text-ink/70"
                        title={pkg.price ? `Rp${pkg.price.toLocaleString("id-ID")}` : pkg.note}
                      >
                        {pkg.sessions} sesi • {pkg.label}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-auto pt-4">
                  <p className="font-display text-lg font-extrabold text-ink">
                    {priceLabel(p)}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Link
                      href="/daftar"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-ink px-4 py-2 text-sm font-bold text-ivory hover:bg-navy"
                    >
                      Daftar program ini
                    </Link>
                    <Link
                      href={p.nextHref}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-sand bg-paper px-4 py-2 text-sm font-bold text-ink hover:border-ink"
                    >
                      {p.segment === "kids" ? "Lihat Little Speakers" : "Info program"}{" "}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <p className="mx-auto mt-6 flex max-w-2xl items-start gap-2 text-xs leading-relaxed text-ink/55">
          <Clock3 size={14} className="mt-0.5 shrink-0" />
          Harga Small Group 10/15/30 sesi mengikuti struktur alumni & reguler dan
          dikonfirmasi tim sebelum pembayaran.
        </p>
      </div>
    </div>
  );
}
