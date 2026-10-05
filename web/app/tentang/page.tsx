import Link from "next/link";
import type { Metadata } from "next";
import PosterCard from "../components/PosterCard";
import { Badge, Card, SectionHeading } from "../components/ui";

export const metadata: Metadata = {
  title: "Tentang KOLASE — Visi & Misi",
  description:
    "Visi KOLASE: melahirkan generasi unggul dan berkarakter. Misi: akses pendidikan, pembentukan karakter, inovasi pembelajaran, keseimbangan diri, perspektif global.",
};

const MISI = [
  {
    id: "misi-akses-karakter",
    no: "03/06",
    title: "Akses Pendidikan & Pembentukan Karakter",
    desc: "Setiap anak berhak atas pendidikan berkualitas tinggi — inklusif, ramah, adil. Akademik dipadukan dengan etika, sopan santun, dan empati.",
    src: "/poster/misi-akses-karakter.jpeg",
    alt: "Akses pendidikan dan pembentukan karakter — lingkungan inklusif, ramah, adil",
  },
  {
    id: "misi-inovasi-seimbang",
    no: "04/06",
    title: "Inovasi Pembelajaran & Keseimbangan Diri",
    desc: "Metode modern yang adaptif, mendorong berpikir kritis, eksplorasi, dan kreativitas — menyeimbangkan otak dan hati, ilmu dan iman.",
    src: "/poster/misi-inovasi-seimbang.jpeg",
    alt: "Inovasi pembelajaran dan keseimbangan diri — metode modern dan kepercayaan diri",
  },
  {
    id: "misi-global-masa-depan",
    no: "05/06",
    title: "Perspektif Global & Kesiapan Masa Depan",
    desc: "Membekali peserta didik dengan pemikiran kritis, terbuka, moderat — berwawasan internasional, berdaya saing, siap memecahkan masalah masa depan.",
    src: "/poster/misi-global-masa-depan.jpeg",
    alt: "Perspektif global dan kesiapan masa depan — kritis, terbuka, moderat",
  },
];

export default function TentangPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">TENTANG KOLASE • 01–06</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">
          KOLASE in Vision & Mission
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-ink/70 sm:text-base">
          Tujuan dan harapan kami dalam membangun peradaban berbasis ilmu pengetahuan.
          Ketuk poster untuk membaca teks lengkap — semua poster berasio 4:5 agar nyaman dibaca di HP.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge tone="sand">OUR VISION</Badge>
          <Badge tone="navy">OUR MISSION</Badge>
          <Badge tone="blue">@KOLASEACADEMY</Badge>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl items-center gap-5 sm:grid-cols-[280px_1fr]">
          <PosterCard
            src="/poster/visi-misi-cover.jpeg"
            alt="KOLASE in Vision and Mission — tujuan dan harapan kami dalam membangun peradaban berbasis ilmu pengetahuan"
            caption="01/06 • Cover"
            badge="01/06"
            eager
            className="mx-auto w-full max-w-[280px]"
          />
          <Card className="rounded-xl">
            <p className="text-xs font-extrabold tracking-[0.18em] text-navy">COVER • 01/06</p>
            <h2 className="font-display mt-1 text-xl font-extrabold text-ink">Ruang Belajar Baru</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              KOLASE membangun ruang belajar yang terstruktur, interaktif, dan terarah —
              dari placement yang jujur, kelas kecil 3–5, sampai feedback yang bisa ditindaklanjuti.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/daftar" className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink hover:bg-sand-deep">
                Ikut Pilot Class
              </Link>
              <Link href="/program/little-speakers" className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-sand/60 px-5 py-3 text-sm font-bold text-ink hover:border-ink">
                Little Speakers
              </Link>
            </div>
          </Card>
        </div>

        <div id="visi" className="mx-auto mt-8 grid max-w-4xl scroll-mt-24 items-center gap-5 sm:grid-cols-[280px_1fr]">
          <PosterCard
            src="/poster/visi-generasi-unggul.jpeg"
            alt="Melahirkan generasi unggul dan berkarakter — unggul akademis dan intelektual, berpondasi moral"
            caption="02/06 • Our Vision"
            badge="02/06"
            className="mx-auto w-full max-w-[280px] sm:order-2"
          />
          <Card className="rounded-xl sm:order-1">
            <p className="text-xs font-extrabold tracking-[0.18em] text-navy">OUR VISION • 02/06</p>
            <h2 className="font-display mt-1 text-xl font-extrabold text-ink">Melahirkan Generasi Unggul dan Berkarakter</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              KOLASE berkomitmen menjadi wadah pembentukan generasi masa depan yang unggul secara
              akademis dan intelektual, sekaligus berpondasi moral dan independensi yang kokoh.
              Berpikir terbuka di kancah global tanpa kehilangan jati diri — mengoptimalkan bakat
              dan potensi secara utuh.
            </p>
          </Card>
        </div>

        <div className="mt-10">
          <SectionHeading
            eyebrow="OUR MISSION • 03–05"
            title="Tiga misi yang kami pegang di kelas"
            desc="Ditempel di ruang guru, diulang di tiap sesi — bukan sekadar pajangan."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {MISI.map((m) => (
              <article key={m.id} id={m.id} className="scroll-mt-24">
                <PosterCard src={m.src} alt={m.alt} caption={`${m.no} • ${m.title}`} badge={m.no} className="w-full" />
                <Card className="mt-3 rounded-xl">
                  <p className="text-xs font-extrabold text-navy">{m.no}</p>
                  <h3 className="font-display mt-1 text-base font-extrabold text-ink">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/70">{m.desc}</p>
                </Card>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl items-center gap-5 sm:grid-cols-[280px_1fr]">
          <PosterCard
            src="/poster/misi-cta-bertumbuh.jpeg"
            alt="Mari bertumbuh bersama — follow @kolaseacademy dan nyalakan notifikasi"
            caption="06/06 • Ruang Belajar Baru"
            badge="06/06"
            className="mx-auto w-full max-w-[280px]"
          />
          <Card className="rounded-xl border-navy bg-navy text-ivory">
            <h2 className="font-display text-xl font-extrabold">Mari bertumbuh bersama.</h2>
            <p className="mt-2 text-sm leading-relaxed text-ivory/85">
              Tekan tombol follow <b>@kolaseacademy</b> dan nyalakan notifikasi untuk mengikuti
              langkah awal perjalanan ini. Kursi pilot terbatas 3–5 siswa per kelas.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href="https://instagram.com/kolaseacademy"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink hover:bg-sand-deep"
              >
                Follow @kolaseacademy
              </a>
              <Link href="/daftar" className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-ivory/30 px-5 py-3 text-sm font-semibold text-ivory hover:bg-white/10">
                Daftar Pilot Class
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
