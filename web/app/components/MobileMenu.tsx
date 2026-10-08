"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, LogOut } from "lucide-react";

// Tombol hamburger khusus HP (lg:hidden). Link mengikuti peran dari Header.
export default function MobileMenu({
  links,
  showTrialCta,
  loggedIn,
  onLogout,
}: {
  links: Array<{ href: string; label: string }>;
  showTrialCta: boolean;
  loggedIn: boolean;
  onLogout: () => void;
}) {
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
          {links.map((l) => (
            <Link key={l.href + l.label} href={l.href} className={linkCls} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {showTrialCta && (
            <Link
              href="/daftar"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-sand px-3 py-3 text-center text-base font-bold text-ink"
            >
              <Gift size={17} /> Trial 7 Sesi Gratis
            </Link>
          )}
          {loggedIn && (
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-ivory/30 px-3 py-3 text-center text-base font-semibold text-ivory"
            >
              <LogOut size={17} /> Keluar
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
