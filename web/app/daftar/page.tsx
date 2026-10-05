import type { Metadata } from "next";
import PosterCard from "../components/PosterCard";
import RegistrationWizard from "../components/RegistrationWizard";

export const metadata: Metadata = {
  title: "Daftar Pilot Class / Placement Check — KOLASE",
  description: "Registrasi GForm 1 + Placement Pre-Check GForm 2: auto-scoring, Student ID STU-XXXXXX, Attempt ATM-######.",
};

export default function DaftarPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">REGISTRATION → PLACEMENT → CLASS MATCH</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">
          Daftar Pilot Class / Placement Check
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/70 sm:text-base">
          90 menit • Small group 3–5 • A2 Speaking.
        </p>
        <PosterCard
          src="/poster/cerita-awal.jpeg"
          alt="Cerita sederhana bisa jadi awal — belajar bermakna saat bahasa terhubung dengan hidup kita"
          caption="Placement dimulai dari cerita sehari-harimu — nama, hobi, kegiatan harian."
          className="mx-auto mt-6 w-full max-w-xs"
        />
        <div className="mt-6">
          <RegistrationWizard />
        </div>
      </div>
    </div>
  );
}
