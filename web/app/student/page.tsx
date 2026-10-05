import type { Metadata } from "next";
import StudentOverview from "./StudentOverview";

export const metadata: Metadata = {
  title: "Portal Murid — KOLASE",
  description: "Overview status pendaftaran, level fit, dan jadwal kelas.",
};

export default function StudentPage() {
  return <StudentOverview />;
}
