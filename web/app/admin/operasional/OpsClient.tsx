"use client";

import { useCallback, useEffect, useState } from "react";
import PhotoUploader from "../../components/PhotoUploader";
import { Badge, Card, DataTable, Toast } from "../../components/ui";

type Tab = "payment" | "reports" | "reschedule" | "foto";

interface Row extends Record<string, unknown> {
  id: number;
  status?: string;
}

async function getJSON(path: string) {
  const r = await fetch(path);
  return r.json() as Promise<{ ok: boolean; rows?: Row[] }>;
}

export default function OpsClient() {
  const [tab, setTab] = useState<Tab>("payment");
  const [rows, setRows] = useState<Row[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const path = tab === "payment" ? "/api/payment-confirm" : tab === "reports" ? "/api/teacher-report" : tab === "reschedule" ? "/api/reschedule" : "";

  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      const j = await getJSON(path);
      setRows(Array.isArray(j.rows) ? j.rows : []);
      setSource(j.ok ? "db" : "?");
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (!path) return;
    let live = true;
    (async () => {
      setLoading(true);
      try {
        const j = await getJSON(path);
        if (!live) return;
        setRows(Array.isArray(j.rows) ? j.rows : []);
        setSource(j.ok ? "db" : "?");
      } catch {
        if (live) setRows([]);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [path]);

  const show = (m: string) => { setToast(m); window.setTimeout(() => setToast(""), 3000); };

  const selectTab = (t: Tab) => {
    setTab(t);
    if (t === "foto") {
      setRows([]);
      setSource("foto");
      setLoading(false);
    }
  };

  const act = async (id: number, status: string) => {
    setBusyId(id);
    try {
      const r = await fetch(path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const j = await r.json();
      if (j.ok) { show("Status diperbarui."); await load(); }
      else show("Gagal. Hanya admin yang bisa verifikasi.");
    } catch {
      show("Jaringan gagal.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">OPERASIONAL • FINANCE & GURU</p>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">Verifikasi Operasional</h1>
        <p className="mt-1 text-sm text-ink/70">Sumber: <b>{source || "…"}</b> • Payment perlu VERIFIED agar invoice sah. Reschedule perlu APPROVED.</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(["payment", "reports", "reschedule", "foto"] as const).map((t) => (
          <button key={t} onClick={() => selectTab(t)}
            className={`rounded-xl border px-3 py-3 text-xs font-bold sm:text-sm ${tab === t ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/70"}`}>
            {t === "payment" ? "Pembayaran" : t === "reports" ? "Laporan Sesi" : t === "reschedule" ? "Reschedule" : "Foto"}
          </button>
        ))}
      </div>

      {tab === "foto" ? (
        <div className="space-y-4">
          <p className="text-sm text-ink/70">Upload / cek foto per ID (siswa, guru, staff, kelas, pembayaran). Bukti pembayaran di tab Pembayaran bisa diklik untuk dibuka.</p>
          <PhotoUploader defaultEntity="student" />
        </div>
      ) : loading ? (
        <p className="text-sm text-ink/60">Memuat…</p>
      ) : tab === "payment" ? (
        <DataTable
          columns={["ID", "Nama", "Student", "Nominal", "Bukti", "Status", "Aksi"]}
          rows={rows.map((r) => [
            <b key="i">{String(r.id)}</b>,
            String(r.nama ?? "—"),
            <span key="s">{String(r.student_id ?? "—")}<br /><span className="text-xs text-ink/60">{String(r.program ?? "")}</span></span>,
            <b key="n">Rp {Number(r.nominal ?? 0).toLocaleString("id-ID")}</b>,
            <span key="b">
              {typeof r.bukti_url === "string" && r.bukti_url ? (
                <a href={String(r.bukti_url)} target="_blank" rel="noreferrer" title={String(r.bukti_url)}>
                  {String(r.bukti_url).startsWith("/uploads/") ? (
                    <img src={String(r.bukti_url)} alt={`Bukti ${String(r.id)}`} loading="lazy" className="h-12 w-12 rounded-lg border border-sand/40 object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-navy underline">Lihat bukti</span>
                  )}
                </a>
              ) : (
                <span className="text-xs text-ink/40">—</span>
              )}
            </span>,
            <Badge key="st" tone={r.status === "VERIFIED" ? "green" : r.status === "REJECTED" ? "red" : "amber"}>{String(r.status ?? "PENDING")}</Badge>,
            <span key="a" className="flex gap-1">
              <button disabled={busyId === r.id} onClick={() => act(r.id, "VERIFIED")} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-ivory disabled:opacity-50">Verifikasi</button>
              <button disabled={busyId === r.id} onClick={() => act(r.id, "REJECTED")} className="rounded-lg border border-sand px-3 py-1.5 text-xs font-bold text-ink">Tolak</button>
            </span>,
          ])}
        />
      ) : tab === "reports" ? (
        <DataTable
          columns={["ID", "Class", "Tanggal", "Catatan"]}
          rows={rows.map((r) => [
            <b key="i">{String(r.id)}</b>,
            String(r.class_id ?? "—"),
            String(r.tanggal ?? (r.created_at as string ?? "—")).slice(0, 10),
            <span key="c" className="block max-w-md whitespace-normal">{String(r.catatan ?? "—")}<br /><span className="text-xs text-ink/60">{String(r.materi ?? "")} • Hadir {String(r.hadir ?? "—")} • {String(r.reported_by ?? "")}</span></span>,
          ])}
        />
      ) : (
        <DataTable
          columns={["ID", "Class", "Lama → Baru", "Status", "Aksi"]}
          rows={rows.map((r) => [
            <b key="i">{String(r.id)}</b>,
            String(r.class_id ?? "—"),
            <span key="b">{String(r.lama ?? "—")} → <b>{String(r.baru ?? "—")}</b><br /><span className="text-xs text-ink/60">{String(r.alasan ?? "")}</span></span>,
            <Badge key="st" tone={r.status === "APPROVED" ? "green" : r.status === "REJECTED" ? "red" : "amber"}>{String(r.status ?? "PENDING")}</Badge>,
            <span key="a" className="flex gap-1">
              <button disabled={busyId === r.id} onClick={() => act(r.id, "APPROVED")} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-ivory disabled:opacity-50">Setujui</button>
              <button disabled={busyId === r.id} onClick={() => act(r.id, "REJECTED")} className="rounded-lg border border-sand px-3 py-1.5 text-xs font-bold text-ink">Tolak</button>
            </span>,
          ])}
        />
      )}
      <Card className="rounded-xl"><p className="text-xs text-ink/60">Tanpa `.env` Supabase, daftar kosong (source empty) — normal di lokal. Isi env + jalankan schema untuk live.</p></Card>
      <Toast message={toast} tone="dark" />
    </div>
  );
}
