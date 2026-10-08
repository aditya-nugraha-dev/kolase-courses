import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, Gift } from "lucide-react";
import { Badge, Card } from "../ui";

// Section "Mulai Gratis — 7 Sesi Gratis" untuk home page.
// Mirror skema DB: trials (7 sesi = 6 belajar + Sesi 7 Progress Test).
// Trial berlaku untuk jalur CORE Small Group (bukan Public 4 sesi).
const SESI = [
  { n: "1–6", t: "6 Sesi Belajar", d: "Small group 3–5, 60 mnt/sesi, speaking + feedback tiap sesi." },
  { n: "7", t: "Sesi 7 Progress Test", d: "Uji capaian + rekomendasi jalur lanjut (6/10/15/30/45 sesi)." },
];

const ALUR = [
  { n: "1", t: "Daftar gratis", d: "Isi /daftar (±3 mnt). Dapat STU-XXXXXX seumur hidup." },
  { n: "2", t: "Placement / Entry", d: "13+: placement 0–50. <13: Entry Assessment 10–15 mnt." },
  { n: "3", t: "Mulai 7 sesi", d: "Masuk rombel min. 3 siswa. Link Meet dibagikan per kelas." },
  { n: "4", t: "Lanjut hemat", d: "Selesai trial → kredit -7 diakui exactly-once saat ambil CORE." },
];

export default function TrialGratis() {
  return (
    <section id="gratis" className="scroll-mt-20 bg-paper">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <div className="overflow-hidden rounded-2xl border border-sand/40 bg-ivory">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="sand">MULAI GRATIS</Badge>
                <Badge tone="green">7 SESI • RP 0</Badge>
              </div>
              <h2 className="font-display mt-3 text-2xl font-extrabold text-ink sm:text-3xl">
                Coba 7 Sesi Gratis sebelum berkomitmen
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
                6 sesi belajar + 1 Progress Test untuk jalur <b>CORE Small Group</b> (3–5 siswa).
                Tanpa pembayaran di awal — cukup daftar, placement, lalu mulai.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/daftar"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-sand px-6 py-3.5 text-base font-bold text-ink hover:bg-sand-deep"
                >
                  <Gift size={18} /> Mulai Gratis Sekarang <ArrowRight size={18} />
                </Link>
                <Link
                  href="/#program"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-sand bg-paper px-6 py-3.5 text-base font-semibold text-ink hover:border-ink"
                >
                  <CalendarCheck size={18} /> Lihat Program
                </Link>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/60">
                <BadgeCheck size={14} className="text-emerald-600" />
                Tanpa kartu / tanpa transfer • Kuota rombel terbatas • Min. 3 siswa untuk mulai
              </p>
            </div>

            <div className="grid gap-3">
              {SESI.map((s) => (
                <Card key={s.t} className="rounded-xl">
                  <p className="text-xs font-extrabold tracking-wider text-navy">SESI {s.n}</p>
                  <h3 className="font-display mt-1 text-base font-extrabold text-ink">{s.t}</h3>
                  <p className="mt-1 text-sm text-ink/70">{s.d}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-3 border-t border-sand/40 bg-paper p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
            {ALUR.map((s) => (
              <div key={s.n} className="rounded-xl border border-sand/40 bg-ivory p-4">
                <p className="font-display text-2xl font-extrabold text-sand-deep">{s.n}</p>
                <h4 className="font-display mt-1 text-sm font-extrabold text-ink">{s.t}</h4>
                <p className="mt-1 text-xs leading-relaxed text-ink/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
