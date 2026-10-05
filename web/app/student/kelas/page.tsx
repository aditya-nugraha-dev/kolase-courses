import type { Metadata } from "next";
import KelasClient from "./KelasClient";

export const metadata: Metadata = { title: "Kelas & Materi — Portal Murid KOLASE" };

export default function KelasPage() {
  return <KelasClient />;
}
