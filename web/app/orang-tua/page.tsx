import Link from "next/link";
import type { Metadata } from "next";
import PosterCard from "../components/PosterCard";
import { Card, SectionHeading } from "../components/ui";

export const metadata: Metadata = {
  title: "Info Orang Tua — KOLASE",
  description: "Parent Communication Journey: registrasi → placement → matching → sesi → post-class review.",
};

const STAGES = [
  { t: "Setelah Registrasi", m: "Halo, Bapak/Ibu. Registrasi Little Speakers telah kami terima. Berikut Enrollment ID yang digunakan untuk proses pembayaran." },
  { t: "Setelah Placement / Assessment", m: "Hasil assessment ananda sudah keluar. Ananda cocok di batch kecil 3–5 sesuai level dan jadwal yang dipilih." },
  { t: "Setelah Class Matching", m: "Kelas ananda sudah terbentuk. Link Google Meet dan jadwal sesi dibagikan di Portal Murid." },
  { t: "Setelah Sesi", m: "Ananda telah menunjukkan perkembangan yang baik dan masih membutuhkan kesempatan berlatih untuk meningkatkan kepercayaan diri saat berbicara." },
  { t: "Post-Class Review", m: "Dokumen ini merangkum informasi program, status administrasi, serta tindakan lanjutan yang perlu diperhatikan." },
];

export default function OrangTuaPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">PARENT JOURNEY V1.0</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">Didampingi, Transparan, Terstruktur</h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/70">
          Tanpa janji instan — setiap tahap ada kabar dan langkah berikutnya yang jelas.
        </p>
        <PosterCard
          src="/poster/berani-mencoba.jpeg"
          alt="Bukan cuma hari ini belajar apa, tapi hari ini berani mencoba apa"
          caption="Pertanyaan yang kami latih di setiap sesi — bukan sekadar nilai."
          className="mx-auto mt-6 w-full max-w-xs"
        />
        <div className="mt-6 space-y-3">
          {STAGES.map((s, i) => (
            <Card key={s.t} className="rounded-xl">
              <p className="text-xs font-extrabold text-navy">TAHAP {i + 1} • {s.t.toUpperCase()}</p>
              <p className="mt-2 rounded-xl bg-ivory p-3 text-sm leading-relaxed text-ink/80">“{s.m}”</p>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <SectionHeading eyebrow="AKSI" title="Pantau perkembangan ananda" />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/student/progress" className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory hover:bg-navy">Lihat Feedback & Progres</Link>
            <Link href="/bayar" className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink hover:bg-sand-deep">Konfirmasi Pembayaran</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
