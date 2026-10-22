import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock3, ShieldCheck, Users } from "lucide-react";
import { Badge } from "../ui";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-ivory">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-violet/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-cyan/20 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="sand">KIDS 6–12 • TEENS & ADULTS 13+</Badge>
            <Badge tone="blue">KELAS KECIL 3–5 PESERTA</Badge>
          </div>
          <h1 className="font-display mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Bahasa Inggris yang dipakai, bukan cuma dihafal
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/85 sm:text-base">
            KOLASE punya dua jalur resmi: Little Speakers untuk anak 6–12 tahun dan
            Beginner English untuk 13+. Semua sesi 60 menit, kelompok kecil, dengan
            pendampingan yang terarah.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/katalog"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-sand px-6 py-3.5 text-base font-bold text-ink hover:bg-sand-deep"
            >
              Lihat Katalog & Harga <ArrowRight size={18} />
            </Link>
            <Link
              href="/#kurikulum"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-ivory/30 px-6 py-3.5 text-base font-semibold text-ivory hover:bg-white/10"
            >
              Lihat Jalur Belajar
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center sm:max-w-md">
            {[
              { icon: Users, top: "3–5", bottom: "siswa/kelas" },
              { icon: Clock3, top: "60 mnt", bottom: "per sesi" },
              { icon: ShieldCheck, top: "6–12", bottom: "fokus Kids" },
            ].map((s) => (
              <div key={s.bottom} className="rounded-xl border border-ivory/15 bg-white/5 px-2 py-3">
                <s.icon size={18} className="mx-auto text-sand" />
                <p className="font-display mt-1 text-lg font-extrabold">{s.top}</p>
                <p className="text-[11px] text-ivory/70">{s.bottom}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-sand/40 bg-paper p-5 text-ink shadow-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold tracking-[0.18em] text-navy">KATALOG RESMI 2026</p>
            <span className="rounded-full bg-cyan/15 px-3 py-1 text-xs font-bold text-cyan-deep">Pendaftaran dibuka</span>
          </div>
          <h2 className="font-display mt-2 text-xl font-extrabold text-ink">Empat program, satu standar</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { name: "Kids Public Class", detail: "4 sesi • Rp50.000 promo" },
              { name: "Kids Term Program", detail: "10 sesi • Rp650.000 alumni / Rp750.000" },
              { name: "Beginner English (13+)", detail: "4 sesi • Rp75.000" },
              { name: "Small Group (13+)", detail: "6–45 sesi • Rp450.000–Rp3.150.000" },
            ].map((t) => (
              <li key={t.name} className="flex items-start gap-2 text-ink/80">
                <CalendarCheck size={16} className="mt-0.5 shrink-0 text-navy" />
                <span>
                  <b>{t.name}</b>
                  <span className="block text-xs text-ink/60">{t.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-ivory p-3 text-xs leading-relaxed text-ink/70">
            Alur Kids: <b>Kids Public Class → Entry Assessment → Kids Term Program</b>.
            Alur 13+: <b>Beginner English → Diagnostic Placement → Small Group</b>.
          </div>
          <Link href="/katalog" className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-bold text-ivory hover:bg-navy">
            Buka Katalog Lengkap
          </Link>
        </div>
      </div>
    </section>
  );
}
