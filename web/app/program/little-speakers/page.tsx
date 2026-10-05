import Link from "next/link";
import type { Metadata } from "next";
import PosterCard from "../../components/PosterCard";
import { Badge, Card, SectionHeading } from "../../components/ui";

export const metadata: Metadata = {
  title: "Little Speakers (Kids) — KOLASE",
  description: "Program Kids <13: Entry Assessment 10–15 menit, batch kecil, attendance, session report, parent update.",
};

const ALUR = [
  { n: "1", t: "Batch", d: "01_BATCHES — pengelompokan kecil se-usia & se-jadwal. Link Meet dibagikan per batch." },
  { n: "2", t: "Attendance", d: "02_ATTENDANCE — kehadiran dicatat tiap sesi, terpantau di Portal Murid." },
  { n: "3", t: "Session Report", d: "03_SESSION_REPORTS — Teacher Session Report setelah kelas: partisipasi, kosakata, keberanian bicara." },
  { n: "4", t: "Parent Update", d: "Operations & Parent Communication Kit V1.0 — update WA ringkas + rekomendasi latihan di rumah." },
];

export default function LittleSpeakersPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">PROGRAM KIDS • &lt;13 TAHUN</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">
          Little Speakers — Berani Bicara Sejak Kecil
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-ink/70 sm:text-base">
          Belajar lewat bermain, lagu, dan cerita — dengan laporan ramah orang tua.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge tone="sand">ENTRY ASSESSMENT 10–15 MNT</Badge>
          <Badge tone="navy">BATCH KECIL</Badge>
          <Badge tone="blue">PARENT UPDATE TIAP SESI</Badge>
        </div>

        <PosterCard
          src="/poster/kids-bermain.jpeg"
          alt="Dekat dengan keseharian — ada ruang untuk mencoba, ada arahan untuk berkembang di KOLASE"
          caption="Ruang mencoba + arahan berkembang — pengalaman belajar yang kami bangun."
          className="mx-auto mt-6 w-full max-w-sm"
        />

        <div className="mt-8">
          <SectionHeading eyebrow="ALUR PROGRAM" title="Bagaimana Little Speakers berjalan?" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ALUR.map((s) => (
              <Card key={s.n} className="rounded-xl">
                <p className="font-display text-2xl font-extrabold text-sand-deep">{s.n}</p>
                <h3 className="font-display mt-1 text-base font-extrabold text-ink">{s.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/70">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-6 rounded-xl border-navy bg-navy text-ivory">
          <h2 className="font-display text-lg font-extrabold">Mulai dari Entry Assessment</h2>
          <p className="mt-1 text-sm text-ivory/85">
            Pilih Age Group &lt;13 saat daftar. Isi data → assessment singkat → tim mencocokkan batch.
            Dokumen acuan: 01_KIDS_LITTLE_SPEAKERS (kurikulum, teaching decks, student materials).
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/daftar" className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink hover:bg-sand-deep">
              Daftar Little Speakers
            </Link>
            <Link href="/orang-tua" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-ivory/30 px-5 py-3 text-sm font-semibold text-ivory hover:bg-white/10">
              Info untuk Orang Tua
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
