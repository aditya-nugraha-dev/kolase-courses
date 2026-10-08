"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Trash2, UploadCloud } from "lucide-react";
import { Button, Card } from "./ui";

interface MaterialRow {
  id: number;
  file_url: string;
  title: string;
  mime: string;
  size_bytes: number;
  created_at: string;
}

function fmtSize(n: number): string {
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

// Panel materi kelas: murid hanya membaca; guru (canUpload) bisa upload + hapus.
export default function MateriPanel({ classId, canUpload }: { classId: string; canUpload: boolean }) {
  const [rows, setRows] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/materials?classId=${encodeURIComponent(classId)}`);
      const j = await r.json();
      if (j.ok && Array.isArray(j.rows)) setRows(j.rows as MaterialRow[]);
    } catch {
      /* abaikan */
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!live) return;
      await load();
    })();
    return () => {
      live = false;
    };
  }, [load]);

  const onUpload = async (f: File) => {
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("classId", classId);
      fd.append("file", f);
      const r = await fetch("/api/materials", { method: "POST", body: fd });
      const j = await r.json();
      if (j.ok) {
        setMsg("Materi terupload — murid sekelas langsung bisa mengunduh.");
        await load();
      } else {
        setMsg(typeof j.error === "string" ? j.error : "Upload gagal.");
      }
    } catch {
      setMsg("Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Hapus materi ini? Murid tidak bisa lagi mengunduhnya.")) return;
    try {
      const r = await fetch("/api/materials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      if (j.ok) {
        setRows((rows) => rows.filter((x) => x.id !== id));
        setMsg("Materi dihapus.");
      } else {
        setMsg("Gagal menghapus.");
      }
    } catch {
      setMsg("Gagal menghapus.");
    }
  };

  return (
    <Card className="rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display flex items-center gap-2 text-base font-extrabold text-ink">
          <FileText size={17} /> Materi Pembelajaran
        </h2>
        <span className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-bold text-ink/60">
          {rows.length} file
        </span>
      </div>

      {canUpload && (
        <label className="mt-3 flex min-h-[64px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sand/60 bg-ivory px-4 py-4 text-sm font-bold text-ink/70 hover:border-navy hover:text-ink">
          <UploadCloud size={18} />
          {uploading ? "Mengupload…" : "Upload materi (PDF/DOC/PPT/gambar/MP3 ≤5MB)"}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp3"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void onUpload(f);
            }}
          />
        </label>
      )}
      {msg && <p className="mt-2 text-xs font-semibold text-navy">{msg}</p>}

      {loading ? (
        <p className="mt-3 text-sm text-ink/60">Memuat materi…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 rounded-xl bg-ivory p-3 text-xs leading-relaxed text-ink/60">
          Belum ada materi. {canUpload ? "Upload file pertama untuk kelas ini." : "Guru akan mengupload materi di sini."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-xl bg-ivory px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-navy">
                <FileText size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink" title={m.title}>{m.title}</span>
                <span className="block text-[11px] text-ink/50">
                  {fmtSize(Number(m.size_bytes ?? 0))} • {String(m.created_at ?? "").slice(0, 10)}
                </span>
              </span>
              <a
                href={m.file_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Unduh ${m.title}`}
                className="rounded-lg bg-ink p-2.5 text-ivory hover:bg-navy"
              >
                <Download size={15} />
              </a>
              {canUpload && (
                <button
                  onClick={() => void onDelete(m.id)}
                  aria-label={`Hapus ${m.title}`}
                  className="rounded-lg border border-rose-200 p-2.5 text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canUpload && (
        <div className="mt-3">
          <Button variant="secondary" onClick={() => void load()} className="w-full sm:w-auto">
            Muat Ulang
          </Button>
        </div>
      )}
    </Card>
  );
}
