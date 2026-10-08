"use client";

import { useEffect, useState } from "react";
import PosterCard from "../components/PosterCard";
import MateriPanel from "../components/MateriPanel";
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

interface TrialRow {
  trial_id: string;
  student_id: string;
  class_id: string;
  status: string;
  sessions_delivered: number;
}

export default function GuruPage() {
  const [tab, setTab] = useState<"laporan" | "reschedule" | "trial" | "materi">("laporan");
  const [lap, setLap] = useState({ classId: "", tanggal: "", materi: "", hadir: "", catatan: "" });
  const [res, setRes] = useState({ classId: "", lama: "", baru: "", alasan: "Kendala pengajar" });
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"dark" | "green" | "red">("dark");
  const [done, setDone] = useState("");
  const [sending, setSending] = useState(false);
  const [csrf, setCsrf] = useState("");
  // Trial 7 sesi: mulai + tandai progres.
  const [trialForm, setTrialForm] = useState({ studentId: "", classId: "CLS-PUB-KIDS-01" });
  const [trials, setTrials] = useState<TrialRow[]>([]);
  const [trialLoading, setTrialLoading] = useState(false);
  const [busyTrial, setBusyTrial] = useState<string | null>(null);
  // Materi kelas.
  const [materiClass, setMateriClass] = useState("CLS-PUB-KIDS-01");

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

  const loadTrials = async () => {
    if (!trialForm.studentId.trim()) { show("Isi Student ID dulu.", "red"); return; }
    setTrialLoading(true);
    try {
      const r = await fetch(`/api/trial?student_id=${encodeURIComponent(trialForm.studentId.trim())}`);
      const j = await r.json();
      setTrials(Array.isArray(j.rows) ? (j.rows as TrialRow[]) : []);
    } catch {
      show("Gagal memuat trial.", "red");
    } finally {
      setTrialLoading(false);
    }
  };

  const startTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialForm.studentId.trim()) { show("Isi Student ID dulu.", "red"); return; }
    setSending(true);
    try {
      const r = await fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: trialForm.studentId.trim(), class_id: trialForm.classId.trim() || undefined }),
      });
      const j = await r.json();
      if (j.ok) {
        show(j.existing ? `Trial aktif: ${j.trial_id} (${j.sessions_delivered}/7).` : `Trial dimulai: ${j.trial_id}.`, "green");
        await loadTrials();
      } else show(typeof j.error === "string" ? j.error : "Gagal memulai trial.", "red");
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setSending(false);
    }
  };

  const markSession = async (t: TrialRow) => {
    const next = Math.min(7, Number(t.sessions_delivered ?? 0) + 1);
    setBusyTrial(t.trial_id);
    try {
      const r = await fetch("/api/trial", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trial_id: t.trial_id, sessions_delivered: next }),
      });
      const j = await r.json();
      if (j.ok) {
        show(j.completed ? `${t.trial_id} selesai 7/7 — murid bisa pilih lanjut/berhenti.` : `${t.trial_id} → sesi ${next}/7.`, "green");
        await loadTrials();
      } else show(typeof j.error === "string" ? j.error : "Gagal menyimpan progres.", "red");
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setBusyTrial(null);
    }
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

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["laporan", "reschedule", "trial", "materi"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setDone(""); }}
              className={`rounded-xl border px-4 py-3 text-sm font-bold ${tab === t ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70"}`}>
              {t === "laporan" ? "Session Report" : t === "reschedule" ? "Reschedule" : t === "trial" ? "Trial 7 Sesi" : "Materi Kelas"}
            </button>
          ))}
        </div>

        {tab === "trial" ? (
          <div className="mt-4 space-y-4">
            <Card className="rounded-xl">
              <form onSubmit={startTrial} className="grid gap-4 sm:grid-cols-2">
                <Field label="Student ID"><Input value={trialForm.studentId} onChange={(e) => setTrialForm({ ...trialForm, studentId: e.target.value })} placeholder="STU-XXXXXX" /></Field>
                <Field label="Class ID Trial"><Input value={trialForm.classId} onChange={(e) => setTrialForm({ ...trialForm, classId: e.target.value })} placeholder="CLS-PUB-KIDS-01" /></Field>
                <div className="flex gap-2 sm:col-span-2">
                  <Button type="submit" disabled={sending} className="flex-1">{sending ? "Memproses…" : "Mulai Trial"}</Button>
                  <Button type="button" variant="secondary" onClick={() => void loadTrials()}>Cek Trial</Button>
                </div>
              </form>
            </Card>
            {trialLoading ? (
              <p className="text-sm text-ink/60">Memuat trial…</p>
            ) : (
              trials.map((t) => (
                <Card key={t.trial_id} className="rounded-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-ink">
                      <code className="rounded bg-ivory px-1.5 py-0.5">{t.trial_id}</code>
                      <span className="ml-2 text-ink/60">{t.class_id}</span>
                    </p>
                    <Badge tone={t.status === "COMPLETED" ? "green" : t.status === "STARTED" ? "amber" : "slate"}>
                      {t.status} • {Number(t.sessions_delivered ?? 0)}/7
                    </Badge>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {Array.from({ length: 7 }, (_, i) => (
                      <span key={i} className={`h-2 flex-1 rounded-full ${i < Number(t.sessions_delivered ?? 0) ? "bg-emerald-500" : "bg-ivory"}`} />
                    ))}
                  </div>
                  {t.status === "STARTED" && (
                    <Button
                      disabled={busyTrial === t.trial_id}
                      onClick={() => void markSession(t)}
                      className="mt-3 w-full"
                    >
                      {busyTrial === t.trial_id ? "Menyimpan…" : `Tandai sesi ${Math.min(7, Number(t.sessions_delivered ?? 0) + 1)}/7 selesai`}
                    </Button>
                  )}
                </Card>
              ))
            )}
            {trials.length === 0 && !trialLoading && (
              <p className="text-center text-xs text-ink/50">Isi Student ID lalu “Cek Trial” untuk melihat progres 7 sesi.</p>
            )}
          </div>
        ) : tab === "materi" ? (
          <div className="mt-4 space-y-4">
            <Card className="rounded-xl">
              <Field label="Class ID Materi">
                <Input value={materiClass} onChange={(e) => setMateriClass(e.target.value)} placeholder="CLS-PUB-KIDS-01" />
              </Field>
              <p className="mt-1 text-xs text-ink/60">Upload PDF/DOC/PPT/gambar/MP3 ≤5MB — langsung bisa diunduh murid sekelas.</p>
            </Card>
            {materiClass.trim() ? (
              <MateriPanel classId={materiClass.trim()} canUpload />
            ) : (
              <p className="text-center text-xs text-ink/50">Isi Class ID dulu.</p>
            )}
          </div>
        ) : tab === "laporan" ? (
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
