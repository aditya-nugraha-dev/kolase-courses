// KOLASE — hint nama -> role leadership (TANPA buat akun).
// Jika user mengetik nama pimpinan di form daftar, beri arahan pilih role yang sesuai.
// Client-side only, non-blocking (tidak menolak submit).

export type LeadershipRole = "founder" | "academic" | "systems";

export interface LeadershipHint {
  role: LeadershipRole;
  displayName: string;
  title: string;
}

const LEADERSHIP: Array<LeadershipHint & { keys: string[] }> = [
  {
    role: "founder",
    displayName: "Ahrenz Galang",
    title: "Founder & Business Lead",
    keys: ["ahrenz galang", "ahrenz", "galang maharsi", "maharsi"],
  },
  {
    role: "academic",
    displayName: "Hilal Ibrahim",
    title: "Co-Founder & Academic Lead",
    keys: ["hilal ibrahim", "badruz", "badruzzaman", "hilal"],
  },
  {
    role: "systems",
    displayName: "Aditya Nugraha",
    title: "Head of Systems & Technology",
    keys: ["aditya nugraha", "adit nugraha", "aditya", "nugraha"],
  },
];

function normalizeName(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Return hint pertama yang cocok, atau null.
export function detectLeadershipHint(nama: string): LeadershipHint | null {
  const n = normalizeName(nama ?? "");
  if (n.length < 4) return null;
  for (const l of LEADERSHIP) {
    if (l.keys.some((k) => n.includes(k))) {
      return { role: l.role, displayName: l.displayName, title: l.title };
    }
  }
  return null;
}
