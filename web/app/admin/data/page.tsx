import type { Metadata } from "next";
import DataClient from "./DataClient";

export const metadata: Metadata = {
  title: "Big Data — KOLASE",
  description: "Agregat operasional: omzet, okupansi, funnel trial, placement, kehadiran, gain, integritas + ekspor CSV.",
};

export default function DataPage() {
  return <DataClient />;
}
