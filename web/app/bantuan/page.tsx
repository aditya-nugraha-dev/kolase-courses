import Link from "next/link";
import type { Metadata } from "next";
import { Card, SectionHeading } from "../components/ui";

export const metadata: Metadata = {
  title: "Bantuan & SOP — KOLASE",
  description: "Pusat bantuan: SOP kelas, pendaftaran, penamaan ID, dan kontak operasional.",
};

const DOCS = [
  { t: "SOP Pelaksanaan Kelas & Student Journey V2.6", d: "Alur live 90 menit, attendance, feedback, retry & post-check. Acuan guru dan admin." },
  { t: "SOP Pendaftaran & Asesmen V1.5", d: "Kids (<13) Entry Assessment 10–15 mnt. Dewasa placement 50 poin + pre-check 0–10." },
  { t: "Standar Penamaan Kode & ID V1.3", d: "STU-XXXXXX seumur hidup, CLS per kelas, ATM-###### per attempt. Jangan isi ID manual." },
  { t: "Company Operating Manual V1.6", d: "Struktur operasional, peran teacher/staff, dan kontrol kualitas." },
];

const FAQ = [
  { q: "Apakah satu sesi bisa menaikkan level CEFR?", a: "Tidak. Pilot hanya mengukur Gain satu objective (pre → post 0–10)." },
  { q: "Di mana file resmi & template?", a: "Di Drive 05_BRAND_ASSETS_AND_TEMPLATES dan folder Master Templates. Gandakan sebelum edit, jangan ubah file master." },
  { q: "Bagaimana lapor kendala pembayaran?", a: "Via halaman /bayar dengan Enrollment/Student ID. Verifikasi maks. 1×24 jam kerja." },
  { q: "Bagaimana reschedule kelas?", a: "Guru mengajukan via /guru tab Reschedule. Murid menunggu info WA + Portal Murid." },
];

export default function BantuanPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">04_PANDUAN_DAN_KEBIJAKAN</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">Pusat Bantuan</h1>
        <div className="mt-6 space-y-3">
          {DOCS.map((d) => (
            <Card key={d.t} className="rounded-xl">
              <h2 className="font-display text-base font-extrabold text-ink">{d.t}</h2>
              <p className="mt-1 text-sm text-ink/70">{d.d}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <SectionHeading eyebrow="FAQ" title="Pertanyaan umum" />
          <div className="mt-4 grid gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-xl border border-sand/40 bg-paper px-4 py-3">
                <summary className="cursor-pointer text-sm font-bold text-ink">{f.q}</summary>
                <p className="mt-1.5 text-sm text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <Card className="mt-6 rounded-xl border-navy bg-navy text-ivory">
          <p className="text-sm font-bold">Butuh bantuan operasional?</p>
          <p className="mt-1 text-sm text-ivory/85">Cek <Link href="/core" className="font-bold text-sand">/core</Link>, <Link href="/dashboard" className="font-bold text-sand">/dashboard</Link>, atau <Link href="/tentang" className="font-bold text-sand">tentang KOLASE</Link>.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a href="https://instagram.com/kolaseacademy" target="_blank" rel="noreferrer" className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink hover:bg-sand-deep">
              Instagram @kolaseacademy
            </a>
            <Link href="/daftar" className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-ivory/30 px-5 py-3 text-sm font-semibold text-ivory hover:bg-white/10">
              Daftar / Placement Check
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
