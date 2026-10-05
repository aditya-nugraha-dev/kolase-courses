import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { A2_CURRICULUM, MOCK_CLASSES } from "@/lib/mock";
import { Badge, Card, DataTable, SectionHeading } from "../ui";

export default function Curriculum() {
  return (
    <section id="kurikulum" className="scroll-mt-20 bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeading
          eyebrow="KURIKULUM & JADWAL"
          title="Kurikulum A2 — dari perkenalan sampai Mini Alur KOLASE"
          desc="Diambil dari English Curriculum KOLASE 1.0 (A2/P15). Pilot Session 0 = Sesi 5: My Weekend."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <DataTable
            columns={["Sesi", "Tema", "Output"]}
            rows={A2_CURRICULUM.map((r) => [
              <b key="s">{r.sesi}</b>,
              r.tema,
              <span key="o" className="text-ink/70">{r.output}</span>,
            ])}
          />
          <div className="space-y-3">
            {MOCK_CLASSES.map((c) => (
              <Card key={c.classId} className="rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-ink/50">{c.classId}</p>
                  <Badge tone={c.status === "OPEN" ? "green" : "slate"}>{c.status.replace("_", " ")}</Badge>
                </div>
                <h4 className="font-display mt-1 text-base font-extrabold text-ink">{c.name}</h4>
                <p className="mt-1 text-sm text-ink/70">{c.schedule}</p>
                <p className="text-sm text-ink/70">{c.teacher} • {c.slots}</p>
              </Card>
            ))}
            <Link href="/daftar" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-base font-bold text-ivory hover:bg-navy">
              Daftar Pilot Class / Placement Check <ArrowRight size={18} />
            </Link>
            <p className="text-center text-xs text-ink/60">Butuh bantuan? Cek <Link href="/dashboard" className="font-bold text-navy">dashboard tracker preview</Link> atau <Link href="/core" className="font-bold text-navy">konsol Core</Link>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
