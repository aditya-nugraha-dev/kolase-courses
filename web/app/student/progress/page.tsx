import type { Metadata } from "next";
import ProgressClient from "./ProgressClient";

export const metadata: Metadata = { title: "Feedback & Progres — Portal Murid KOLASE" };

export default function ProgressPage() {
  return <ProgressClient />;
}
