"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  FileText,
  Gift,
  Search,
  TrendingUp,
  Video,
} from "lucide-react";
import { Button, Modal, Toast } from "../components/ui";

// Portal murid ala referensi: Kelas Saya + Tugas Hari Ini + kalender + Upcoming.
// Data live dari /api/student/me (student, class, membership, sessions, tasks, trial).
interface SessionRow {
  session_id: string;
  seq: number;
  tanggal: string;
  status: string;
}

interface TrialRow {
  trial_id: string;
  class_id: string;
  status: string;
  sessions_delivered: number;
}

interface MeData {
  ok: boolean;
  source?: string;
  student: Record<string, unknown>;
  class: Record<string, unknown> | null;
  membership?: Record<string, unknown> | null;
  sessions?: SessionRow[];
  tasks?: { placement: boolean; postclass: boolean; observed: boolean };
  trial?: TrialRow | null;
}

const getStr = (o: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v) return v;
    if (typeof v === "number") return String(v);
  }
  return "";
};

const getNum = (o: Record<string, unknown>, ...keys: string[]): number | null => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number") return v;
  }
  return null;
};

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const dayKey = (y: number, m: number, d: number) => `${y}-${m + 1}-${d}`;
const fmtTanggal = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]?.slice(0, 3) ?? ""}`;
};

type Tab = "tugas" | "jadwal" | "info";

export default function StudentOverview() {
  const [data, setData] = useState<MeData | null>(null);
  const [tab, setTab] = useState<Tab>("tugas");
  const [q, setQ] = useState("");
  useEffect(() => {
    let live = true;
    fetch("/api/student/me")
      .then((r) => r.json())
      .then((j) => {
        if (live && j.ok) setData(j as MeData);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const now = useMemo(() => new Date(), []);
  const [cal, setCal] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<string | null>(
    `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  );

  const st = (data?.student ?? {}) as Record<string, unknown>;
  const cls = (data?.class ?? {}) as Record<string, unknown>;
  const mem = (data?.membership ?? {}) as Record<string, unknown>;
  const sessions = useMemo(() => data?.sessions ?? [], [data]);
  const flags = data?.tasks ?? { placement: false, postclass: false, observed: false };

  const name = getStr(st, "preferred_name", "full_name", "nama") || "Murid";
  const sid = getStr(st, "student_id") || "STU-XXXXXX";
  const placement = getNum(st, "placement_total", "placementScore") ?? 0;
  const pre = getNum(st, "pre_check_score", "preCheck") ?? 0;
  const post = getNum(st, "post_check_score", "postCheck");
  const gain = getNum(st, "gain_score", "gainScore") ?? (post != null ? post - pre : null);
  const fit = getStr(st, "a2_fit", "a2Fit") || "PLACEMENT_PENDING";

  const clsName = getStr(cls, "nama", "name") || "Menunggu class matching";
  const jadwal = getStr(cls, "jadwal", "schedule") || "Jadwal menyusul via WhatsApp";
  const guru = getStr(cls, "teacher_name", "guru", "teacher") || "Tim KOLASE";
  const meet = getStr(cls, "meet_link", "meet");
  const classId = getStr(cls, "id", "pilot_class_id");
  const sisa = typeof mem.sisa === "number" ? mem.sisa : null;
  const memStatus = getStr(mem, "status");

  const hasPlacement = flags.placement || placement > 0;
  const hasPre = pre > 0;
  const hasPost = flags.postclass || post != null;

  // Trial 7 sesi gratis → prompt lanjut/berhenti setelah sesi 7.
  const router = useRouter();
  const trial = data?.trial ?? null;
  const trialDone = Number(trial?.sessions_delivered ?? 0);
  const [showDecision, setShowDecision] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [starting, setStarting] = useState(false);
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"dark" | "green" | "red">("dark");
  const show = (m: string, t: "dark" | "green" | "red" = "dark") => {
    setToast(m);
    setToastTone(t);
    window.setTimeout(() => setToast(""), 3500);
  };
  const reloadMe = async () => {
    try {
      const r = await fetch("/api/student/me");
      const j = await r.json();
      if (j.ok) setData(j as MeData);
    } catch { /* abaikan */ }
  };
  const startTrial = async () => {
    setStarting(true);
    try {
      const r = await fetch("/api/trial", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const j = await r.json();
      if (j.ok) {
        show(j.existing ? "Trial aktif ditemukan — lanjutkan sesimu." : `Trial dimulai (${j.trial_id}). Selamat belajar!`, "green");
        await reloadMe();
      } else {
        show("Gagal memulai trial.", "red");
      }
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setStarting(false);
    }
  };
  const decide = async (action: "lanjut" | "berhenti") => {
    if (!trial) return;
    setDeciding(true);
    try {
      const r = await fetch("/api/trial", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trial_id: trial.trial_id, action, method: "QRIS" }),
      });
      const j = await r.json();
      if (!j.ok) {
        show(typeof j.error === "string" ? j.error : "Gagal menyimpan keputusan.", "red");
        return;
      }
      if (action === "berhenti") {
        show("Trial ditutup. Terima kasih sudah mencoba!", "dark");
        setShowDecision(false);
        await reloadMe();
        return;
      }
      if (j.already === "active") {
        show("Kamu sudah aktif di Kelas Kids — membuka kelas…", "green");
        router.push("/student/kelas");
        return;
      }
      const sidQ = encodeURIComponent(sid);
      const progQ = encodeURIComponent(String(j.program ?? "Little Speakers (Kids)"));
      const nomQ = encodeURIComponent(String(j.nominal ?? 50000));
      router.push(`/bayar?studentId=${sidQ}&program=${progQ}&nominal=${nomQ}&method=QRIS`);
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setDeciding(false);
    }
  };

  const tasks = useMemo(
    () => [
      {
        id: "placement",
        icon: ClipboardList,
        title: "Placement Check 0–50",
        sub: `${clsName} • ${guru}`,
        kind: "Task" as const,
        done: hasPlacement,
        href: hasPlacement ? "/student/progress" : "/daftar",
        cta: hasPlacement ? "Lihat Skor" : "Kerjakan",
      },
      {
        id: "pre",
        icon: FileText,
        title: "Pre-Check recount 0–10",
        sub: `${clsName} • Tulis 4–6 kalimat`,
        kind: "Theory" as const,
        done: hasPre,
        href: hasPre ? "/student/progress" : "/daftar",
        cta: hasPre ? `Skor ${pre}` : "Kerjakan",
      },
      {
        id: "meet",
        icon: Video,
        title: "Join live session",
        sub: jadwal,
        kind: "Task" as const,
        done: false,
        href: "/student/kelas",
        cta: meet ? "Join Meet" : "Cek Link",
      },
      {
        id: "post",
        icon: FileText,
        title: "Post-Check 0–10 + minat",
        sub: `${clsName} • Setelah sesi`,
        kind: "Theory" as const,
        done: hasPost,
        href: "/student/progress",
        cta: hasPost ? "Terkirim" : "Isi Post",
      },
      {
        id: "gain",
        icon: TrendingUp,
        title: "Progress Test & Gain",
        sub: `Gain ${gain != null ? `+${gain}` : "—"} • ${fit.replace("_", " ")}`,
        kind: "Theory" as const,
        done: gain != null && gain > 0,
        href: "/student/progress",
        cta: "Lihat Progres",
      },
    ],
    [clsName, guru, jadwal, meet, hasPlacement, hasPre, hasPost, pre, gain, fit]
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(q.trim().toLowerCase())
  );

  const sessionDays = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) {
      const [y, m, d] = String(s.tanggal).slice(0, 10).split("-").map(Number);
      if (y && m && d) set.add(dayKey(y, m - 1, d));
    }
    return set;
  }, [sessions]);

  const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const upcoming = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)))
        .filter((s) => String(s.tanggal).slice(0, 10) >= todayStr.slice(0, 10))
        .slice(0, 3),
    [sessions, todayStr]
  );

  // Grid kalender (Senin dulu, hari bulan lalu diredupkan seperti referensi)
  const cells = useMemo(() => {
    const first = (new Date(cal.y, cal.m, 1).getDay() + 6) % 7;
    const total = new Date(cal.y, cal.m + 1, 0).getDate();
    const prevTotal = new Date(cal.y, cal.m, 0).getDate();
    const out: Array<{ d: number; muted: boolean; key: string }> = [];
    for (let i = first - 1; i >= 0; i--) {
      const d = prevTotal - i;
      const pm = cal.m === 0 ? 11 : cal.m - 1;
      const py = cal.m === 0 ? cal.y - 1 : cal.y;
      out.push({ d, muted: true, key: dayKey(py, pm, d) });
    }
    for (let d = 1; d <= total; d++) out.push({ d, muted: false, key: dayKey(cal.y, cal.m, d) });
    return out;
  }, [cal]);

  if (!data) return <p className="text-sm text-ink/60">Memuat data portal…</p>;

  const cards = [
    {
      bg: "bg-emerald-50",
      iconBg: "bg-white text-emerald-600",
      icon: BookOpen,
      title: clsName.length > 26 ? `${clsName.slice(0, 26)}…` : clsName,
      sub: classId ? `${sisa != null ? `${sisa} sesi tersisa` : jadwal}` : "Menunggu matching",
      cta: "Buka Kelas",
      href: "/student/kelas",
    },
    {
      bg: "bg-sand-soft",
      iconBg: "bg-white text-sand-deep",
      icon: CalendarDays,
      title: memStatus || "Trial 7 Sesi",
      sub: sisa != null ? `${sisa} sesi • ${getStr(mem, "expires_at").slice(0, 10) || "aktif"}` : "6 belajar + 1 progress test",
      cta: "Lihat Jadwal",
      href: "/student/kelas",
    },
    {
      bg: "bg-indigo-50",
      iconBg: "bg-white text-indigo-500",
      icon: TrendingUp,
      title: gain != null ? `Gain +${gain}` : "Belum ada gain",
      sub: `Placement ${placement}/50 • Pre ${pre}/10`,
      cta: "Lihat Progres",
      href: "/student/progress",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Bar atas ala referensi: search + profil */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for anything…"
            aria-label="Cari tugas"
            className="w-full rounded-full border-0 bg-ivory py-2.5 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-sand lg:bg-ivory"
          />
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-sand">
          {(name.charAt(0) || "K").toUpperCase()}
        </span>
        <span className="hidden items-center gap-0.5 text-sm font-bold text-ink/70 sm:flex">
          {name.split(" ")[0]} <ChevronDown size={14} />
        </span>
      </div>

      {/* Banner trial 7 sesi gratis */}
      {(!trial || trial.status === "STARTED") && (
        <div className="flex flex-col gap-3 rounded-2xl border border-sand/40 bg-sand-soft p-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sand-deep">
            <Gift size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-ink">
              {trial ? `Trial gratis: sesi ${trialDone} dari 7 ${trial.trial_id ? `• ${trial.trial_id}` : ""}` : "Belum ikut trial? Coba 7 sesi gratis dulu."}
            </p>
            {trial ? (
              <>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/70">
                  <div className="h-full rounded-full bg-sand-deep" style={{ width: `${Math.round((trialDone / 7) * 100)}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-ink/60">6 sesi belajar + Sesi 7 Progress Test. Selesai 7/7 → pilih lanjut ke Kelas Kids atau berhenti.</p>
              </>
            ) : (
              <p className="mt-1 text-[11px] text-ink/60">6 sesi belajar + 1 Progress Test, Rp 0. Guru menandai tiap sesi selesai.</p>
            )}
          </div>
          {!trial ? (
            <Button onClick={() => void startTrial()} disabled={starting} className="shrink-0">
              {starting ? "Memulai…" : "Mulai Trial Gratis"}
            </Button>
          ) : trial.status === "STARTED" && trialDone >= 7 ? (
            <Button onClick={() => setShowDecision(true)} className="shrink-0">
              Lihat Hasil Trial
            </Button>
          ) : (
            <Link href="/student/kelas" className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory hover:bg-navy">
              Buka Kelasku
            </Link>
          )}
        </div>
      )}
      {trial?.status === "COMPLETED" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600">
            <Gift size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-ink">Selamat! 7 sesi gratis selesai 🎉</p>
            <p className="mt-1 text-[11px] text-ink/60">Mau lanjut ke Kelas Kids berbayar atau berhenti di sini?</p>
          </div>
          <Button onClick={() => setShowDecision(true)} className="shrink-0">
            Pilih: Lanjut / Berhenti
          </Button>
        </div>
      )}

      <Modal open={showDecision} onClose={() => setShowDecision(false)} title="Lanjut ke Kelas Kids?">
        <p className="text-sm leading-relaxed text-ink/70">
          Trial 7 sesi (<b>{trial?.trial_id}</b>) selesai. Kalau lanjut, sistem buatkan tagihan Kelas Kids
          (<b>Little Speakers</b>) dan kamu diarahkan ke halaman pembayaran. Kalau berhenti, trial ditutup.
        </p>
        <div className="mt-4 grid gap-2">
          <Button onClick={() => void decide("lanjut")} disabled={deciding}>
            {deciding ? "Memproses…" : "Ya, Lanjut → Bayar Kelas Kids"}
          </Button>
          <Button variant="secondary" onClick={() => void decide("berhenti")} disabled={deciding}>
            Tidak, Berhenti
          </Button>
        </div>
      </Modal>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Kolom utama */}
        <div className="min-w-0">
          <h1 className="font-display text-xl font-extrabold text-ink">
            My Classes<span className="text-sand-deep">.</span>
          </h1>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {cards.map((c) => (
              <div key={c.cta} className={`rounded-2xl ${c.bg} p-4 text-center`}>
                <span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl ${c.iconBg}`}>
                  <c.icon size={20} />
                </span>
                <p className="mt-2 truncate text-sm font-extrabold text-ink" title={c.title}>{c.title}</p>
                <p className="truncate text-[11px] text-ink/55" title={c.sub}>{c.sub}</p>
                <Link
                  href={c.href}
                  className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-full bg-white px-4 py-1.5 text-xs font-bold text-ink shadow-sm hover:shadow"
                >
                  {c.cta}
                </Link>
              </div>
            ))}
          </div>

          <h2 className="font-display mt-6 text-xl font-extrabold text-ink">
            Today Tasks<span className="text-sand-deep">.</span>
          </h2>
          <div className="mt-2 flex gap-5 border-b border-sand/40 text-sm" role="tablist" aria-label="Tugas">
            {(["tugas", "jadwal", "info"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`pb-2 font-bold capitalize ${
                  tab === t ? "border-b-2 border-sand-deep text-ink" : "text-ink/40 hover:text-ink"
                }`}
              >
                {t === "tugas" ? "To-do" : t === "jadwal" ? "Jadwal" : "Info"}
              </button>
            ))}
          </div>

          {tab === "tugas" && (
            <ul className="mt-2 divide-y divide-ivory">
              {filteredTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.done ? "bg-emerald-50 text-emerald-600" : "bg-sand-soft/60 text-sand-deep"}`}>
                    {t.done ? <CircleCheck size={17} /> : <t.icon size={17} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">{t.title}</span>
                    <span className="block truncate text-[11px] text-ink/50">{t.sub}</span>
                  </span>
                  <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline ${t.kind === "Task" ? "bg-orange-100 text-orange-700" : "bg-ivory text-ink/55"}`}>
                    {t.kind === "Task" ? "• Task" : "• Theory"}
                  </span>
                  <Link
                    href={t.href}
                    className={`inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-bold ${
                      t.done ? "bg-ivory text-ink/55 hover:text-ink" : "bg-orange-600 text-white hover:bg-orange-700"
                    }`}
                  >
                    {t.done && t.id !== "meet" ? "Mark as Done" : t.cta}
                  </Link>
                </li>
              ))}
              {filteredTasks.length === 0 && (
                <li className="py-6 text-center text-sm text-ink/50">Tidak ada tugas yang cocok.</li>
              )}
            </ul>
          )}

          {tab === "jadwal" && (
            <ul className="mt-2 divide-y divide-ivory">
              {sessions.length === 0 && (
                <li className="py-6 text-center text-sm text-ink/50">
                  Belum ada sesi terjadwal — link Meet dibagikan setelah class matching (3–5 siswa).
                </li>
              )}
              {sessions.map((s) => (
                <li key={s.session_id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy/5 font-extrabold text-navy">
                    {s.seq}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">Sesi {s.seq} • {fmtTanggal(String(s.tanggal).slice(0, 10))}</span>
                    <span className="block truncate text-[11px] text-ink/50"><code>{s.session_id}</code></span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${s.status === "DONE" ? "bg-emerald-100 text-emerald-700" : "bg-ivory text-ink/55"}`}>
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {tab === "info" && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between rounded-xl bg-ivory px-4 py-2.5">
                <span className="text-ink/55">Kelas</span><b className="text-right text-ink">{clsName}</b>
              </div>
              <div className="flex justify-between rounded-xl bg-ivory px-4 py-2.5">
                <span className="text-ink/55">Jadwal</span><b className="text-right text-ink">{jadwal}</b>
              </div>
              <div className="flex justify-between rounded-xl bg-ivory px-4 py-2.5">
                <span className="text-ink/55">Pengajar</span><b className="text-ink">{guru}</b>
              </div>
              <div className="flex justify-between rounded-xl bg-ivory px-4 py-2.5">
                <span className="text-ink/55">Google Meet</span>
                {meet ? (
                  <a href={meet} target="_blank" rel="noreferrer" className="font-bold text-navy underline">Join Meet</a>
                ) : (
                  <b className="text-ink/50">Menunggu matching</b>
                )}
              </div>
              <p className="px-1 text-[11px] text-ink/45">Student ID {sid} • Jangan bagikan link ke luar kelas.</p>
            </div>
          )}
        </div>

        {/* Kolom kanan: kalender + Upcoming */}
        <div className="min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink">{BULAN[cal.m]} {cal.y}</h2>
            <span className="flex gap-1">
              <button
                aria-label="Bulan sebelumnya"
                onClick={() => setCal((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}
                className="rounded-full p-2 text-ink/50 hover:bg-ivory hover:text-ink"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                aria-label="Bulan berikutnya"
                onClick={() => setCal((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}
                className="rounded-full p-2 text-ink/50 hover:bg-ivory hover:text-ink"
              >
                <ChevronRight size={16} />
              </button>
            </span>
          </div>
          <div className="mt-2 grid grid-cols-7 text-center text-[10px] font-bold text-ink/40">
            {HARI.map((h) => <span key={h} className="py-1">{h}</span>)}
          </div>
          <div className="grid grid-cols-7 text-center text-xs">
            {cells.map((c) => {
              const isToday = c.key === todayStr && !c.muted;
              const hasSes = sessionDays.has(c.key);
              const isSel = selected === c.key;
              return (
                <button
                  key={c.key + c.d}
                  onClick={() => setSelected(c.key)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full font-semibold transition ${
                    c.muted ? "text-ink/25" : isToday || (hasSes && !c.muted) ? "" : "text-ink/70 hover:bg-ivory"
                  } ${isSel ? "ring-2 ring-navy" : ""}`}
                  aria-label={`${c.d} ${BULAN[cal.m]}${hasSes ? " (ada sesi)" : ""}`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      isToday ? "bg-sand-deep text-white" : hasSes && !c.muted ? "bg-orange-600 text-white" : ""
                    }`}
                  >
                    {c.d}
                  </span>
                </button>
              );
            })}
          </div>

          <h2 className="font-display mt-6 text-lg font-extrabold text-ink">
            Upcoming<span className="text-sand-deep">.</span>
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-2 rounded-2xl bg-ivory p-4 text-xs leading-relaxed text-ink/60">
              Belum ada jadwal mendatang. Tim akademik akan menginfokan via WhatsApp setelah class matching.
            </p>
          ) : (
            <ul className="mt-2 space-y-4">
              {upcoming.map((s, i) => (
                <li key={s.session_id} className="flex gap-3">
                  <span className="flex flex-col items-center">
                    <span className={`mt-1.5 h-2 w-2 rounded-full ${i === 0 ? "bg-orange-600" : "border border-ink/25 bg-transparent"}`} />
                    {i < upcoming.length - 1 && <span className="w-px flex-1 bg-sand/40" />}
                  </span>
                  <span className="flex-1 pb-1">
                    <span className="flex items-start justify-between gap-2">
                      <b className="text-sm text-ink">Live Session S{s.seq}</b>
                      <span className="text-right text-[11px] font-bold text-orange-700">{fmtTanggal(String(s.tanggal).slice(0, 10))}<br /><span className="font-semibold text-ink/50">60 Minutes</span></span>
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink/55">{clsName} • {guru}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/student/kelas" className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-orange-700 hover:underline">
            View all upcoming <ArrowRight size={13} />
          </Link>
        </div>
      </div>
      <Toast message={toast} tone={toastTone} />
    </div>
  );
}
