import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock3, ShieldCheck, Users } from "lucide-react";
import { Badge } from "../ui";

export default function Hero() {
  return (
    <section className="bg-navy text-ivory">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="sand">A2 SPEAKING • PILOT SESSION 0</Badge>
            <Badge tone="blue">KELAS KECIL 3–5 PESERTA</Badge>
          </div>
          <h1 className="font-display mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Bicara Bahasa Inggris Lebih Percaya Diri Dalam Kelas Kecil & Terstruktur
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/85 sm:text-base">
            Program A2 Speaking Discovery Session KOLASE. Pendekatan terarah dengan kelompok 3–5
            peserta dan feedback langsung dari fasilitator.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/daftar"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-sand px-6 py-3.5 text-base font-bold text-ink hover:bg-sand-deep"
            >
              Daftar Pilot Class / Placement Check <ArrowRight size={18} />
            </Link>
            <Link
              href="/#kurikulum"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-ivory/30 px-6 py-3.5 text-base font-semibold text-ivory hover:bg-white/10"
            >
              Lihat Kurikulum & Jadwal
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center sm:max-w-md">
            {[
              { icon: Users, top: "3–5", bottom: "siswa/kelas" },
              { icon: Clock3, top: "90 mnt", bottom: "per sesi" },
              { icon: ShieldCheck, top: "A2", bottom: "speaking focus" },
            ].map((s) => (
              <div key={s.bottom} className="rounded-xl border border-ivory/15 bg-white/5 px-2 py-3">
                <s.icon size={18} className="mx-auto text-sand" />
                <p className="font-display mt-1 text-lg font-extrabold">{s.top}</p>
                <p className="text-[11px] text-ivory/70">{s.bottom}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-sand/40 bg-paper p-5 text-ink shadow-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold tracking-[0.18em] text-navy">PILOT SESSION 0</p>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Pendaftaran dibuka</span>
          </div>
          <h2 className="font-display mt-2 text-xl font-extrabold text-ink">My Weekend (Past Simple)</h2>
          <p className="mt-1 text-sm text-ink/70">
            Tulis recount 4–6 kalimat, cerita lisan 60–90 detik, + 1 follow-up question. Gain diukur pre → post (0–10).
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              "Welcome & setup + retrieval warm-up",
              "Model recount + controlled practice",
              "Guided planning + speaking round",
              "Focused feedback, retry & post-check",
            ].map((t) => (
              <li key={t} className="flex gap-2 text-ink/80">
                <CalendarCheck size={16} className="mt-0.5 shrink-0 text-navy" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-ivory p-3 text-xs leading-relaxed text-ink/70">
            Alur: <b>Registration → Placement Check → Class Match (3–5) → Live Session & Feedback</b>.
            Link Google Meet dibagikan setelah matching manual.
          </div>
          <Link href="/daftar" className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-bold text-ivory hover:bg-navy">
            Mulai Placement Check
          </Link>
        </div>
      </div>
    </section>
  );
}
