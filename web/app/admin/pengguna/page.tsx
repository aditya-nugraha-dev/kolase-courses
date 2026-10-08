import type { Metadata } from "next";
import PenggunaClient from "./PenggunaClient";

export const metadata: Metadata = {
  title: "Database Pengguna — KOLASE",
  description: "Staff: lihat teacher mengajar di kelas apa, student siapa saja, hapus data.",
};

export default function PenggunaPage() {
  return <PenggunaClient />;
}
