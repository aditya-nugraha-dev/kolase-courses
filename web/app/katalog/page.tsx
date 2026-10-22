import type { Metadata } from "next";
import KatalogClient from "./KatalogClient";

export const metadata: Metadata = {
  title: "Katalog Program — KOLASE",
  description:
    "Katalog resmi KOLASE: Kids Public Class, Kids Term Program, Beginner English 13+, dan Small Group.",
};

export default function KatalogPage() {
  return <KatalogClient />;
}
