// Bingkai standar untuk poster /poster/*.jpeg (1080×1350, 4:5).
// Poster sudah memuat pesannya sendiri — caption cukup 1 baris.
// Sengaja pakai <img> biasa (bukan next/image) agar file statis
// /poster/*.jpeg selalu tampil di semua mode (dev maupun start).
"use client";

import { useState } from "react";

export default function PosterCard({
  src,
  alt,
  caption,
  badge,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  badge?: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={`overflow-hidden rounded-2xl border border-sand/40 bg-paper shadow-sm ${className}`}>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand-soft/40">
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            width={1080}
            height={1350}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-navy p-6 text-center">
            <p className="font-display text-lg font-extrabold tracking-[0.14em] text-ivory">KOLASE</p>
            <p className="text-xs leading-relaxed text-ivory/70">{alt}</p>
          </div>
        )}
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold text-ivory backdrop-blur">
            {badge}
          </span>
        )}
      </div>
      {caption && (
        <figcaption className="px-4 py-2.5 text-center text-xs leading-relaxed text-ink/60">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
