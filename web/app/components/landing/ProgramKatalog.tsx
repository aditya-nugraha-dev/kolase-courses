import Link from "next/link";
import { ArrowRight, Clock3, Users } from "lucide-react";
import { PROGRAMS, SEGMENT_LABEL, priceLabel } from "@/lib/catalog";
import { Badge, Card, SectionHeading } from "../ui";

export default function ProgramKatalog() {
  return (
    <section id="katalog" className="scroll-mt-20 bg-paper">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeading
          eyebrow="KATALOG RESMI 2026"
          title="Dua segmen, empat program, satu standar 60 menit"
          desc="Kids 6–12 dan Teens & Adults 13+. Harga dan alur mengikuti KOL-SOP-INT-001 V1.4 §2.1."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PROGRAMS.map((p) => (
            <Card key={p.id} className="flex flex-col rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone={p.segment === "kids" ? "sand" : "navy"}>
                  {SEGMENT_LABEL[p.segment]}
                </Badge>
                <span className="text-xs font-bold text-ink/50">
                  {p.sessionsLabel} • {p.durationMinutes} mnt
                </span>
              </div>
              <h3 className="font-display mt-2 text-lg font-extrabold text-ink">
                {p.name}
              </h3>
              <p className="text-xs font-bold text-navy">{p.ageLabel}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                {p.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/60">
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={13} /> {p.format}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={13} /> {p.assessment}
                </span>
              </div>
              <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                <p className="font-display text-base font-extrabold text-ink">
                  {priceLabel(p)}
                </p>
                <Link
                  href="/katalog"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-ivory hover:bg-navy"
                >
                  Detail <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/katalog"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-sand bg-ivory px-5 py-3 text-sm font-bold text-ink hover:border-ink"
          >
            Buka katalog lengkap <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
