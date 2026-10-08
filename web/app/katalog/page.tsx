import type { Metadata } from "next";
import KatalogClient from "./KatalogClient";

export const metadata: Metadata = {
  title: "Katalog Kelas — KOLASE",
  description: "Daftar kelas KOLASE: jadwal, guru, harga, kuota. Daftar atau mulai trial 7 sesi gratis.",
};

export default function KatalogPage() {
  return <KatalogClient />;
}
