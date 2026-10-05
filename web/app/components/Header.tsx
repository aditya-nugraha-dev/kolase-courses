import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

// Header bersama: Academic Navy + aksen Sand, muncul di semua halaman.
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-deep bg-navy/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/kolase-icon-white.png" alt="Ikon KOLASE" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
          <span className="font-display text-lg font-extrabold tracking-[0.14em] text-ivory">KOLASE</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Beranda</Link>
          <Link href="/tentang" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Tentang</Link>
          <Link href="/#keunggulan" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Kenapa KOLASE</Link>
          <Link href="/#program" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Program</Link>
          <Link href="/program/little-speakers" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Little Speakers</Link>
          <Link href="/konten" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Konten</Link>
          <Link href="/foto" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Foto ID</Link>
          <Link href="/bantuan" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Bantuan</Link>
          <Link href="/student" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Portal Murid</Link>
        </nav>
        <Link href="/daftar" className="hidden rounded-xl bg-sand px-4 py-2 text-sm font-bold text-ink hover:bg-sand-deep sm:inline-flex">Daftar Pilot Class</Link>
        <Link href="/masuk" className="hidden rounded-xl border border-ivory/30 px-4 py-2 text-sm font-semibold text-ivory hover:bg-white/10 lg:inline-flex">Masuk</Link>
        <MobileMenu />
      </div>
    </header>
  );
}
