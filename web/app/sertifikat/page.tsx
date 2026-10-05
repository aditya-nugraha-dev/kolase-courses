"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Card, Field, Input, Select } from "../components/ui";

export default function SertifikatPage() {
  const [f, setF] = useState({ nama: "Aisyah Rahma", studentId: "STU-000002", program: "A2 Speaking Discovery Session — My Weekend" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((v) => ({ ...v, [k]: e.target.value }));

  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">01_CERTIFICATE • 02_EBADGE</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">Sertifikat & eBadge</h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/70">
          Certificate of Participation sebagai bukti keikutsertaan — bukan sertifikasi tingkat kemampuan bahasa.
        </p>

        <Card className="mt-6 rounded-xl">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Nama"><Input value={f.nama} onChange={set("nama")} /></Field>
            <Field label="Student ID"><Input value={f.studentId} onChange={set("studentId")} /></Field>
            <Field label="Program">
              <Select value={f.program} onChange={set("program")}>
                <option>A2 Speaking Discovery Session — My Weekend</option>
                <option>Little Speakers (Kids)</option>
                <option>Teens & Adults Mandiri</option>
              </Select>
            </Field>
          </div>
        </Card>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-sand/50 bg-paper p-8 text-center shadow-sm">
            <Image src="/kolase-primary-black-drive.png" alt="KOLASE" width={200} height={64} className="mx-auto h-16 w-auto object-contain" />
            <p className="mt-4 text-xs font-extrabold tracking-[0.25em] text-navy">CERTIFICATE OF PARTICIPATION</p>
            <p className="font-display mt-2 text-3xl font-extrabold text-ink">{f.nama || "Nama Peserta"}</p>
            <p className="mt-1 text-sm text-ink/70">{f.studentId} • {f.program}</p>
            <div className="mx-auto mt-4 h-px w-24 bg-sand" />
            <p className="mt-3 text-xs text-ink/60">Belajar dengan Arah, Berkembang dengan Percaya Diri.</p>
            <Button onClick={() => window.print()} variant="secondary" className="mt-5">Cetak / Simpan PDF</Button>
          </div>
          <div className="rounded-2xl bg-navy p-6 text-center text-ivory">
            <p className="text-xs font-extrabold tracking-[0.2em] text-sand">EBADGE</p>
            <Image src="/kolase-icon-white.png" alt="eBadge" width={80} height={80} className="mx-auto mt-3 h-20 w-20 object-contain" />
            <p className="font-display mt-3 text-lg font-extrabold">{f.nama || "—"}</p>
            <p className="text-xs text-ivory/70">{f.studentId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
