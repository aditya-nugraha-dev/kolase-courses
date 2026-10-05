import Link from "next/link";
import type { Metadata } from "next";
import { Badge, Card, SectionHeading } from "../components/ui";

export const metadata: Metadata = {
  title: "Konten & Kalender — KOLASE",
  description: "Content Calendar Launch V1.0, campaigns, published content, dan arsip video.",
};

const DRIVE_ROOT = "https://drive.google.com/drive/folders/1GrrzOlnCCAML8QXhv7ELyReeHAsZKXit";

const VIDEOS = [
  {
    title: "CNT-000019.mp4",
    desc: "Arsip konten launch (102 MB)",
    fileId: "1_lNpv2D0qFi9sqVOEwgsECAEN25SVjup",
  },
  {
    title: "KONTEN GALANG.mp4",
    desc: "Materi pembicara (143 MB)",
    fileId: "1hJvLyS1dcjlKTSDNyqz9ibavMjYDIF9Z",
  },
];

// POST 3 — Carousel Instagram "Apa yang KOLASE percaya tentang belajar" (04_PUBLISHED_CONTENT)
const CAROUSEL_SLIDES = [
  { title: "Slide 1", fileId: "1mJYX2sEPIm7BFrNLW8NxjSspJ3GLOWTG" },
  { title: "Slide 2", fileId: "1Kj6YsvTEnUvx4EJ00t_QL3EH5UZW4jSy" },
  { title: "Slide 3", fileId: "1wI2KbckCY5KBP29IteJQiEdiIZXvaAA4" },
  { title: "Slide 4", fileId: "1OAY0xNQQmFSEq-fQLF6CVBNYHysws3vn" },
  { title: "Slide 5", fileId: "1BfIEfXkD6bLpXRxF40xxhj0BrBwUEwVF" },
  { title: "Slide 6", fileId: "12tPfo6c2GC2hEi4_TQxBrZ88fKpNMhmt" },
];

const DOCS = [
  {
    group: "00_START_HERE",
    items: [
      { title: "START HERE & Drive Navigation Guide V1.0", fileId: "1rWiZkpvq8he9iyeM4D1fhncO4yBJGvCCgBeusUQnL5I", kind: "doc" },
      { title: "Master Links & System Directory V1.0", fileId: "12XpiiI29nkwnxuQDNGbRGCCWg4pY9gFl45VTpS3W-0Q", kind: "sheet" },
    ],
  },
  {
    group: "04_PANDUAN & 05_BRAND",
    items: [
      { title: "BRAND GUIDELINES V1", fileId: "1gKxNfujXbxFVjnm3GNf2yHqK4U10ZhHtPvt0PkSZ5qU", kind: "doc" },
      { title: "Company Operating Manual V1.6", fileId: "1mqMm22EUt9m1aFMcvHOF3HvnmWwKw235-GA0JP-aY74", kind: "doc" },
      { title: "SOP Pelaksanaan Kelas & Student Journey V2.6", fileId: "1MZt4omWlGgnLdBoxf5Bz6ujZJbU56pSMyhM8sk5s8lA", kind: "doc" },
      { title: "SOP Pendaftaran & Asesmen Penempatan V1.5", fileId: "1CvhgweAMjM8Icq6IdvfQPmAXnRyq9s93NHqLql9ktf4", kind: "doc" },
      { title: "Standar Penamaan Kode & Format ID V1.3", fileId: "1Q1YsGekA3SEieuoP7uG50Mm15FDFYzy0CKDbSMRMi44", kind: "doc" },
      { title: "SOP & Alur Lengkap Operasional KOLASE English", fileId: "1HOKhgLULjREb6EcaaH-ToEXhjgYYmFvZLUWTWi43xfg", kind: "doc" },
    ],
  },
];

function driveUrl(fileId: string, kind: string) {
  if (kind === "sheet") return `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
  return `https://docs.google.com/document/d/${fileId}/edit`;
}

export default function KontenPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">03_MARKETING • CONTENT DATABASE</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">Kalender & Arsip Konten</h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-ink/70">
          Sumber: Content Calendar Launch V1.0 + 01_CONTENT_DATABASE + 04_PUBLISHED_CONTENT (Drive KOLASE MASTER).
          Alur: working files → published → analytics.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge tone="sand">01_CONTENT_DATABASE</Badge>
          <Badge tone="navy">02_CAMPAIGNS</Badge>
          <Badge tone="blue">04_PUBLISHED</Badge>
        </div>
        <div className="mt-4 text-center">
          <a href={DRIVE_ROOT} target="_blank" rel="noreferrer" className="text-xs font-bold text-navy underline">
            Buka folder Drive KOLASE MASTER
          </a>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="rounded-xl">
            <h2 className="font-display text-base font-extrabold text-ink">Video Launch</h2>
            <ul className="mt-2 space-y-3 text-sm text-ink/80">
              {VIDEOS.map((v) => (
                <li key={v.fileId} className="rounded-xl bg-ivory p-3">
                  <b>{v.title}</b> — {v.desc}
                  <span className="mt-2 flex gap-2">
                    <a href={`https://drive.google.com/file/d/${v.fileId}/preview`} target="_blank" rel="noreferrer" className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-ivory">Preview</a>
                    <a href={`https://drive.google.com/uc?export=download&id=${v.fileId}`} className="rounded-lg border border-sand px-3 py-1.5 text-xs font-bold text-ink">Download</a>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-xl bg-ivory p-3 text-xs text-ink/60">
              File besar tersimpan di Drive root KOLASE MASTER. Website tidak embed langsung agar tetap ringan —
              buka via Drive / dashboard tracker.
            </p>
            <Link href="/dashboard" className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory hover:bg-navy">
              Buka Dashboard Tracker
            </Link>
          </Card>
          <Card className="rounded-xl">
            <SectionHeading eyebrow="ALUR KONTEN" title="Working → Published" />
            <ol className="mt-4 space-y-2 text-sm text-ink/80">
              <li><b>1. Working files</b> — 03_DESIGN_WORKING_FILES, aman, jangan publish langsung.</li>
              <li><b>2. Published</b> — 04_PUBLISHED_CONTENT + feed Instagram / WhatsApp ortu.</li>
              <li><b>3. Analytics</b> — 05_ANALYTICS, ukur reach & respons, bukan klaim hasil instan.</li>
            </ol>
          </Card>
        </div>

        <Card className="mt-4 rounded-xl">
          <SectionHeading eyebrow="04_PUBLISHED_CONTENT" title="POST 3 — Carousel: Apa yang KOLASE percaya tentang belajar" desc="6 slide PNG dari Drive. Klik gambar untuk buka ukuran penuh." />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CAROUSEL_SLIDES.map((s) => (
              <a key={s.fileId} href={`https://drive.google.com/file/d/${s.fileId}/view`} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-sand/40 bg-ivory">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://drive.google.com/thumbnail?id=${s.fileId}&sz=w800`}
                  alt={`KOLASE ${s.title}`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="aspect-square w-full bg-ivory object-cover transition group-hover:scale-[1.02]"
                />
                <span className="block px-3 py-2 text-xs font-bold text-ink">{s.title}</span>
              </a>
            ))}
          </div>
        </Card>

        <Card className="mt-4 rounded-xl">
          <SectionHeading eyebrow="DOKUMEN RUJUKAN" title="Start Here, Brand & SOP" desc="Langsung dari Drive 00_START_HERE, 04_PANDUAN_DAN_KEBIJAKAN, dan 05_BRAND_ASSETS." />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {DOCS.map((g) => (
              <div key={g.group}>
                <p className="text-xs font-extrabold tracking-[0.15em] text-navy">{g.group}</p>
                <ul className="mt-2 space-y-2">
                  {g.items.map((d) => (
                    <li key={d.fileId} className="flex items-center justify-between gap-2 rounded-xl bg-ivory px-4 py-2.5 text-sm">
                      <span className="text-ink/80">{d.title}</span>
                      <a href={driveUrl(d.fileId, d.kind)} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-ivory">Buka</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
