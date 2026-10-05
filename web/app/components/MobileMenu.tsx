"use client";

import { useState } from "react";
import Link from "next/link";

// Tombol hamburger khusus HP (lg:hidden). Nav desktop tetap lg:flex.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  const linkCls =
    "block rounded-lg px-3 py-3 text-base text-ivory/85 hover:bg-white/10 hover:text-ivory";

  return (
    <div className="ml-auto lg:hidden">
      <button
        type="button"
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2 rounded-lg bg-sand px-4 text-sm font-bold text-ink hover:bg-sand-deep"
      >
        <span>{open ? "TUTUP" : "MENU"}</span>
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          className="absolute inset-x-4 top-16 rounded-xl border border-navy-deep bg-navy p-2 shadow-xl"
        >
          <Link href="/" className={linkCls} onClick={() => setOpen(false)}>
            Beranda
          </Link>
          <Link href="/tentang" className={linkCls} onClick={() => setOpen(false)}>
            Tentang & Visi Misi
          </Link>
          <Link href="/#keunggulan" className={linkCls} onClick={() => setOpen(false)}>
            Kenapa KOLASE
          </Link>
          <Link href="/#program" className={linkCls} onClick={() => setOpen(false)}>
            Program
          </Link>
          <Link href="/#kurikulum" className={linkCls} onClick={() => setOpen(false)}>
            Kurikulum & Jadwal
          </Link>
          <Link href="/program/little-speakers" className={linkCls} onClick={() => setOpen(false)}>
            Little Speakers
          </Link>
          <Link href="/bayar" className={linkCls} onClick={() => setOpen(false)}>
            Konfirmasi Bayar
          </Link>
          <Link href="/guru" className={linkCls} onClick={() => setOpen(false)}>
            Guru
          </Link>
          <Link href="/orang-tua" className={linkCls} onClick={() => setOpen(false)}>
            Orang Tua
          </Link>
          <Link href="/konten" className={linkCls} onClick={() => setOpen(false)}>
            Konten
          </Link>
          <Link href="/foto" className={linkCls} onClick={() => setOpen(false)}>
            Foto per ID
          </Link>
          <Link href="/sertifikat" className={linkCls} onClick={() => setOpen(false)}>
            Sertifikat
          </Link>
          <Link href="/bantuan" className={linkCls} onClick={() => setOpen(false)}>
            Bantuan
          </Link>
          <Link href="/daftar" className={linkCls} onClick={() => setOpen(false)}>
            Daftar / Placement Check
          </Link>
          <Link href="/student" className={linkCls} onClick={() => setOpen(false)}>
            Portal Murid
          </Link>
          <Link href="/admin" className={linkCls} onClick={() => setOpen(false)}>
            Guru/Admin
          </Link>
          <Link href="/masuk" className={linkCls} onClick={() => setOpen(false)}>
            Masuk
          </Link>
          <Link href="/dashboard" className={linkCls} onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link href="/core" className={linkCls} onClick={() => setOpen(false)}>
            Core
          </Link>
          <Link
            href="/daftar"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg bg-sand px-3 py-3 text-center text-base font-bold text-ink"
          >
            Daftar Pilot Class
          </Link>
        </nav>
      )}
    </div>
  );
}
