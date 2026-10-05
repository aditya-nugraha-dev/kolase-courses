import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Panel Guru/Admin — KOLASE",
  description: "Student Master restricted: filter, search, export rekap.",
};

export default function AdminPage() {
  return <AdminClient />;
}
