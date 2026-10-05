"use client";

import { useEffect, useState } from "react";
import { BookOpen, Link2, Video } from "lucide-react";
import { Badge, Card } from "../../components/ui";

// My Class & Materials: link Meet, modul, bahan studi.
export default function KelasClient() {
  const [data, setData] = useState<{ student: Record<string, unknown>; class: Record<string, unknown> | null } | null>(null);

  useEffect(() => {
    fetch("/api/student/me").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const cls = (data?.class ?? {}) as Record<string, unknown>;
  const name = String(cls.name ?? cls.nama ?? "A2 Pilot — My Weekend (Past Simple)");
  const schedule = String(cls.schedule ?? cls.jadwal ?? "Sabtu 10:00 WIB • 90 menit • Google Meet");
  const teacher = String(cls.teacher ?? cls.teacher_name ?? cls.guru ?? "Mr. Galang");
  const meet = String(cls.meet ?? cls.meet_link ?? "");
  const slides = String(cls.slides ?? cls.slides_link ?? "");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">MY CLASS & MATERIALS</p>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">{name}</h1>
        <p className="mt-1 text-sm text-ink/70">{schedule} • {teacher}</p>
      </div>

      <Card className="rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-extrabold text-ink">Link Google Meet</h2>
          <Badge tone={meet ? "green" : "amber"}>{meet ? "TERSEDIA" : "MENUNGGU MATCHING"}</Badge>
        </div>
        {meet ? (
          <a href={meet} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory hover:bg-navy">
            <Video size={16} /> Join Google Meet
          </a>
        ) : (
          <p className="mt-2 text-sm text-ink/70">
            Link dibagikan setelah class matching manual (3–5 siswa se-level & se-jadwal).
            Pastikan notifikasi WhatsApp aktif.
          </p>
        )}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/60"><Link2 size={13} /> Jangan bagikan link ke luar kelas.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl">
          <h2 className="font-display flex items-center gap-2 text-base font-extrabold text-ink"><BookOpen size={17} /> Modul pembelajaran</h2>
          <ul className="mt-2 space-y-2 text-sm text-ink/80">
            <li>• Model recount + verb bank (went, had, saw, ate, did, stayed…)</li>
            <li>• Time markers (then, after that, finally, last weekend…)</li>
            <li>• Sentence frames 4–6 kalimat + speaking prompts 60–90 detik</li>
          </ul>
          {slides ? (
            <a href={slides} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-xl border border-sand bg-paper px-4 py-2.5 text-sm font-bold text-ink hover:border-ink">Buka Slide Deck</a>
          ) : (
            <p className="mt-3 text-xs text-ink/60">Slide deck dibagikan H-1 via WhatsApp.</p>
          )}
        </Card>
        <Card className="rounded-xl">
          <h2 className="font-display text-base font-extrabold text-ink">Bahan studi & rekaman</h2>
          <ul className="mt-2 space-y-2 text-sm text-ink/80">
            <li>• Audio warm-up: daily routines & weekend stories</li>
            <li>• Worksheet: controlled practice past simple</li>
            <li>• Rekaman: tidak wajib untuk pilot (butuh consent terpisah)</li>
          </ul>
          <p className="mt-3 rounded-xl bg-ivory p-3 text-xs text-ink/60">
            Class norms: join 5 menit awal, mute saat tidak bicara, hargai giliran, English dianjurkan — salah itu wajar.
          </p>
        </Card>
      </div>
    </div>
  );
}
