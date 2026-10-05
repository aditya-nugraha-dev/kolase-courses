import Image from "next/image";
import Link from "next/link";
import Hero from "./components/landing/Hero";
import ValueProps from "./components/landing/ValueProps";
import ProgramDetails from "./components/landing/ProgramDetails";
import Curriculum from "./components/landing/Curriculum";
import PosterCard from "./components/PosterCard";
import PosterGallery, { type GalleryItem } from "./components/PosterGallery";
import { SectionHeading } from "./components/ui";

// Galeri poster home: 6 poster belajar + 6 poster Visi & Misi.
// Tiap poster punya caption + link topik agar tak membingungkan.
const GALERI_BELAJAR: GalleryItem[] = [
  { src: "/poster/metode-scaffolding.jpeg", alt: "Nggak harus langsung bisa sendiri — dengar contoh, coba bersama, pelan-pelan bantuan dikurangi", caption: "Cara kami mengajar: scaffolding", href: "/#keunggulan", linkLabel: "Lihat kenapa KOLASE", badge: "MENGAJAR" },
  { src: "/poster/bahasa-dipakai.jpeg", alt: "Bukan cuma mendengarkan penjelasan — bahasa perlu dipakai, bukan cuma dipelajari", caption: "Bahasa dipakai, bukan cuma dipelajari", href: "/#program", linkLabel: "Lihat program 90 menit", badge: "PROGRAM" },
  { src: "/poster/kids-bermain.jpeg", alt: "Dekat dengan keseharian — ada ruang untuk mencoba, ada arahan untuk berkembang", caption: "Little Speakers: belajar lewat bermain", href: "/program/little-speakers", linkLabel: "Lihat Little Speakers", badge: "KIDS" },
  { src: "/poster/berani-mencoba.jpeg", alt: "Bukan cuma hari ini belajar apa, tapi hari ini berani mencoba apa", caption: "Berani mencoba setiap sesi", href: "/orang-tua", linkLabel: "Info untuk orang tua", badge: "MINDSET" },
  { src: "/poster/cerita-awal.jpeg", alt: "Cerita sederhana bisa jadi awal — belajar bermakna saat bahasa terhubung dengan hidup kita", caption: "Mulai dari ceritamu sendiri", href: "/daftar", linkLabel: "Mulai placement check", badge: "MULAI" },
  { src: "/poster/ruang-menjawab.jpeg", alt: "Bukan sekadar benar atau salah — ada kesempatan menjawab, bertanya, dan menyampaikan ide", caption: "Ruang menjawab & bertanya", href: "/guru", linkLabel: "Lihat halaman guru", badge: "KELAS" },
];

const GALERI_VISI_MISI: GalleryItem[] = [
  { src: "/poster/visi-misi-cover.jpeg", alt: "KOLASE in Vision and Mission — tujuan dan harapan kami dalam membangun peradaban berbasis ilmu pengetahuan", caption: "01/06 • Cover Visi & Misi", href: "/tentang", linkLabel: "Baca Visi & Misi lengkap", badge: "01/06" },
  { src: "/poster/visi-generasi-unggul.jpeg", alt: "Melahirkan generasi unggul dan berkarakter — unggul akademis, berpondasi moral", caption: "02/06 • Visi: generasi unggul", href: "/tentang#visi", linkLabel: "Baca visi KOLASE", badge: "02/06" },
  { src: "/poster/misi-akses-karakter.jpeg", alt: "Akses pendidikan dan pembentukan karakter — inklusif, ramah, adil", caption: "03/06 • Akses & karakter", href: "/tentang#misi-akses-karakter", linkLabel: "Baca misi kami", badge: "03/06" },
  { src: "/poster/misi-inovasi-seimbang.jpeg", alt: "Inovasi pembelajaran dan keseimbangan diri — metode modern, otak dan hati seimbang", caption: "04/06 • Inovasi & keseimbangan", href: "/tentang#misi-inovasi-seimbang", linkLabel: "Baca misi kami", badge: "04/06" },
  { src: "/poster/misi-global-masa-depan.jpeg", alt: "Perspektif global dan kesiapan masa depan — kritis, terbuka, moderat", caption: "05/06 • Global & masa depan", href: "/tentang#misi-global-masa-depan", linkLabel: "Baca misi kami", badge: "05/06" },
  { src: "/poster/misi-cta-bertumbuh.jpeg", alt: "Mari bertumbuh bersama — follow @kolaseacademy", caption: "06/06 • Mari bertumbuh bersama", href: "/daftar", linkLabel: "Ikut pilot class", badge: "06/06" },
];

// Landing KOLASE: mobile-first, Tailwind sm:/lg:, Academic Navy + Sand, Warm Ivory.
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory font-sans text-ink">
      <main className="flex-1">
        <Hero />
        <ValueProps />
        <ProgramDetails />
        <Curriculum />

        <section className="bg-ivory">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
            <SectionHeading
              eyebrow="GALERI"
              title="Poster KOLASE"
              desc="Ketuk poster untuk perbesar dan baca — lalu lanjut ke halaman topiknya."
            />
            <PosterGallery items={GALERI_BELAJAR} />
          </div>
        </section>

        <section className="bg-navy text-ivory">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
            <p className="text-center text-xs font-extrabold tracking-[0.2em] text-sand">VISI & MISI • 01–06</p>
            <h2 className="font-display mx-auto mt-2 max-w-2xl text-center text-2xl font-extrabold sm:text-3xl">
              KOLASE in Vision & Mission
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-ivory/75 sm:text-base">
              Tujuan dan harapan kami dalam membangun peradaban berbasis ilmu pengetahuan.
              6 poster, dari visi generasi unggul sampai ajakan bertumbuh bersama.
            </p>
            <div className="[&_figure]:border-white/15">
              <PosterGallery items={GALERI_VISI_MISI} />
            </div>
            <div className="mt-6 text-center">
              <Link href="/tentang" className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-sand px-6 py-3.5 text-base font-bold text-ink hover:bg-sand-deep">
                Baca Visi & Misi Lengkap
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
            <SectionHeading
              eyebrow="PROGRAM"
              title="Dua jalur: Kids & Teens/Adults"
              desc="Little Speakers untuk <13 dengan Entry Assessment ramah anak. A2 Discovery untuk 13+ dengan placement terstruktur."
            />
            <div className="mx-auto mt-6 grid max-w-4xl items-center gap-5 sm:grid-cols-[240px_1fr]">
              <PosterCard
                src="/poster/kids-bermain.jpeg"
                alt="Dekat dengan keseharian — ada ruang untuk mencoba, ada arahan untuk berkembang"
                caption="Ruang mencoba + arahan berkembang"
                badge="KIDS"
                className="mx-auto w-full max-w-[240px]"
              />
              <div className="grid gap-3">
                <Link href="/program/little-speakers" className="rounded-xl border border-sand/40 bg-ivory p-5 hover:border-ink">
                  <p className="text-xs font-extrabold text-navy">KIDS • &lt;13</p>
                  <p className="font-display mt-1 text-lg font-extrabold text-ink">Little Speakers</p>
                  <p className="mt-1 text-sm text-ink/70">Batch kecil, attendance, session report, parent update tiap sesi.</p>
                </Link>
                <Link href="/daftar" className="rounded-xl border border-sand/40 bg-ivory p-5 hover:border-ink">
                  <p className="text-xs font-extrabold text-navy">13+ • A2 PILOT</p>
                  <p className="font-display mt-1 text-lg font-extrabold text-ink">Speaking Discovery Session</p>
                  <p className="mt-1 text-sm text-ink/70">Placement 0–50, kelas 3–5, gain pre→post 0–10.</p>
                </Link>
              </div>
            </div>
            <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-2 text-xs">
              <Link href="/tentang" className="font-bold text-navy">Tentang</Link>•
              <Link href="/bayar" className="font-bold text-navy">Konfirmasi Bayar</Link>•
              <Link href="/guru" className="font-bold text-navy">Guru</Link>•
              <Link href="/orang-tua" className="font-bold text-navy">Orang Tua</Link>•
              <Link href="/konten" className="font-bold text-navy">Konten</Link>•
              <Link href="/sertifikat" className="font-bold text-navy">Sertifikat</Link>•
              <Link href="/bantuan" className="font-bold text-navy">Bantuan</Link>
            </div>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
            <SectionHeading
              eyebrow="FAQ"
              title="Pertanyaan yang sering ditanyakan"
            />
            <div className="mx-auto mt-6 grid max-w-3xl gap-3">
              {[
                { q: "Apakah satu sesi bisa menaikkan level CEFR?", a: "Tidak. Pilot 90 menit hanya mengukur Gain pada satu learning objective (pre → post 0–10). Tidak untuk klaim kenaikan CEFR." },
                { q: "Bagaimana placement dinilai?", a: "Placement 0–50 (Language Use, Vocabulary, Reading, Listening + Writing) terpisah dari Pre-Check 0–10. Tiap pengerjaan dapat ATM-###### baru dengan STU yang sama." },
                { q: "Bolehkah usia <13 ikut placement dewasa?", a: "Placement 50 poin khusus 13+. Untuk Kids gunakan Entry Assessment ramah anak 10–15 menit. Pilih Age Group yang benar saat daftar." },
                { q: "Apa yang saya butuhkan untuk kelas?", a: "Perangkat Google Meet-ready, komitmen penuh 90 menit, ruangan tenang + earphone. Link Meet dibagikan setelah class matching." },
              ].map((f) => (
                <details key={f.q} className="rounded-xl border border-sand/40 bg-ivory px-4 py-3">
                  <summary className="cursor-pointer text-sm font-bold text-ink">{f.q}</summary>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-navy text-ivory">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 py-12 sm:py-16 lg:grid-cols-[280px_1fr]">
            <PosterCard
              src="/poster/berani-mencoba.jpeg"
              alt="Bukan cuma hari ini belajar apa, tapi hari ini berani mencoba apa"
              caption="Berani mencoba — bukan cuma benar atau salah"
              badge="MINDSET"
              className="mx-auto w-full max-w-[280px] border-white/15"
            />
            <div className="text-center lg:text-left">
              <p className="text-xs font-extrabold tracking-[0.2em] text-sand">SIAP MULAI?</p>
              <h2 className="font-display mx-auto mt-2 max-w-2xl text-2xl font-extrabold sm:text-3xl lg:mx-0">
                Amankan kursi pilot 3–5 siswa — mulai dari Placement Check hari ini
              </h2>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link href="/daftar" className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-sand px-6 py-3.5 text-base font-bold text-ink hover:bg-sand-deep">
                  Daftar Pilot Class / Placement Check
                </Link>
                <Link href="/dashboard" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-ivory/30 px-6 py-3.5 text-base font-semibold text-ivory hover:bg-white/10">
                  Lihat Dashboard Tracker
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-sand/40 bg-paper px-4 py-8 text-center text-xs text-ink/60">
        <Image src="/kolase-primary-black-drive.png" alt="KOLASE" width={200} height={48} className="mx-auto mb-3 h-12 w-auto object-contain" />
        <p className="font-bold text-ink">KOLASE English • Belajar dengan Arah, Berkembang dengan Percaya Diri</p>
        <p className="mt-2">
          <Link href="/tentang" className="font-bold text-navy">Tentang & Visi Misi</Link> •{" "}
          <Link href="/program/little-speakers" className="font-bold text-navy">Little Speakers</Link> •{" "}
          <Link href="/bayar" className="font-bold text-navy">Bayar</Link> •{" "}
          <Link href="/guru" className="font-bold text-navy">Guru</Link> •{" "}
          <Link href="/sertifikat" className="font-bold text-navy">Sertifikat</Link> •{" "}
          <Link href="/bantuan" className="font-bold text-navy">Bantuan</Link>
        </p>
        <p className="mt-2">
          Instagram: <a href="https://instagram.com/kolaseacademy" target="_blank" rel="noreferrer" className="font-bold text-navy">@kolaseacademy</a> •{" "}
          <Link href="/konten" className="font-bold text-navy">Arsip Konten</Link>
        </p>
        <p className="mt-2 text-ink/40">© 2026 KOLASE Academy • Pilot Session 0</p>
      </footer>
    </div>
  );
}
