"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { MOCK_CLASSES, MOCK_STUDENTS, type CurrentStatus } from "@/lib/mock";
import { Badge, Button, Card, DataTable, Field, Input, Modal, Select, Toast } from "../components/ui";

const STATUS_FILTERS: Array<"ALL" | CurrentStatus> = ["ALL", "REGISTERED", "ASSIGNED", "COMPLETED"];

function fitTone(fit: string): "green" | "amber" | "slate" {
  if (fit === "A2_CONFIRMED") return "green";
  if (fit === "PLACEMENT_PENDING") return "amber";
  return "slate";
}

// ---------- Tipe Kelas (Step 1-4) ----------
interface ClassItem {
  id: string;
  nama: string;
  level: string;
  kategori: string;
  jadwal: string;
  guru: string;
  teacher_name?: string;
  harga: number;
  kuota: number;
  sesi_count: number;
  class_status: string;
  deskripsi?: string;
  meet_link?: string;
  filled: number;
  remaining: number;
  occupancy_pct: number;
}

interface ClassDetail extends ClassItem {
  members: Array<{ enrollment_id: string; student_id: string; status: string; sisa: number }>;
  students: Array<{ student_id: string; nama?: string; full_name?: string; email?: string; wa?: string }>;
  sessions: Array<{ session_id: string; seq: number; tanggal: string; status: string }>;
}

function mockToClass(): ClassItem[] {
  return MOCK_CLASSES.map((c) => {
    const m = String(c.slots).match(/(\d+)\s*\/\s*(\d+)/);
    const filled = m ? Number(m[1]) : 0;
    const kuota = m ? Number(m[2]) : 5;
    return {
      id: c.classId,
      nama: c.name,
      level: "PUB",
      kategori: "PUBLIC",
      jadwal: c.schedule,
      guru: c.teacher,
      teacher_name: c.teacher,
      harga: 0,
      kuota,
      sesi_count: 4,
      class_status: c.status,
      deskripsi: "",
      meet_link: "",
      filled,
      remaining: Math.max(0, kuota - filled),
      occupancy_pct: kuota > 0 ? Math.round((filled / kuota) * 100) : 0,
    };
  });
}

function statusTone(s: string): "green" | "amber" | "slate" | "red" | "blue" {
  if (s === "OPEN") return "green";
  if (s === "FULL") return "red";
  if (s === "COMING_SOON") return "amber";
  if (s === "DRAFT") return "slate";
  return "blue";
}

const KELAS_STATUS = ["ALL", "DRAFT", "OPEN", "FULL", "COMING_SOON", "CLOSED"] as const;
const KELAS_KATEGORI = ["ALL", "PUBLIC", "CORE"] as const;
const LEVELS = ["A1", "A2", "B1", "PUB", "KIDS", "TEEN"] as const;

const emptyForm = {
  nama: "",
  level: "PUB",
  kategori: "PUBLIC",
  jadwal: "",
  guru: "",
  harga: "50000",
  kuota: "50",
  sesi_count: "4",
  class_status: "DRAFT",
  deskripsi: "",
  meet_link: "",
};

export default function DashboardClient() {
  const [tab, setTab] = useState<"siswa" | "kelas">("kelas");

  // ----- Tab Siswa (tetap seperti semula) -----
  const [status, setStatus] = useState<"ALL" | CurrentStatus>("ALL");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_STUDENTS.filter((s) => {
      if (status !== "ALL" && s.status !== status) return false;
      if (!q) return true;
      return s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });
  }, [status, query]);

  // ----- Tab Kelas: Step 1 LIST -----
  const [kelas, setKelas] = useState<ClassItem[]>(mockToClass());
  const [kelasSource, setKelasSource] = useState("mock");
  const [kelasLoading, setKelasLoading] = useState(false);
  const [kQuery, setKQuery] = useState("");
  const [appliedKQ, setAppliedKQ] = useState("");
  const [kStatus, setKStatus] = useState<string>("ALL");
  const [kKategori, setKKategori] = useState<string>("ALL");
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"dark" | "green" | "red">("dark");

  const show = (m: string, tone: "dark" | "green" | "red" = "dark") => {
    setToast(m);
    setToastTone(tone);
    window.setTimeout(() => setToast(""), 3200);
  };

  const loadKelas = useCallback(async () => {
    setKelasLoading(true);
    try {
      const p = new URLSearchParams();
      if (appliedKQ.trim()) p.set("q", appliedKQ.trim());
      if (kStatus !== "ALL") p.set("status", kStatus);
      if (kKategori !== "ALL") p.set("kategori", kKategori);
      const r = await fetch(`/api/admin/classes?${p.toString()}`);
      const j = await r.json();
      if (j.ok && Array.isArray(j.rows)) {
        setKelas(j.rows as ClassItem[]);
        setKelasSource(j.source ?? "db");
      } else if (r.status === 403) {
        // Preview publik tanpa login -> fallback mock.
        setKelas(mockToClass());
        setKelasSource("mock (login admin untuk live)");
      } else {
        setKelas([]);
        setKelasSource(j.source ?? "?");
      }
    } catch {
      setKelas(mockToClass());
      setKelasSource("mock (offline)");
    } finally {
      setKelasLoading(false);
    }
  }, [appliedKQ, kStatus, kKategori]);

  useEffect(() => {
    if (tab !== "kelas") return;
    let live = true;
    (async () => {
      setKelasLoading(true);
      try {
        const p = new URLSearchParams();
        if (appliedKQ.trim()) p.set("q", appliedKQ.trim());
        if (kStatus !== "ALL") p.set("status", kStatus);
        if (kKategori !== "ALL") p.set("kategori", kKategori);
        const r = await fetch(`/api/admin/classes?${p.toString()}`);
        const j = await r.json();
        if (!live) return;
        if (j.ok && Array.isArray(j.rows)) {
          setKelas(j.rows as ClassItem[]);
          setKelasSource(j.source ?? "db");
        } else if (r.status === 403) {
          setKelas(mockToClass());
          setKelasSource("mock (login admin untuk live)");
        } else {
          setKelas([]);
          setKelasSource(j.source ?? "?");
        }
      } catch {
        if (live) {
          setKelas(mockToClass());
          setKelasSource("mock (offline)");
        }
      } finally {
        if (live) setKelasLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [tab, appliedKQ, kStatus, kKategori]);

  const kStats = useMemo(() => {
    const total = kelas.length;
    const filled = kelas.reduce((a, c) => a + (c.filled ?? 0), 0);
    const kapasitas = kelas.reduce((a, c) => a + (c.kuota ?? 0), 0);
    const open = kelas.filter((c) => c.class_status === "OPEN").length;
    const avg = kapasitas > 0 ? Math.round((filled / kapasitas) * 100) : 0;
    return { total, filled, kapasitas, open, avg };
  }, [kelas]);

  const exportKelasCsv = () => {
    const head = ["ID", "Nama", "Level", "Kategori", "Jadwal", "Guru", "Harga", "Terisi", "Kuota", "Okupansi%", "Status"];
    const lines = kelas.map((c) =>
      [c.id, c.nama, c.level, c.kategori, c.jadwal, c.guru || c.teacher_name, c.harga, c.filled, c.kuota, c.occupancy_pct, c.class_status]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "01_CONTENT_CALENDAR.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ----- Step 2 TAMBAH + Step 3 EDIT -----
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setShowCreate(true);
  };

  const openEdit = (c: ClassItem) => {
    setEditing(c);
    setForm({
      nama: c.nama,
      level: c.level || "PUB",
      kategori: c.kategori || "PUBLIC",
      jadwal: c.jadwal,
      guru: c.guru || c.teacher_name || "",
      harga: String(c.harga ?? 0),
      kuota: String(c.kuota ?? 50),
      sesi_count: String(c.sesi_count ?? 4),
      class_status: c.class_status || "DRAFT",
      deskripsi: c.deskripsi || "",
      meet_link: c.meet_link || "",
    });
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          level: form.level,
          kategori: form.kategori,
          jadwal: form.jadwal,
          guru: form.guru,
          harga: Number(form.harga),
          kuota: Number(form.kuota),
          sesi_count: Number(form.sesi_count),
          class_status: form.class_status,
          deskripsi: form.deskripsi,
          meet_link: form.meet_link,
        }),
      });
      const j = await r.json();
      if (j.ok) {
        show(`Kelas ${j.id} dibuat.`, "green");
        setShowCreate(false);
        await loadKelas();
      } else if (r.status === 403) {
        show("Login admin dulu untuk tambah kelas (/masuk).", "red");
      } else {
        show(j.error || j.detail?.join("; ") || "Gagal membuat kelas.", "red");
      }
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const r = await fetch("/api/admin/classes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          nama: form.nama,
          level: form.level,
          kategori: form.kategori,
          jadwal: form.jadwal,
          guru: form.guru,
          harga: Number(form.harga),
          kuota: Number(form.kuota),
          sesi_count: Number(form.sesi_count),
          class_status: form.class_status,
          deskripsi: form.deskripsi,
          meet_link: form.meet_link,
        }),
      });
      const j = await r.json();
      if (j.ok) {
        show(`Kelas ${editing.id} diperbarui.`, "green");
        setEditing(null);
        await loadKelas();
      } else if (r.status === 403) {
        show("Login admin dulu untuk edit kelas.", "red");
      } else {
        show(j.error || "Gagal menyimpan.", "red");
      }
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setSaving(false);
    }
  };

  // ----- Step 3 DETAIL -----
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const r = await fetch(`/api/admin/classes?id=${encodeURIComponent(id)}`);
      const j = await r.json();
      if (j.ok && j.class) {
        setDetail({
          ...(j.class as ClassItem),
          filled: j.occupancy?.filled ?? 0,
          remaining: Math.max(0, Number((j.class as Record<string, unknown>).kuota ?? 0) - (j.occupancy?.filled ?? 0)),
          occupancy_pct: 0,
          members: j.members ?? [],
          students: j.students ?? [],
          sessions: j.sessions ?? [],
        });
      } else if (r.status === 403) {
        // Fallback mock: tampilkan info dasar tanpa siswa.
        const m = kelas.find((c) => c.id === id);
        if (m) setDetail({ ...m, members: [], students: [], sessions: [] });
        else show("Butuh login admin untuk detail live.", "red");
      } else {
        show("Detail tidak ditemukan.", "red");
      }
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setDetailLoading(false);
    }
  };

  // ----- Step 4 HAPUS -----
  const [deleting, setDeleting] = useState<ClassItem | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      const r = await fetch("/api/admin/classes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleting.id }),
      });
      const j = await r.json();
      if (j.ok) {
        show(`Kelas ${deleting.id} dihapus.`, "green");
        setDeleting(null);
        await loadKelas();
      } else if (r.status === 403) {
        show("Login admin dulu untuk hapus kelas.", "red");
      } else {
        show(j.error || "Gagal menghapus.", "red");
      }
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setDeletingBusy(false);
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      {/* Tab navigasi */}
      <div className="flex gap-2" role="tablist" aria-label="Dashboard tabs">
        {(["kelas", "siswa"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-[44px] flex-1 rounded-xl border px-4 py-2.5 text-sm font-extrabold sm:flex-none sm:px-8 ${
              tab === t ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70 hover:border-sand-deep"
            }`}
          >
            {t === "kelas" ? "Kelas" : "Siswa"}
          </button>
        ))}
      </div>

      {tab === "siswa" ? (
        <>
          <Card className="rounded-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by Name / Email…"
                  className="pl-10"
                  aria-label="Cari nama atau email"
                />
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter status">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={status === f}
                    onClick={() => setStatus(f)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold ${status === f ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70 hover:border-sand-deep"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-ink/60">
              Menampilkan <b>{rows.length}</b> dari {MOCK_STUDENTS.length} siswa • Gain = Post − Pre (0–10) • Placement 0–50
            </p>
          </Card>

          <DataTable
            columns={["Student ID", "Full Name", "Placement", "A2 Fit", "Class ID", "Attendance", "Gain", "Status"]}
            rows={rows.map((s) => [
              <code key="id" className="rounded bg-ivory px-2 py-0.5 text-xs font-bold">{s.studentId}</code>,
              <span key="n"><b>{s.fullName}</b><br /><span className="text-xs text-ink/60">{s.email}</span></span>,
              <b key="p">{s.placementScore ?? "—"}</b>,
              <Badge key="f" tone={fitTone(s.a2Fit)}>{s.a2Fit}</Badge>,
              <code key="c" className="rounded bg-ivory text-navy">{s.classId}</code>,
              s.attendance ? <Badge key="a" tone={s.attendance === "ATTENDED" ? "green" : "red"}>{s.attendance}</Badge> : <span key="a" className="text-ink/40">—</span>,
              <b key="g" className={s.gainScore != null && s.gainScore > 0 ? "text-emerald-700" : ""}>
                {s.gainScore != null ? `+${s.gainScore}` : "—"}
              </b>,
              <Badge key="s" tone="blue">{s.status}</Badge>,
            ])}
          />
        </>
      ) : (
        <>
          {/* Step 1: Statistik */}
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            {[
              ["Total kelas", kStats.total],
              ["Kelas OPEN", kStats.open],
              ["Terisi / Kapasitas", `${kStats.filled}/${kStats.kapasitas}`],
              ["Okupansi rata-rata", `${kStats.avg}%`],
            ].map(([k, v]) => (
              <Card key={k as string} className="rounded-xl px-2 py-3">
                <p className="text-[11px] font-bold text-ink/60">{k}</p>
                <p className="font-display text-xl font-extrabold text-ink sm:text-2xl">{v}</p>
              </Card>
            ))}
          </div>

          <Card className="rounded-xl">
            <form
              className="flex flex-col gap-3 lg:flex-row lg:items-center"
              onSubmit={(e) => {
                e.preventDefault();
                setAppliedKQ(kQuery);
              }}
            >
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                <Input
                  value={kQuery}
                  onChange={(e) => setKQuery(e.target.value)}
                  placeholder="Cari ID / nama kelas / guru…"
                  className="pl-10"
                  aria-label="Cari kelas"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-ink px-4 py-2 text-sm font-bold text-ivory hover:bg-navy"
                >
                  Cari
                </button>
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-sand px-4 py-2 text-sm font-bold text-ink hover:bg-sand-deep"
                >
                  <Plus size={16} /> Tambah Kelas
                </button>
                <button
                  type="button"
                  onClick={exportKelasCsv}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-sand bg-paper px-4 py-2 text-sm font-bold text-ink hover:border-ink"
                >
                  <Download size={16} /> CSV
                </button>
              </div>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-ink/50">STATUS:</span>
              {KELAS_STATUS.map((f) => (
                <button
                  key={f}
                  onClick={() => setKStatus(f)}
                  aria-pressed={kStatus === f}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${kStatus === f ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70 hover:border-sand-deep"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-ink/50">KATEGORI:</span>
              {KELAS_KATEGORI.map((f) => (
                <button
                  key={f}
                  onClick={() => setKKategori(f)}
                  aria-pressed={kKategori === f}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${kKategori === f ? "border-navy bg-navy text-ivory" : "border-sand/40 bg-paper text-ink/70 hover:border-sand-deep"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink/60">
              Sumber: <b>{kelasSource}</b> • Menampilkan <b>{kelas.length}</b> kelas • Tambah/Edit/Hapus butuh login admin.
            </p>
          </Card>

          {kelasLoading ? (
            <p className="text-sm text-ink/60">Memuat kelas…</p>
          ) : (
            <DataTable
              columns={["ID", "Kelas", "Jadwal", "Guru", "Harga", "Kuota", "Status", "Aksi"]}
              rows={kelas.map((c) => [
                <code key="id" className="rounded bg-ivory px-2 py-0.5 text-xs font-bold">{c.id}</code>,
                <span key="n">
                  <b>{c.nama}</b>
                  <br />
                  <span className="text-xs text-ink/60">{c.level} • {c.kategori} • {c.sesi_count} sesi</span>
                </span>,
                <span key="j" className="text-xs text-ink/70">{c.jadwal}</span>,
                <span key="g" className="text-xs">{c.guru || c.teacher_name || "—"}</span>,
                <b key="h" className="whitespace-nowrap">Rp {Number(c.harga ?? 0).toLocaleString("id-ID")}</b>,
                <span key="k" className="block min-w-[130px]">
                  <span className="text-xs font-bold">{c.filled}/{c.kuota} • {c.occupancy_pct}%</span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-ivory">
                    <span
                      className={`block h-full rounded-full ${c.occupancy_pct >= 100 ? "bg-rose-500" : c.occupancy_pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, c.occupancy_pct)}%` }}
                    />
                  </span>
                </span>,
                <Badge key="s" tone={statusTone(c.class_status)}>{c.class_status}</Badge>,
                <span key="a" className="flex flex-wrap gap-1">
                  <button onClick={() => openDetail(c.id)} className="rounded-lg border border-sand px-2.5 py-1.5 text-xs font-bold text-navy hover:border-navy">Detail</button>
                  <button onClick={() => openEdit(c)} className="rounded-lg bg-ink px-2.5 py-1.5 text-xs font-bold text-ivory hover:bg-navy">Edit</button>
                  <button onClick={() => setDeleting(c)} className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50">Hapus</button>
                </span>,
              ])}
            />
          )}

          <p className="text-xs text-ink/60">
            Data live via Supabase (<code>classes</code> + <code>class_membership</code>) & Google Sheets mirror — kelola via{" "}
            <a href="/core" className="font-bold text-navy">/core</a>. Tanpa login, tampil mock preview.
          </p>
        </>
      )}

      {/* Step 2: Modal Tambah */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tambah Kelas Baru (Step 2)">
        <form onSubmit={submitCreate} className="grid gap-3">
          <Field label="Nama kelas">
            <Input value={form.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Public Class - Pintu Masuk KOLASE" required minLength={3} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level">
              <Select value={form.level} onChange={(e) => set("level", e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Kategori">
              <Select value={form.kategori} onChange={(e) => set("kategori", e.target.value)}>
                <option value="PUBLIC">PUBLIC</option>
                <option value="CORE">CORE</option>
              </Select>
            </Field>
          </div>
          <Field label="Jadwal">
            <Input value={form.jadwal} onChange={(e) => set("jadwal", e.target.value)} placeholder="Sabtu 10:00 WIB (4 sesi @60 mnt)" required minLength={3} />
          </Field>
          <Field label="Guru">
            <Input value={form.guru} onChange={(e) => set("guru", e.target.value)} placeholder="Galang" required minLength={2} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Harga (Rp)">
              <Input type="number" min={0} max={100000000} value={form.harga} onChange={(e) => set("harga", e.target.value)} required />
            </Field>
            <Field label="Kuota (1-50)">
              <Input type="number" min={1} max={50} value={form.kuota} onChange={(e) => set("kuota", e.target.value)} required />
            </Field>
            <Field label="Sesi">
              <Input type="number" min={1} max={45} value={form.sesi_count} onChange={(e) => set("sesi_count", e.target.value)} />
            </Field>
          </div>
          <Field label="Status">
            <Select value={form.class_status} onChange={(e) => set("class_status", e.target.value)}>
              <option value="DRAFT">DRAFT</option>
              <option value="OPEN">OPEN</option>
              <option value="FULL">FULL</option>
              <option value="COMING_SOON">COMING_SOON</option>
              <option value="CLOSED">CLOSED</option>
            </Select>
          </Field>
          <Field label="Deskripsi" hint="Opsional, max 2000 karakter">
            <Input value={form.deskripsi} onChange={(e) => set("deskripsi", e.target.value)} placeholder="4 sesi large-group…" />
          </Field>
          <Field label="Meet link" hint="Opsional">
            <Input value={form.meet_link} onChange={(e) => set("meet_link", e.target.value)} placeholder="https://meet.google.com/…" />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan…" : "Simpan Kelas"}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Batal</Button>
          </div>
        </form>
      </Modal>

      {/* Step 3: Modal Edit */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={`Edit Kelas ${editing?.id ?? ""} (Step 3)`}>
        <form onSubmit={submitEdit} className="grid gap-3">
          <Field label="Nama kelas">
            <Input value={form.nama} onChange={(e) => set("nama", e.target.value)} required minLength={3} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level">
              <Select value={form.level} onChange={(e) => set("level", e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Kategori">
              <Select value={form.kategori} onChange={(e) => set("kategori", e.target.value)}>
                <option value="PUBLIC">PUBLIC</option>
                <option value="CORE">CORE</option>
              </Select>
            </Field>
          </div>
          <Field label="Jadwal">
            <Input value={form.jadwal} onChange={(e) => set("jadwal", e.target.value)} required minLength={3} />
          </Field>
          <Field label="Guru">
            <Input value={form.guru} onChange={(e) => set("guru", e.target.value)} required minLength={2} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Harga (Rp)">
              <Input type="number" min={0} max={100000000} value={form.harga} onChange={(e) => set("harga", e.target.value)} required />
            </Field>
            <Field label="Kuota">
              <Input type="number" min={1} max={50} value={form.kuota} onChange={(e) => set("kuota", e.target.value)} required />
            </Field>
            <Field label="Sesi">
              <Input type="number" min={1} max={45} value={form.sesi_count} onChange={(e) => set("sesi_count", e.target.value)} />
            </Field>
          </div>
          <Field label="Status">
            <Select value={form.class_status} onChange={(e) => set("class_status", e.target.value)}>
              <option value="DRAFT">DRAFT</option>
              <option value="OPEN">OPEN</option>
              <option value="FULL">FULL</option>
              <option value="COMING_SOON">COMING_SOON</option>
              <option value="CLOSED">CLOSED</option>
            </Select>
          </Field>
          <Field label="Deskripsi">
            <Input value={form.deskripsi} onChange={(e) => set("deskripsi", e.target.value)} />
          </Field>
          <Field label="Meet link">
            <Input value={form.meet_link} onChange={(e) => set("meet_link", e.target.value)} />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Menyimpan…" : "Simpan Perubahan"}</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
          </div>
        </form>
      </Modal>

      {/* Step 3: Modal Detail */}
      <Modal open={detail !== null || detailLoading} onClose={() => setDetail(null)} title={`Detail Kelas ${detail?.id ?? ""}`}>
        {detailLoading && !detail ? (
          <p className="text-sm text-ink/60">Memuat detail…</p>
        ) : detail ? (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-display text-base font-extrabold text-ink">{detail.nama}</p>
              <p className="text-xs text-ink/60">{detail.id} • {detail.level} • {detail.kategori} • {detail.sesi_count} sesi</p>
              <p className="mt-1 text-ink/80">{detail.jadwal}</p>
              <p className="text-ink/70">Guru: <b>{detail.guru || detail.teacher_name}</b> • Rp {Number(detail.harga ?? 0).toLocaleString("id-ID")}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone={statusTone(detail.class_status)}>{detail.class_status}</Badge>
                <span className="text-xs font-bold">{detail.filled}/{detail.kuota} terisi</span>
              </div>
              {detail.deskripsi && <p className="mt-2 text-xs text-ink/70">{detail.deskripsi}</p>}
              {detail.meet_link && <a href={detail.meet_link} target="_blank" rel="noreferrer" className="text-xs font-bold text-navy underline">Buka Meet</a>}
            </div>
            <div>
              <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-navy/70">Siswa terdaftar ({detail.members.length})</p>
              {detail.members.length === 0 ? (
                <p className="text-xs text-ink/50">Belum ada siswa / butuh login admin untuk data live.</p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {detail.members.map((m) => {
                    const stu = detail.students.find((s) => String(s.student_id) === String(m.student_id));
                    return (
                      <div key={m.enrollment_id} className="flex items-center justify-between rounded-lg bg-ivory px-3 py-2 text-xs">
                        <span><b>{String(stu?.full_name ?? stu?.nama ?? m.student_id)}</b><br /><span className="text-ink/60">{m.student_id} • {m.enrollment_id}</span></span>
                        <Badge tone={m.status === "ACTIVE" ? "green" : "amber"}>{m.status} • {m.sisa}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-navy/70">Sesi ({detail.sessions.length})</p>
              {detail.sessions.length === 0 ? (
                <p className="text-xs text-ink/50">Belum ada sesi terjadwal.</p>
              ) : (
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {detail.sessions.map((s) => (
                    <div key={s.session_id} className="flex items-center justify-between rounded-lg bg-ivory px-3 py-1.5 text-xs">
                      <span>S{s.seq} • {String(s.tanggal).slice(0, 10)} • <code>{s.session_id}</code></span>
                      <Badge tone={s.status === "DONE" ? "green" : "slate"}>{s.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Step 4: Modal Hapus */}
      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title={`Hapus Kelas ${deleting?.id ?? ""}? (Step 4)`}>
        <p className="text-sm text-ink/70">
          <b>{deleting?.nama}</b> akan dihapus permanen. Kelas yang masih punya siswa aktif <b>tidak bisa</b> dihapus — pindahkan siswa dulu.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={confirmDelete}
            disabled={deletingBusy}
            className="min-h-[48px] flex-1 rounded-xl bg-rose-600 px-5 py-3 text-base font-bold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {deletingBusy ? "Menghapus…" : "Ya, Hapus"}
          </button>
          <Button variant="secondary" onClick={() => setDeleting(null)}>Batal</Button>
        </div>
      </Modal>

      <Toast message={toast} tone={toastTone} />
    </div>
  );
}
