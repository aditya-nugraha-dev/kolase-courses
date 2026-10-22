"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";

// Tombol hamburger khusus HP (lg:hidden). Link mengikuti peran dari Header.
export default function MobileMenu({
  links,
  showRegisterCta,
  loggedIn,
  onLogout,
}: {
  links: Array<{ href: string; label: string }>;
  showRegisterCta: boolean;
  loggedIn: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  const linkCls =
    "block rounded-lg px-3 py-3 text-base text-ink/70 hover:bg-sand-soft hover:text-ink";

  return (
    <div className="ml-auto lg:hidden">
      <button
        type="button"
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2 rounded-lg bg-sand px-4 text-sm font-bold text-ink transition hover:bg-sand-deep"
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
          className="absolute inset-x-4 top-[4.25rem] rounded-xl border border-violet/20 bg-paper p-2 shadow-xl"
        >
          {links.map((l) => (
            <Link key={l.href + l.label} href={l.href} className={linkCls} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {showRegisterCta && (
            <Link
              href="/katalog"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-sand px-3 py-3 text-center text-base font-bold text-ink"
            >
              Lihat Katalog <ArrowRight size={17} />
            </Link>
          )}
          {loggedIn && (
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet/20 px-3 py-3 text-center text-base font-semibold text-navy hover:bg-sand-soft"
            >
              <LogOut size={17} /> Keluar
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
