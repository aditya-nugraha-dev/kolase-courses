"use client";

import { useEffect, useState } from "react";
import PosterCard from "../components/PosterCard";
import { Badge, Button, Card, Field, Input, Select, Textarea, Toast } from "../components/ui";

async function getCsrf(): Promise<string> {
  try {
    const r = await fetch("/api/csrf");
    const j = await r.json();
    return typeof j.csrfToken === "string" ? j.csrfToken : "";
  } catch {
    return "";
  }
}

export default function GuruPage() {
  const [tab, setTab] = useState<"laporan" | "reschedule">("laporan");
  const [lap, setLap] = useState({ classId: "", tanggal: "", materi: "", hadir: "", catatan: "" });
  const [res, setRes] = useState({ classId: "", lama: "", baru: "", alasan: "Kendala pengajar" });
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"dark" | "green" | "red">("dark");
  const [done, setDone] = useState("");
  const [sending, setSending] = useState(false);
  const [csrf, setCsrf] = useState("");

  useEffect(() => { getCsrf().then(setCsrf).catch(() => {}); }, []);

  const show = (m: string, t: "dark" | "green" | "red" = "dark") => { setToast(m); setToastTone(t); window.setTimeout(() => setToast(""), 3500); };

  const post = async (path: string, body: Record<string, unknown>) => {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(csrf ? { "x-csrf-token": csrf } : {}) },
      body: JSON.stringify({ ...body, csrfToken: csrf, website: "" }),
    });
    return r.json() as Promise<{ ok: boolean }>;
  };

  const submitLap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lap.classId.trim() || !lap.catatan.trim()) { show("Lengkapi Class ID dan catatan sesi.", "red"); return; }
    setSending(true);
    try {
      const j = await post("/api/teacher-report", lap);
      if (j.ok) { setDone(`Laporan ${lap.classId} tersimpan — masuk antrean 03_SESSION_REPORTS.`); show("Teacher Session Report terkirim.", "green"); }
      else show("Gagal. Pastikan login sebagai Guru/Admin & Class ID valid.", "red");
    } catch { show("Jaringan gagal.", "red"); } finally { setSending(false); }
  };
  const submitRes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!res.classId.trim() || !res.baru.trim()) { show("Lengkapi Class ID dan jadwal baru.", "red"); return; }
    setSending(true);
    try {
      const j = await post("/api/reschedule", res);
      if (j.ok) { setDone(`Request reschedule ${res.classId} → ${res.baru} tercatat — menunggu approval.`); show("Request reschedule terkirim.", "green"); }
      else show("Gagal. Pastikan login sebagai Guru/Admin.", "red");
    } catch { show("Jaringan gagal.", "red"); } finally { setSending(false); }
  };

  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">TEACHER OPERATIONS</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">Laporan & Reschedule Guru</h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/70">Pengganti GForm Teacher Session Report & Teacher Reschedule Request.</p>
        <PosterCard
          src="/poster/ruang-menjawab.jpeg"
          alt="Bukan sekedar benar atau salah — ada kesempatan menjawab, bertanya, dan menyampaikan ide"
          className="mx-auto mt-6 w-full max-w-[220px]"
        />

        <div className="mt-6 grid grid-cols-2 gap-2">
          {(["laporan", "reschedule"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setDone(""); }}
              className={`rounded-xl border px-4 py-3 text-sm font-bold ${tab === t ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70"}`}>
              {t === "laporan" ? "Session Report" : "Reschedule"}
            </button>
          ))}
        </div>

        {tab === "laporan" ? (
          <Card className="mt-4 rounded-xl">
            <form onSubmit={submitLap} className="grid gap-4 sm:grid-cols-2">
              <Field label="Class ID"><Input value={lap.classId} onChange={(e) => setLap({ ...lap, classId: e.target.value })} placeholder="CLS-000001" /></Field>
              <Field label="Tanggal Sesi"><Input type="date" value={lap.tanggal} onChange={(e) => setLap({ ...lap, tanggal: e.target.value })} /></Field>
              <Field label="Materi"><Input value={lap.materi} onChange={(e) => setLap({ ...lap, materi: e.target.value })} placeholder="My Weekend Past Simple" /></Field>
              <Field label="Kehadiran (cth. 4/5)"><Input value={lap.hadir} onChange={(e) => setLap({ ...lap, hadir: e.target.value })} placeholder="4/5" /></Field>
              <div className="sm:col-span-2"><Field label="Catatan Sesi"><Textarea rows={4} value={lap.catatan} onChange={(e) => setLap({ ...lap, catatan: e.target.value })} placeholder="Partisipasi, kosakata baru, gain pre→post, tindak lanjut" /></Field></div>
              <div className="sm:col-span-2"><Button type="submit" disabled={sending} className="w-full">{sending ? "Mengirim…" : "Kirim Session Report"}</Button></div>
            </form>
          </Card>
        ) : (
          <Card className="mt-4 rounded-xl">
            <form onSubmit={submitRes} className="grid gap-4 sm:grid-cols-2">
              <Field label="Class ID"><Input value={res.classId} onChange={(e) => setRes({ ...res, classId: e.target.value })} placeholder="CLS-000001" /></Field>
              <Field label="Jadwal Lama"><Input value={res.lama} onChange={(e) => setRes({ ...res, lama: e.target.value })} placeholder="Sabtu 10:00" /></Field>
              <Field label="Jadwal Baru Diusulkan"><Input value={res.baru} onChange={(e) => setRes({ ...res, baru: e.target.value })} placeholder="Minggu 13:00" /></Field>
              <Field label="Alasan"><Select value={res.alasan} onChange={(e) => setRes({ ...res, alasan: e.target.value })}>
                {["Kendala pengajar", "Kendala mayoritas murid", "Hari libur", "Lainnya"].map((a) => <option key={a} value={a}>{a}</option>)}
              </Select></Field>
              <div className="sm:col-span-2"><Button type="submit" disabled={sending} className="w-full">{sending ? "Mengirim…" : "Kirim Request Reschedule"}</Button></div>
            </form>
          </Card>
        )}

        {done && <Card className="mt-4 rounded-xl"><Badge tone="green">TERCATAT</Badge><p className="mt-2 text-sm text-ink/80">{done}</p></Card>}
        <Toast message={toast} tone={toastTone} />
      </div>
    </div>
  );
}
