import { Clock3, Gauge, Route } from "lucide-react";
import PosterCard from "../PosterCard";
import { Badge, Card, SectionHeading } from "../ui";

const KIDS_STEPS = [
  { n: "1", t: "Kids Public Class", d: "4 sesi @60 menit, Rp50.000 promo / Rp65.000 reguler. Pendaftaran langsung tanpa tes." },
  { n: "2", t: "Observasi Informal", d: "Guru mengamati keberanian bicara, kosakata, dan cara anak merespons instruksi." },
  { n: "3", t: "Kids Entry Assessment", d: "Bila siap lanjut: asesmen lisan ramah usia 10–15 menit, bukan ujian tertulis." },
  { n: "4", t: "Kids Term Program", d: "10 sesi @60 menit, rombel 3–5 anak, Rp650.000 alumni / Rp750.000 reguler." },
];

const TEEN_STEPS = [
  { n: "1", t: "Beginner English", d: "4 sesi @60 menit, Rp75.000 per siswa. Pendaftaran langsung tanpa asesmen awal." },
  { n: "2", t: "Diagnostic Placement", d: "50 poin untuk membaca level, ditambah wawancara lisan 5 menit bila borderline." },
  { n: "3", t: "Class Match (3–5)", d: "Tim akademik mencocokkan 3–5 siswa selevel dan sejadwal. Link Meet per Class ID." },
  { n: "4", t: "Small Group", d: "Paket 6 / 10 / 15 / 30 / 45 sesi, Rp450.000–Rp3.150.000 sesuai struktur alumni & reguler." },
];

export default function ProgramDetails() {
  return (
    <section id="program" className="scroll-mt-20 bg-paper">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeading
          eyebrow="ALUR & FORMAT SESI"
          title="Satu sesi 60 menit yang benar-benar dipakai"
          desc="Setiap pertemuan punya ritme tetap: masuk, latihan terbimbing, giliran bicara, lalu umpan balik."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-xl border-navy bg-navy text-ivory">
            <div className="flex flex-wrap gap-2">
              <Badge tone="sand">60 MENIT / SESI</Badge>
              <Badge tone="blue">KELAS KECIL</Badge>
            </div>
            <h3 className="font-display mt-3 text-xl font-extrabold">Ritme belajar KOLASE</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory/85">
              Bahasa dipakai sejak menit pertama. Guru memberi contoh, lalu bantuan
              dikurangi sampai siswa berani mengambil giliran sendiri.
            </p>
            <PosterCard
              src="/poster/bahasa-dipakai.jpeg"
              alt="Bukan cuma mendengarkan penjelasan — bahasa perlu dipakai, bukan cuma dipelajari"
              caption="Bahasa dipakai, bukan cuma dipelajari"
              badge="PROGRAM"
              className="mx-auto mt-4 w-full max-w-[260px] border-white/15"
            />
            <ul className="mt-4 space-y-2 text-sm text-ivory/90">
              <li className="flex gap-2"><Clock3 size={16} className="mt-0.5 text-sand" /> 0–5 Welcome • 5–15 Warm-up • 15–30 Model & input</li>
              <li className="flex gap-2"><Gauge size={16} className="mt-0.5 text-sand" /> 30–45 Guided practice • 45–55 Speaking round</li>
              <li className="flex gap-2"><Route size={16} className="mt-0.5 text-sand" /> 55–60 Feedback, retry & refleksi</li>
            </ul>
          </Card>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-extrabold tracking-[0.18em] text-navy">JALUR KIDS 6–12</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {KIDS_STEPS.map((s) => (
                  <Card key={s.n} className="rounded-xl">
                    <p className="font-display text-2xl font-extrabold text-sand-deep">{s.n}</p>
                    <h4 className="font-display mt-1 text-base font-extrabold text-ink">{s.t}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink/70">{s.d}</p>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold tracking-[0.18em] text-navy">JALUR 13+</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {TEEN_STEPS.map((s) => (
                  <Card key={s.n} className="rounded-xl">
                    <p className="font-display text-2xl font-extrabold text-sand-deep">{s.n}</p>
                    <h4 className="font-display mt-1 text-base font-extrabold text-ink">{s.t}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink/70">{s.d}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
