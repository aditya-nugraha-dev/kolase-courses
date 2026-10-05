"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PosterCard from "./PosterCard";

export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  href: string;
  linkLabel: string;
  badge?: string;
};

// Galeri poster dengan lightbox: thumbnail kecil tak terbaca,
// ketuk poster untuk buka ukuran penuh + tombol ke halaman topik.
// Memperbaiki kekurangan galeri lama yang langsung navigasi tanpa caption.
export default function PosterGallery({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setOpen((v) => (v === null ? v : (v + 1) % items.length));
      if (e.key === "ArrowLeft") setOpen((v) => (v === null ? v : (v - 1 + items.length) % items.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, items.length, close]);

  return (
    <>
      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
        {items.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Perbesar poster: ${p.alt}`}
            className="w-44 shrink-0 snap-start rounded-2xl text-left transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:w-auto"
          >
            <PosterCard src={p.src} alt={p.alt} caption={p.caption} badge={p.badge} className="w-full" />
            <span className="mt-1 block px-1 text-[11px] font-bold text-navy">Ketuk untuk perbesar ⤢</span>
          </button>
        ))}
      </div>

      {open !== null && items[open] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Poster: ${items[open].alt}`}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4"
          onClick={close}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-navy">
                {open + 1} / {items.length} • {items[open].badge ?? "POSTER"}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Tutup pratinjau poster"
                className="rounded-lg bg-ivory px-3 py-2 text-sm font-bold text-ink hover:bg-sand-soft"
              >
                ✕ Tutup
              </button>
            </div>
            <PosterCard
              src={items[open].src}
              alt={items[open].alt}
              caption={items[open].caption}
              eager
              className="w-full"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={items.length < 2}
                onClick={() => setOpen((v) => (v === null ? v : (v - 1 + items.length) % items.length))}
                className="flex-1 rounded-xl border border-sand/60 px-4 py-3 text-sm font-bold text-ink hover:border-ink disabled:opacity-40"
              >
                ← Sebelumnya
              </button>
              <button
                type="button"
                disabled={items.length < 2}
                onClick={() => setOpen((v) => (v === null ? v : (v + 1) % items.length))}
                className="flex-1 rounded-xl border border-sand/60 px-4 py-3 text-sm font-bold text-ink hover:border-ink disabled:opacity-40"
              >
                Berikutnya →
              </button>
            </div>
            <Link
              href={items[open].href}
              className="mt-2 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink hover:bg-sand-deep"
            >
              {items[open].linkLabel} →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
