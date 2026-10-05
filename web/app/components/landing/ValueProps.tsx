import { MessagesSquare, ListChecks, Target, ClipboardCheck } from "lucide-react";
import PosterCard from "../PosterCard";
import { Card, SectionHeading } from "../ui";

const ITEMS = [
  {
    icon: MessagesSquare,
    title: "Small Group (3–5 Students)",
    desc: "Ruang latihan maksimal, semua peserta mendapat giliran bicara 60–90 detik + 1 follow-up question.",
  },
  {
    icon: ListChecks,
    title: "Structured Learning",
    desc: "Gabungan input, guided practice, communicative practice, & constructive feedback dalam 90 menit.",
  },
  {
    icon: Target,
    title: "A2 Speaking Focus",
    desc: "Belajar menyampaikan ide, pengalaman masa lalu (Past Simple), dan opini harian dengan runtut.",
  },
  {
    icon: ClipboardCheck,
    title: "Actionable Feedback",
    desc: "Evaluasi performa dan rekomendasi langsung dari pengajar setelah kelas (Post-Class Review).",
  },
];

export default function ValueProps() {
  return (
    <section id="keunggulan" className="scroll-mt-20 bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeading
          eyebrow="WHY KOLASE"
          title="Kenapa belajar di KOLASE berbeda?"
          desc="Ruang belajar Bahasa Inggris yang terstruktur, interaktif, dan terarah — bukan sekadar ikut kelas ramai."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((c) => (
            <Card key={c.title} className="rounded-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-sand">
                <c.icon size={20} />
              </div>
              <h3 className="font-display mt-3 text-base font-extrabold text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{c.desc}</p>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl items-center gap-5 sm:grid-cols-[240px_1fr]">
          <PosterCard
            src="/poster/metode-scaffolding.jpeg"
            alt="Nggak harus langsung bisa sendiri — dengar contoh, coba bersama, pelan-pelan bantuan dikurangi"
            caption="Dengar contoh → coba bersama → berani sendiri"
            badge="MENGAJAR"
            className="mx-auto w-full max-w-[240px]"
          />
          <div>
            <h3 className="font-display text-xl font-extrabold text-ink">Cara kami mengajar</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              Dengar contoh, coba bersama, lalu ambil giliran. Bantuan dikurangi pelan-pelan
              sampai setiap peserta berani bicara sendiri.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
