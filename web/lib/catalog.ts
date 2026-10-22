// Katalog resmi KOLASE — sumber tunggal untuk landing, katalog, dan checkout.
// Mengacu KOL-SOP-INT-001 V1.4 §2.1: dua segmen, empat program.
// Jangan menambah harga yang tidak tercantum di dokumen resmi.

export type Segment = "kids" | "teens-adults";

export type ProgramPackage = {
  sessions: number;
  label: string;
  price: number | null;
  note?: string;
};

export type Program = {
  id: string;
  slug: string;
  name: string;
  segment: Segment;
  ageLabel: string;
  sessions: number;
  sessionsLabel: string;
  durationMinutes: number;
  assessment: string;
  format: string;
  summary: string;
  price: number | null;
  priceMax?: number;
  priceNote?: string;
  promoPrice?: number;
  regularPrice?: number;
  alumniPrice?: number;
  status: "OPEN" | "COMING_SOON";
  packages?: ProgramPackage[];
  features: string[];
  nextHref: string;
};

export const PROGRAMS: Program[] = [
  {
    id: "CLS-PUB-KIDS-01",
    slug: "kids-public-class",
    name: "Kids Public Class",
    segment: "kids",
    ageLabel: "Usia 6–12 tahun",
    sessions: 4,
    sessionsLabel: "4 sesi",
    durationMinutes: 60,
    assessment: "Pendaftaran langsung, observasi kelas informal",
    format: "Kelas publik, 4 sesi @60 menit, Google Meet",
    summary:
      "Pintu masuk ramah anak: belajar lewat lagu, permainan, dan cerita. Guru mengamati keberanian bicara tanpa tes formal.",
    price: 50000,
    promoPrice: 50000,
    regularPrice: 65000,
    priceNote: "Rp50.000 promo / Rp65.000 reguler",
    status: "OPEN",
    features: [
      "4 sesi live @60 menit",
      "Observasi kelas informal, bukan ujian",
      "Laporan singkat untuk orang tua",
      "Jalur lanjut ke Kids Term Program",
    ],
    nextHref: "/program/little-speakers",
  },
  {
    id: "CLS-KIDS-TERM-01",
    slug: "kids-term-program",
    name: "Kids Term Program",
    segment: "kids",
    ageLabel: "Usia 6–12 tahun",
    sessions: 10,
    sessionsLabel: "10 sesi",
    durationMinutes: 60,
    assessment: "Kids Entry Assessment (lisan ramah usia, 10–15 menit)",
    format: "Kelompok kecil 3–5 anak, 10 sesi @60 menit",
    summary:
      "Program intensif satu term untuk anak yang siap naik tahap. Ada asesmen lisan ramah anak, rombel kecil, dan rapor perkembangan.",
    price: 750000,
    alumniPrice: 650000,
    regularPrice: 750000,
    priceNote: "Rp650.000 alumni / Rp750.000 reguler",
    status: "OPEN",
    features: [
      "10 pertemuan terstruktur @60 menit",
      "Kids Entry Assessment 10–15 menit",
      "Rombel 3–5 anak seusia",
      "KOLASE Kids Progress Report di sesi ke-10",
    ],
    nextHref: "/student/kursus",
  },
  {
    id: "CLS-PUB-TEEN-01",
    slug: "beginner-english",
    name: "Beginner English",
    segment: "teens-adults",
    ageLabel: "Usia 13+ tahun",
    sessions: 4,
    sessionsLabel: "4 sesi",
    durationMinutes: 60,
    assessment: "Pendaftaran langsung, tanpa asesmen awal",
    format: "Kelas publik, 4 sesi @60 menit, Google Meet",
    summary:
      "Mulai dari nol tanpa tekanan. Empat sesi untuk membangun keberanian berbicara sebelum masuk kelompok kecil.",
    price: 75000,
    priceNote: "Rp75.000 per siswa",
    status: "OPEN",
    features: [
      "4 sesi live @60 menit",
      "Tanpa asesmen awal",
      "Latihan speaking praktis",
      "Lanjut ke Diagnostic Placement & Small Group",
    ],
    nextHref: "/daftar",
  },
  {
    id: "CLS-SMALL-GROUP-01",
    slug: "small-group",
    name: "Small Group",
    segment: "teens-adults",
    ageLabel: "Usia 13+ tahun",
    sessions: 6,
    sessionsLabel: "6–45 sesi",
    durationMinutes: 60,
    assessment: "Diagnostic Placement Test 50 poin (+ wawancara lisan 5 menit bila borderline)",
    format: "Kelompok kecil 3–5 siswa, 60 menit per sesi",
    summary:
      "Paket bimbingan intensif dengan placement terstruktur. Pilih kuota sesi sesuai target belajar.",
    price: 450000,
    priceMax: 3150000,
    priceNote: "Rp450.000 – Rp3.150.000 (struktur alumni & reguler)",
    status: "OPEN",
    packages: [
      { sessions: 6, label: "Kickstart", price: 450000 },
      { sessions: 10, label: "Short Term", price: null, note: "Harga sesuai struktur alumni/reguler — konfirmasi tim" },
      { sessions: 15, label: "Core 15", price: null, note: "Harga sesuai struktur alumni/reguler — konfirmasi tim" },
      { sessions: 30, label: "Core 30", price: null, note: "Harga sesuai struktur alumni/reguler — konfirmasi tim" },
      { sessions: 45, label: "Core 45", price: 3150000 },
    ],
    features: [
      "Diagnostic Placement 50 poin",
      "Rombel 3–5 siswa",
      "6, 10, 15, 30, atau 45 sesi",
      "Struktur harga alumni & reguler",
    ],
    nextHref: "/daftar",
  },
];

export function getProgram(idOrSlug: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export function priceLabel(program: Program): string {
  if (program.price == null) return program.priceNote ?? "Harga dikonfirmasi tim";
  if (program.priceMax && program.priceMax > program.price) {
    return `${formatRupiah(program.price)} – ${formatRupiah(program.priceMax)}`;
  }
  return program.priceNote ?? formatRupiah(program.price);
}

export const SEGMENT_LABEL: Record<Segment, string> = {
  kids: "Kids 6–12",
  "teens-adults": "Teens & Adults 13+",
};
