import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROGRAMS, priceLabel } from "@/lib/catalog";
import { Badge, Card, DataTable, SectionHeading } from "../ui";

const KIDS_STAGES = [
  { stage: "1 • Explorer", focus: "Kosakata tema & instruksi sederhana", output: "Merespons sapaan dan instruksi kelas" },
  { stage: "2 • Builder", focus: "Kalimat pendek & rutinitas harian", output: "Cerita 4–6 kalimat tentang diri" },
  { stage: "3 • Speaker", focus: "Bercerita & menjawab pertanyaan", output: "Show & tell 60 detik" },
  { stage: "4 • Communicator", focus: "Opini sederhana & tanya jawab", output: "Bertanya dan menanggapi teman" },
];

export default function Curriculum() {
  return (
    <section id="kurikulum" className="scroll-mt-20 bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeading
          eyebrow="JALUR & JADWAL"
          title="Little Speakers: empat tahap untuk anak 6–12"
          desc="Materi LMS mengikuti tahap Explorer, Builder, Speaker, dan Communicator. Setiap tahap punya misi bicara yang jelas."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <DataTable
            columns={["Tahap", "Fokus", "Output"]}
            rows={KIDS_STAGES.map((r) => [
              <b key="s">{r.stage}</b>,
              r.focus,
              <span key="o" className="text-ink/70">{r.output}</span>,
            ])}
          />
          <div className="space-y-3">
            {PROGRAMS.map((p) => (
              <Card key={p.id} className="rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-ink/50">{p.sessionsLabel}</p>
                  <Badge tone={p.status === "OPEN" ? "green" : "slate"}>{p.status.replace("_", " ")}</Badge>
                </div>
                <h4 className="font-display mt-1 text-base font-extrabold text-ink">{p.name}</h4>
                <p className="mt-1 text-sm text-ink/70">{p.ageLabel} • {p.durationMinutes} menit</p>
                <p className="text-sm font-bold text-navy">{priceLabel(p)}</p>
              </Card>
            ))}
            <Link href="/katalog" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-base font-bold text-ivory hover:bg-navy">
              Lihat Katalog Lengkap <ArrowRight size={18} />
            </Link>
            <p className="text-center text-xs text-ink/60">Sudah punya akun siswa? <Link href="/student/kursus" className="font-bold text-navy">Buka LMS Little Speakers</Link>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
