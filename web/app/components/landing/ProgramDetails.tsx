import { Clock3, Gauge, Route } from "lucide-react";
import PosterCard from "../PosterCard";
import { Badge, Card, SectionHeading } from "../ui";

const STEPS = [
  { n: "1", t: "Registration", d: "Isi GForm 1: identitas, kontak, usia, tujuan & preferensi jadwal. Dapat STU-XXXXXX seumur hidup." },
  { n: "2", t: "Placement Check", d: "Kerjakan GForm 2: placement 0–50 + pre-check recount 0–10. Auto-scoring + review manual." },
  { n: "3", t: "Class Match (3–5)", d: "Tim akademik mencocokkan 3–5 siswa se-level & se-jadwal. Link Meet dibagikan per Class ID." },
  { n: "4", t: "Live Session & Feedback", d: "Ikut 90 menit live + isi post-check. Terima Gain Score & Post-Class Review." },
];

export default function ProgramDetails() {
  return (
    <section id="program" className="scroll-mt-20 bg-paper">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeading
          eyebrow="PROGRAM & CLASS DETAILS"
          title="A2 Speaking Discovery Session — 90 menit yang padat"
          desc="Level target A2 / Elementary Speaking Proficiency. Fokus: past-simple narratives & vocabulary confidence."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-xl border-navy bg-navy text-ivory">
            <div className="flex flex-wrap gap-2">
              <Badge tone="sand">90 MENIT / SESI</Badge>
              <Badge tone="blue">LEVEL A2</Badge>
            </div>
            <h3 className="font-display mt-3 text-xl font-extrabold">My Weekend (Past Simple)</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory/85">
              Recount 4–6 kalimat + speaking 60–90 detik. Bahasa dipakai, bukan cuma dipelajari.
            </p>
            <PosterCard
              src="/poster/bahasa-dipakai.jpeg"
              alt="Bukan cuma mendengarkan penjelasan — bahasa perlu dipakai, bukan cuma dipelajari"
              caption="Bahasa dipakai, bukan cuma dipelajari"
              badge="PROGRAM"
              className="mx-auto mt-4 w-full max-w-[260px] border-white/15"
            />
            <ul className="mt-4 space-y-2 text-sm text-ivory/90">
              <li className="flex gap-2"><Clock3 size={16} className="mt-0.5 text-sand" /> 0–8 Welcome • 8–18 Warm-up • 18–30 Model • 30–42 Practice</li>
              <li className="flex gap-2"><Gauge size={16} className="mt-0.5 text-sand" /> 42–55 Planning • 55–70 Speaking round • 70–82 Feedback & retry • 82–90 Post-check</li>
              <li className="flex gap-2"><Route size={16} className="mt-0.5 text-sand" /> Success: ≥4 actions, ≥4 past verbs, ≥2 time markers, urutan jelas</li>
            </ul>
          </Card>
          <div className="grid gap-3 sm:grid-cols-2">
            {STEPS.map((s) => (
              <Card key={s.n} className="rounded-xl">
                <p className="font-display text-2xl font-extrabold text-sand-deep">{s.n}</p>
                <h4 className="font-display mt-1 text-base font-extrabold text-ink">{s.t}</h4>
                <p className="mt-1 text-sm leading-relaxed text-ink/70">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
