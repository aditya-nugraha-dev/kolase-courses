import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard Kelas & Siswa — KOLASE",
  description: "Fitur Kelas Step 1-4 (list, tambah, edit/detail, hapus) + Student Master: search, filter, export CSV.",
};

export default function DashboardPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">DASHBOARD • KELAS + SISWA</p>
        <h1 className="font-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Kelola Kelas & Pantau Siswa
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70 sm:text-base">
          <b>Step 1</b> List + okupansi • <b>Step 2</b> Tambah • <b>Step 3</b> Edit/Detail • <b>Step 4</b> Hapus.
          Mirror <b>01_CONTENT_CALENDAR</b> + <b>04_STUDENT_MASTER</b>. Live bila login admin, mock preview bila publik.
        </p>
        <div className="mt-6">
          <DashboardClient />
        </div>
      </div>
    </div>
  );
}
