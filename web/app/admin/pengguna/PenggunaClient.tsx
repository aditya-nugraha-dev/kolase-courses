"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Badge, Button, Card, DataTable, Input, Modal, Toast } from "../../components/ui";

interface TeacherRow {
  teacher_id: string;
  nama: string;
  email: string;
  wa: string;
  classes: Array<{ id: string; nama: string; status: string }>;
}

interface StudentRow {
  student_id: string;
  full_name?: string;
  nama?: string;
  email: string;
  wa: string;
  current_status: string;
  classes: Array<{ class_id: string; status: string; sisa: number }>;
  trial: string;
}

export default function PenggunaClient() {
  const [tab, setTab] = useState<"teacher" | "student">("teacher");
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [target, setTarget] = useState<{ type: "teacher" | "student"; id: string; nama: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"dark" | "green" | "red">("dark");

  const show = (m: string, t: "dark" | "green" | "red" = "dark") => {
    setToast(m);
    setToastTone(t);
    window.setTimeout(() => setToast(""), 3500);
  };

  const load = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (query.trim()) p.set("q", query.trim());
      const r = await fetch(`/api/admin/users?${p.toString()}`);
      const j = await r.json();
      if (j.ok) {
        setTeachers(Array.isArray(j.teachers) ? (j.teachers as TeacherRow[]) : []);
        setStudents(Array.isArray(j.students) ? (j.students as StudentRow[]) : []);
      } else {
        show("Hanya staff yang bisa membuka database.", "red");
      }
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!live) return;
      await load(appliedQ);
    })();
    return () => {
      live = false;
    };
  }, [appliedQ, load]);

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      const r = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: target.type, id: target.id }),
      });
      const j = await r.json();
      if (j.ok) {
        show(`${target.type === "teacher" ? "Teacher" : "Student"} ${target.id} dihapus permanen.`, "green");
        setTarget(null);
        await load(appliedQ);
      } else {
        show(typeof j.error === "string" ? j.error : "Gagal menghapus.", "red");
      }
    } catch {
      show("Jaringan gagal.", "red");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">DATABASE • STAFF ONLY</p>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">Teacher & Student</h1>
        <p className="mt-1 text-sm text-ink/70">
          Lihat teacher mengajar di kelas apa, student siapa saja yang masuk — plus hapus data permanen.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        {[
          ["Total teacher", teachers.length],
          ["Total student", students.length],
        ].map(([k, v]) => (
          <Card key={k as string} className="rounded-xl px-2 py-3">
            <p className="text-[11px] font-bold text-ink/60">{k}</p>
            <p className="font-display text-2xl font-extrabold text-ink">{v}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedQ(q);
          }}
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / email / ID…" className="pl-10" aria-label="Cari pengguna" />
          </div>
          <div className="flex gap-2">
            {(["teacher", "student"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`min-h-[44px] flex-1 rounded-xl border px-4 py-2 text-sm font-bold sm:flex-none sm:px-6 ${tab === t ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70"}`}
              >
                {t === "teacher" ? "Teacher" : "Student"}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {loading ? (
        <p className="text-sm text-ink/60">Memuat database…</p>
      ) : tab === "teacher" ? (
        <DataTable
          columns={["Teacher ID", "Nama & Kontak", "Mengajar di Kelas", "Aksi"]}
          rows={teachers.map((t) => [
            <code key="id" className="rounded bg-ivory px-2 py-0.5 text-xs font-bold">{t.teacher_id}</code>,
            <span key="n">
              <b>{t.nama}</b>
              <br />
              <span className="text-xs text-ink/60">{t.email}{t.wa ? ` • ${t.wa}` : ""}</span>
            </span>,
            t.classes.length === 0 ? (
              <span key="c" className="text-xs text-ink/40">Belum pegang kelas</span>
            ) : (
              <span key="c" className="flex flex-col gap-1">
                {t.classes.map((c) => (
                  <span key={c.id} className="text-xs">
                    <code className="rounded bg-ivory px-1.5 py-0.5 text-navy">{c.id}</code> {c.nama}
                  </span>
                ))}
              </span>
            ),
            <button
              key="a"
              onClick={() => setTarget({ type: "teacher", id: t.teacher_id, nama: t.nama })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
            >
              <Trash2 size={14} /> Hapus
            </button>,
          ])}
        />
      ) : (
        <DataTable
          columns={["Student ID", "Nama & Kontak", "Kelas & Trial", "Status", "Aksi"]}
          rows={students.map((x) => [
            <code key="id" className="rounded bg-ivory px-2 py-0.5 text-xs font-bold">{x.student_id}</code>,
            <span key="n">
              <b>{String(x.full_name ?? x.nama ?? "—")}</b>
              <br />
              <span className="text-xs text-ink/60">{x.email}{x.wa ? ` • ${x.wa}` : ""}</span>
            </span>,
            <span key="c" className="text-xs text-ink/70">
              {x.classes.length === 0 ? "Belum ada kelas" : x.classes.map((c) => `${c.class_id} (${c.status}, sisa ${c.sisa})`).join("; ")}
              <br />
              <span className="text-ink/55">Trial: {x.trial}</span>
            </span>,
            <Badge key="s" tone="blue">{x.current_status || "REGISTERED"}</Badge>,
            <button
              key="a"
              onClick={() => setTarget({ type: "student", id: x.student_id, nama: String(x.full_name ?? x.nama ?? x.student_id) })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
            >
              <Trash2 size={14} /> Hapus
            </button>,
          ])}
        />
      )}

      <Modal open={target !== null} onClose={() => setTarget(null)} title="Hapus permanen?">
        <p className="text-sm leading-relaxed text-ink/70">
          <b>{target?.nama}</b> (<code>{target?.id}</code>) akan dihapus <b>permanen</b> beserta seluruh datanya
          {target?.type === "student" ? " (membership, pembayaran, trial, placement, absensi, chat)" : " (akun teacher)"}.
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => void confirmDelete()}
            disabled={deleting}
            className="min-h-[48px] flex-1 rounded-xl bg-rose-600 px-5 py-3 text-base font-bold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {deleting ? "Menghapus…" : "Ya, Hapus Permanen"}
          </button>
          <Button variant="secondary" onClick={() => setTarget(null)}>Batal</Button>
        </div>
      </Modal>
      <Toast message={toast} tone={toastTone} />
    </div>
  );
}
