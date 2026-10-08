import type { Metadata } from "next";
import KalenderClient from "./KalenderClient";

export const metadata: Metadata = {
  title: "Kalender Kelas — KOLASE",
  description: "Jadwal sesi kelas KOLASE per bulan: lihat kapan setiap sesi berlangsung.",
};

export default function KalenderPage() {
  return <KalenderClient />;
}
