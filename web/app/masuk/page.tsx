import type { Metadata } from "next";
import { Suspense } from "react";
import MasukClient from "./MasukClient";

export const metadata: Metadata = {
  title: "Masuk / Daftar — KOLASE",
  description: "Pilih peran (Student, Teacher, Founder, Academic, Systems), lalu masuk pakai email atau daftar — ID terbit berurutan otomatis.",
};

export default function MasukPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-14">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">MEMBERS AREA</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">
          Masuk / Daftar KOLASE
        </h1>
        <p className="mt-2 text-center text-sm text-ink/70">
          Pilih peran dulu — Student, Teacher, Founder, Academic, atau Systems. Tanpa mengisi ID, ID berurutan otomatis.
        </p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-center text-sm text-ink/60">Memuat…</p>}>
            <MasukClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
