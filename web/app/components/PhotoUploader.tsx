"use client";

import { useEffect, useState } from "react";
import { Button, Card, Field, Input, Select, Toast } from "./ui";

export type PhotoEntity = "student" | "teacher" | "staff" | "class" | "payment";

const ENTITIES: Array<{ value: PhotoEntity; label: string; placeholder: string }> = [
  { value: "student", label: "Siswa (STU-XXXXXX)", placeholder: "STU-000001" },
  { value: "teacher", label: "Guru (TCH-XXXXXX)", placeholder: "TCH-000001" },
  { value: "staff", label: "Staff (ACT-XXXXXX)", placeholder: "ACT-000001" },
  { value: "class", label: "Kelas (CLS-XXXXXX)", placeholder: "CLS-000001" },
  { value: "payment", label: "Pembayaran (ID/TXN/STU)", placeholder: "STU-000001" },
];

interface PhotoRow {
  file_url: string;
  created_at?: string;
  size_bytes?: number;
}

async function getCsrf(): Promise<string> {
  try {
    const r = await fetch("/api/csrf");
    const j = await r.json();
    return typeof j.csrfToken === "string" ? j.csrfToken : "";
  } catch {
    return "";
  }
}

export default function PhotoUploader({
  defaultEntity = "student",
  defaultId = "",
  compact = false,
  onUploaded,
}: {
  defaultEntity?: PhotoEntity;
  defaultId?: string;
  compact?: boolean;
  onUploaded?: (url: string) => void;
}) {
  const [entity, setEntity] = useState<PhotoEntity>(defaultEntity);
  const [entityId, setEntityId] = useState(defaultId);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [rows, setRows] = useState<PhotoRow[]>([]);
  const [source, setSource] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"dark" | "green" | "red">("dark");
  const [csrf, setCsrf] = useState("");

  useEffect(() => { getCsrf().then(setCsrf).catch(() => {}); }, []);

  const show = (m: string, t: "dark" | "green" | "red" = "dark") => {
    setToast(m); setTone(t); window.setTimeout(() => setToast(""), 3500);
  };

  const load = async () => {
    if (!entityId.trim()) { setRows([]); return; }
    try {
      const r = await fetch(`/api/upload-photo?entityType=${entity}&entityId=${encodeURIComponent(entityId.trim())}`);
      const j = await r.json();
      if (j.ok) { setRows(Array.isArray(j.rows) ? j.rows : []); setSource(j.source ?? ""); }
    } catch { /* abaikan, daftar opsional */ }
  };

  // Daftar foto dimuat eksplisit via tombol "Lihat Foto" (bukan di effect,
  // agar tidak memicu cascading render) dan otomatis setelah upload sukses.

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId.trim()) { show("Isi ID dulu (cth. STU-000001).", "red"); return; }
    if (!file) { show("Pilih file foto dulu (JPG/PNG/WebP ≤5MB).", "red"); return; }
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("entityType", entity);
      fd.append("entityId", entityId.trim());
      fd.append("photo", file);
      if (csrf) fd.append("csrfToken", csrf);
      const res = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { ...(csrf ? { "x-csrf-token": csrf } : {}) },
        body: fd,
      });
      const j = await res.json();
      if (j.ok) {
        show("Foto terupload.", "green");
        setFile(null);
        setPreview((prev) => { if (prev.startsWith("blob:")) URL.revokeObjectURL(prev); return ""; });
        onUploaded?.(j.url as string);
        await load();
      } else {
        show(typeof j.error === "string" ? j.error : "Upload gagal. Cek ID & format file.", "red");
      }
    } catch {
      show("Jaringan gagal. Coba lagi.", "red");
    } finally {
      setSending(false);
    }
  };

  const ph = ENTITIES.find((x) => x.value === entity)?.placeholder ?? "";

  return (
    <Card className={compact ? "rounded-xl p-4" : "rounded-xl"}>
      <form onSubmit={submit} className="grid gap-3">
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <input tabIndex={-1} autoComplete="off" name="website" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Jenis ID">
            <Select value={entity} onChange={(e) => setEntity(e.target.value as PhotoEntity)}>
              {ENTITIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Field>
          <Field label="ID" hint={`Contoh: ${ph}`}>
            <Input value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder={ph} />
          </Field>
        </div>
        <Field label="Foto (JPG/PNG/WebP, maks 5 MB)">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setPreview((prev) => { if (prev.startsWith("blob:")) URL.revokeObjectURL(prev); return prev; });
              setFile(f);
              setPreview(f ? URL.createObjectURL(f) : "");
            }}
          />
        </Field>
        {preview && (
          <img src={preview} alt="Pratinjau foto" className="h-32 w-32 rounded-xl border border-sand/40 object-cover" />
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={sending} className="flex-1">{sending ? "Mengupload…" : "Upload Foto"}</Button>
          <Button type="button" variant="secondary" onClick={load}>Lihat Foto</Button>
        </div>
      </form>

      {rows.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-extrabold tracking-[0.15em] text-navy">
            FOTO TERSIMPAN{source ? ` • ${source.toUpperCase()}` : ""} ({rows.length})
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {rows.map((r, i) => (
              <a key={i} href={r.file_url} target="_blank" rel="noreferrer" title={r.file_url}>
                <img src={r.file_url} alt={`Foto ${entityId} ${i + 1}`} loading="lazy" className="aspect-square w-full rounded-xl border border-sand/40 object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
      <Toast message={toast} tone={tone} />
    </Card>
  );
}
