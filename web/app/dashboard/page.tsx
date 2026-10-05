import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard Tracker Preview — KOLASE",
  description: "Preview Student Master (STU-XXXXXX) + Content Calendar (CLS-XXXXXX): filter status, search nama/email.",
};

export default function DashboardPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">INTERNAL ADMIN AREA • PREVIEW</p>
        <h1 className="font-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Student Master & Content Calendar
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70 sm:text-base">
          Mirror <b>04_STUDENT_MASTER</b> + <b>01_CONTENT_CALENDAR</b>. Mock: STU-000001, STU-000002, CLS-00000001.
          Filter by status, cari nama/email.
        </p>
        <div className="mt-6">
          <DashboardClient />
        </div>
      </div>
    </div>
  );
}
