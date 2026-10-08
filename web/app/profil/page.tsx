import type { Metadata } from "next";
import ProfilClient from "./ProfilClient";

export const metadata: Metadata = {
  title: "Profil — KOLASE",
  description: "Profil akun: data diri, ID, dan jalan pintas per peran.",
};

export default function ProfilPage() {
  return <ProfilClient />;
}
