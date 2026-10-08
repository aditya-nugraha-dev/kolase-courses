"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Badge, Button, Card, Field, Input, Select, Toast } from "../components/ui";

const PROGRAMS = ["Little Speakers (Kids)", "A2 Speaking Discovery Session", "Teens & Adults Mandiri"];
const METHODS = ["QRIS", "Transfer Bank", "E-Wallet"];

async function getCsrf(): Promise<string> {
  try {
    const r = await fetch("/api/csrf");
    const j = await r.json();
    return typeof j.csrfToken === "string" ? j.csrfToken : "";
  } catch {
    return "";
  }
}

export default function BayarPage() {
  return (
    <Suspense fallback={<p className="px-4 py-8 text-center text-sm text-ink/60">Memuat form pembayaran…</p>}>
      <BayarForm />
    </Suspense>
  );
}

function BayarForm() {
  const params = useSearchParams();
  // Prefill dari alur trial-lanjut: ?studentId=&program=&nominal=&method=
  const [form, setForm] = useState(() => {
    const prog = (params.get("program") ?? "").trim();
    const meth = (params.get("method") ?? "").trim();
    return {
      nama: "",
      studentId: (params.get("studentId") ?? "").trim(),
      program: PROGRAMS.includes(prog) ? prog : PROGRAMS[1],
      method: METHODS.includes(meth) ? meth : "QRIS",
      tanggal: "",
      nominal: (params.get("nominal") ?? "").replace(/[^0-9]/g, ""),
      buktiUrl: "",
    };
  });
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"dark" | "green" | "red">("dark");
  const [csrf, setCsrf] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const [hpWebsite, setHpWebsite] = useState("");
  const [uploading, setUploading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { getCsrf().then(setCsrf).catch(() => {}); }, []);

  const show = (m: string, t: "dark" | "green" | "red" = "dark") => {
    setToast(m); setToastTone(t); window.setTimeout(() => setToast(""), 3500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nama.trim().length < 3 || !form.studentId.trim() || !form.nominal.trim()) {
      show("Lengkapi nama, Student ID, dan nominal.", "red");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/payment-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(csrf ? { "x-csrf-token": csrf } : {}) },
        body: JSON.stringify({
          nama: form.nama.trim(),
          studentId: form.studentId.trim(),
          program: form.program,
          method: form.method,
          tanggal: form.tanggal,
          nominal: Number(String(form.nominal).replace(/[^0-9]/g, "")),
          buktiUrl: form.buktiUrl.trim(),
          csrfToken: csrf,
          formStartedAt,
          website: hpWebsite,
        }),
      });
      const j = await res.json();
      if (j.ok) {
        setDone(true);
        show("Konfirmasi tersimpan — tim finance akan verifikasi maks. 1×24 jam.", "green");
      } else {
        show("Gagal menyimpan. Periksa Student ID (STU-XXXXXX) & nominal.", "red");
      }
    } catch {
      show("Jaringan gagal. Coba lagi.", "red");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">02_PAYMENT • FINANCE</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">Konfirmasi Pembayaran</h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/70">
          Pengganti GForm Konfirmasi Pembayaran. Setelah Enrollment ID terbit, konfirmasi di sini agar invoice terverifikasi.
        </p>

        <Card className="mt-6 rounded-xl">
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <input tabIndex={-1} autoComplete="off" value={hpWebsite} onChange={(e) => setHpWebsite(e.target.value)} />
          </div>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Lengkap"><Input value={form.nama} onChange={set("nama")} placeholder="cth. Aisyah Rahma" /></Field>
            <Field label="Student ID"><Input value={form.studentId} onChange={set("studentId")} placeholder="STU-XXXXXX" /></Field>
            <Field label="Program">
              <Select value={form.program} onChange={set("program")}>{PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}</Select>
            </Field>
            <Field label="Metode"><Select value={form.method} onChange={set("method")}>{METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</Select></Field>
            <Field label="Tanggal Bayar"><Input type="date" value={form.tanggal} onChange={set("tanggal")} /></Field>
            <Field label="Nominal (Rp)"><Input inputMode="numeric" value={form.nominal} onChange={set("nominal")} placeholder="cth. 150000" /></Field>
            <div className="sm:col-span-2"><Field label="Link Bukti (Drive) — opsional" hint="Upload bukti ke Drive, tempel link di sini"><Input value={form.buktiUrl} onChange={set("buktiUrl")} placeholder="https://drive.google.com/..." /></Field></div>
            <div className="sm:col-span-2">
              <Field label="Atau upload foto bukti langsung (JPG/PNG/WebP ≤5MB)" hint="Terisi otomatis ke kolom link bukti setelah terupload. Wajib isi Student ID dulu.">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (!form.studentId.trim()) { show("Isi Student ID dulu sebelum upload foto.", "red"); return; }
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append("entityType", "payment");
                      fd.append("entityId", form.studentId.trim());
                      fd.append("photo", f);
                      if (csrf) fd.append("csrfToken", csrf);
                      const res = await fetch("/api/upload-photo", {
                        method: "POST",
                        headers: { ...(csrf ? { "x-csrf-token": csrf } : {}) },
                        body: fd,
                      });
                      const j = await res.json();
                      if (j.ok && typeof j.url === "string") {
                        setForm((prev) => ({ ...prev, buktiUrl: j.url as string }));
                        show("Foto bukti terupload.", "green");
                      } else {
                        show(typeof j.error === "string" ? j.error : "Upload gagal. Cek Student ID & format file.", "red");
                      }
                    } catch {
                      show("Upload gagal. Coba lagi.", "red");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </Field>
              {uploading && <p className="mt-1 text-xs text-ink/60">Mengupload foto…</p>}
              {form.buktiUrl.startsWith("/uploads/") && (
                <img src={form.buktiUrl} alt="Pratinjau bukti" className="mt-2 h-32 w-32 rounded-xl border border-sand/40 object-cover" />
              )}
              <p className="mt-1 text-xs text-ink/60">Butuh upload untuk ID lain? Buka <a href="/foto" className="font-bold text-navy underline">/foto</a>.</p>
            </div>
            <div className="sm:col-span-2"><Button type="submit" disabled={sending} className="w-full">{sending ? "Mengirim…" : "Kirim Konfirmasi"}</Button></div>
          </form>
        </Card>

        {done && (
          <Card className="mt-4 rounded-xl border-navy">
            <div className="flex items-center justify-between border-b border-sand/40 pb-3">
              <Image src="/kolase-primary-black-drive.png" alt="KOLASE" width={160} height={40} className="h-10 w-auto object-contain" />
              <Badge tone="amber">INVOICE • PENDING VERIFIKASI</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              {[["Nama", form.nama], ["Student ID", form.studentId], ["Program", form.program], ["Metode", form.method], ["Tanggal", form.tanggal || "—"], ["Nominal", `Rp ${form.nominal}`]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-xl bg-ivory px-4 py-2.5">
                  <span className="text-ink/60">{k}</span><b className="text-ink">{v}</b>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink/60">Template mengacu 05_DOCUMENT_TEMPLATES/03_INVOICE. Simpan tangkapan layar ini sebagai bukti sementara.</p>
          </Card>
        )}
        <Toast message={toast} tone={toastTone} />
      </div>
    </div>
  );
}
