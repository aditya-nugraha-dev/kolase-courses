"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Cpu,
  Crown,
  GraduationCap,
  Loader2,
  LogIn,
  Presentation,
  UserPlus,
} from "lucide-react";
import { Button, Card, Field, Input, Toast } from "../components/ui";
import TurnstileBox from "../components/TurnstileBox";
import { detectLeadershipHint } from "@/lib/leadership";

type Role = "student" | "teacher" | "founder" | "academic" | "systems";
type Mode = "masuk" | "daftar";

const ROLES: Array<{ id: Role; title: string; desc: string; idInfo: string; icon: typeof GraduationCap }> = [
  { id: "student", title: "Student", desc: "Murid / peserta kelas", idInfo: "ID STU-XXXXXX otomatis", icon: GraduationCap },
  { id: "teacher", title: "Teacher", desc: "Pengajar / fasilitator", idInfo: "ID TCH-XXXXXX otomatis", icon: Presentation },
  { id: "founder", title: "Founder", desc: "Founder & Business Lead", idInfo: "ID ACT-XXXXXX otomatis", icon: Crown },
  { id: "academic", title: "Academic", desc: "Co-Founder & Academic Lead", idInfo: "ID ACT-XXXXXX otomatis", icon: BookOpen },
  { id: "systems", title: "Systems", desc: "Head of Systems & Technology", idInfo: "ID ACT-XXXXXX otomatis", icon: Cpu },
];

const DEFAULT_DEST: Record<Role, string> = { student: "/student", teacher: "/admin", founder: "/admin", academic: "/admin", systems: "/admin" };
const AUTH_PATH: Record<Role, string> = {
  student: "/api/auth/student",
  teacher: "/api/auth/teacher",
  founder: "/api/auth/founder",
  academic: "/api/auth/academic",
  systems: "/api/auth/systems",
};
const ID_PREFIX: Record<Role, string> = { student: "STU", teacher: "TCH", founder: "ACT", academic: "ACT", systems: "ACT" };

function safeNext(raw: string | null, fallback: string): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("..")) return raw;
  return fallback;
}

export default function MasukClient() {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next");

  const [role, setRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  // Login (masuk): cukup email, ID ditemukan otomatis.
  const [email, setEmail] = useState("");

  // Daftar teacher/staff: nama + email + WA → ID auto-stack dari database.
  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");

  // Anti-bot & CSRF untuk form daftar.
  const [csrf, setCsrf] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState("");
  const [hpWebsite, setHpWebsite] = useState("");
  const [hpNickname, setHpNickname] = useState("");

  const [receipt, setReceipt] = useState<{ id: string; role: Role; preview: boolean } | null>(null);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/csrf").then((r) => r.json()).then((j) => {
      if (typeof j.csrfToken === "string") setCsrf(j.csrfToken);
    }).catch(() => {});
  }, []);

  const pickRole = (r: Role) => {
    setRole(r);
    setMode(null);
    setErr("");
    setReceipt(null);
    setEmail("");
  };

  const backToRole = () => {
    setRole(null);
    setMode(null);
    setErr("");
    setReceipt(null);
  };

  const backToMode = () => {
    setMode(null);
    setErr("");
    setReceipt(null);
  };

  // ---- MASUK: email-only, ID ditemukan otomatis ----
  const login = async () => {
    if (!role) return;
    setErr("");
    setBusy(true);
    try {
      const body: Record<string, string> = { email: email.trim() };
      const res = await fetch(AUTH_PATH[role], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (j.ok) {
        const assigned = j.studentId ?? j.teacherId ?? j.staffId;
        setToast(`Masuk berhasil${assigned ? ` — ${assigned}` : ""}. Mengalihkan…`);
        window.setTimeout(() => router.push(safeNext(nextParam, DEFAULT_DEST[role])), 600);
      } else {
        setErr("Email belum terdaftar. Periksa kembali, atau daftar dulu.");
      }
    } catch {
      setErr("Login gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  // ---- DAFTAR teacher/leadership: ID auto-stack dari database ----
  // student daftar via wizard /daftar; teacher TCH-XXXXXX, leadership ACT-XXXXXX.
  const register = async () => {
    if (!role || role === "student") return;
    setErr("");
    if (nama.trim().length < 3) {
      setErr("Nama lengkap min. 3 karakter.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("Email tidak valid.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        role,
        nama: nama.trim(),
        email: email.trim(),
        wa: wa.trim(),
        csrfToken: csrf,
        formStartedAt,
        turnstileToken,
        website: hpWebsite,
        nickname: hpNickname,
      };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(csrf ? { "x-csrf-token": csrf } : {}) },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j.ok && j.id) {
        setReceipt({ id: String(j.id), role, preview: false });
        setToast(`Pendaftaran berhasil — ID kamu ${j.id}`);
      } else {
        throw new Error("register gagal");
      }
    } catch {
      // Backend offline: tidak ada preview ID. User harus online / DB tersambung.
      setErr("Pendaftaran gagal. Pastikan database tersambung lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  // ---------- STEP 1: pilih peran ----------
  if (!role) {
    return (
      <div>
        <p className="text-center text-sm font-bold text-ink/70">Langkah 1 — Kamu masuk sebagai siapa?</p>
        <div className="mt-4 grid gap-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => pickRole(r.id)}
              className="flex items-center gap-4 rounded-xl border border-sand/40 bg-paper p-4 text-left shadow-sm transition hover:border-ink hover:shadow"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-sand">
                <r.icon size={22} />
              </span>
              <span>
                <span className="font-display block text-base font-extrabold text-ink">{r.title}</span>
                <span className="block text-sm text-ink/60">{r.desc}</span>
                <span className="mt-0.5 inline-block rounded-full bg-sand-soft text-ink border-sand">{r.idInfo}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-ink/60">
          Tidak perlu mengisi ID — ID berurutan otomatis dari sistem.
        </p>
      </div>
    );
  }

  const roleLabel = ROLES.find((r) => r.id === role)?.title ?? role;
  const nameHint = nama ? detectLeadershipHint(nama) : null;

  // ---------- STEP 2: masuk atau daftar ----------
  if (!mode) {
    return (
      <div>
        <button onClick={backToRole} className="inline-flex items-center gap-1 text-sm font-bold text-navy hover:underline">
          <ArrowLeft size={15} /> Ganti peran
        </button>
        <p className="mt-2 text-center text-sm font-bold text-ink/70">
          Masuk sebagai <b className="text-ink">{roleLabel}</b> — mau apa?
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => { setMode("masuk"); setErr(""); }}
            className="rounded-xl border border-sand/40 bg-paper p-5 text-center shadow-sm transition hover:border-ink hover:shadow"
          >
            <LogIn size={24} className="mx-auto text-navy" />
            <span className="font-display mt-2 block text-base font-extrabold text-ink">Masuk</span>
            <span className="mt-1 block text-xs text-ink/60">Sudah terdaftar. Cukup email, tanpa isi ID.</span>
          </button>
          <button
            onClick={() => { setMode("daftar"); setErr(""); setReceipt(null); }}
            className="rounded-xl border border-sand/40 bg-paper p-5 text-center shadow-sm transition hover:border-ink hover:shadow"
          >
            <UserPlus size={24} className="mx-auto text-navy" />
            <span className="font-display mt-2 block text-base font-extrabold text-ink">Daftar</span>
            <span className="mt-1 block text-xs text-ink/60">
              {role === "student" ? "Wizard placement + ID STU-… otomatis." : `Form singkat + ID ${ID_PREFIX[role]}-… otomatis.`}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ---------- STEP 3a: daftar student → arahkan ke wizard ----------
  if (mode === "daftar" && role === "student") {
    return (
      <div>
        <button onClick={backToMode} className="inline-flex items-center gap-1 text-sm font-bold text-navy hover:underline">
          <ArrowLeft size={15} /> Kembali
        </button>
        <Card className="mt-3 space-y-4 rounded-xl text-center">
          <UserPlus size={36} className="mx-auto text-navy" />
          <h2 className="font-display text-lg font-extrabold text-ink">Daftar sebagai Student</h2>
          <p className="mx-auto max-w-sm text-sm text-ink/70">
            Pendaftaran murid lewat wizard: isi data → placement check auto-scoring → terima <b>Student ID (STU-XXXXXX)</b> berurutan otomatis.
          </p>
          <Button onClick={() => router.push("/daftar")} className="w-full">Buka Form Pendaftaran Murid</Button>
        </Card>
      </div>
    );
  }

  // ---------- STEP 3b: tanda terima daftar teacher/leadership ----------
  if (receipt) {
    return (
      <div>
        <Card className="rounded-xl text-center">
          <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
          <h2 className="font-display mt-2 text-xl font-extrabold text-ink">Pendaftaran {roleLabel} Berhasil</h2>
          <p className="mt-1 text-sm text-ink/70">
            ID kamu sudah di-stack otomatis dari database:
          </p>
          <p className="font-display mx-auto mt-3 inline-block rounded-xl bg-ink px-6 py-3 text-2xl font-extrabold tracking-wider text-sand">
            {receipt.id}
          </p>
          <p className="mt-2 text-xs text-ink/60">Simpan ID ini. Untuk masuk cukup pakai email — tanpa mengisi ID.</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="dark" onClick={() => { setReceipt(null); setMode("masuk"); setErr(""); }}>Lanjut Masuk</Button>
            <Button variant="secondary" onClick={() => router.push("/")}>Ke Beranda</Button>
          </div>
        </Card>
        <Toast message={toast} tone="dark" />
      </div>
    );
  }

  // ---------- STEP 3c: form daftar teacher/leadership ----------
  if (mode === "daftar") {
    return (
      <div>
        <button onClick={backToMode} className="inline-flex items-center gap-1 text-sm font-bold text-navy hover:underline">
          <ArrowLeft size={15} /> Kembali
        </button>
        <Card className="mt-3 space-y-4 rounded-xl">
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <input tabIndex={-1} autoComplete="off" value={hpWebsite} onChange={(e) => setHpWebsite(e.target.value)} />
            <input tabIndex={-1} autoComplete="off" value={hpNickname} onChange={(e) => setHpNickname(e.target.value)} />
          </div>
          <h2 className="font-display text-lg font-extrabold text-ink">Daftar sebagai {roleLabel}</h2>
          <p className="text-sm text-ink/70">
            Isi nama + email — ID <b>{ID_PREFIX[role]}-XXXXXX</b> terbit berurutan otomatis. Tanpa mengisi ID.
          </p>
          <Field label="Nama Lengkap">
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. Hilal Ibrahim Badruz" autoComplete="name" />
          </Field>
          {nameHint && (
            <div
              className={`rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${
                nameHint.role === role
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              {nameHint.role === role ? (
                <>Terdeteksi sebagai <b>{nameHint.title}</b> ({nameHint.displayName}). Lanjutkan pendaftaran {roleLabel}.</>
              ) : (
                <>
                  Nama <b>{nameHint.displayName}</b> terdaftar untuk peran <b>{nameHint.title}</b> — silakan pilih peran{" "}
                  <b>{ROLES.find((r) => r.id === nameHint.role)?.title ?? nameHint.role}</b> saja.
                  <button
                    type="button"
                    onClick={() => { setRole(nameHint.role); setMode("daftar"); setErr(""); setReceipt(null); }}
                    className="ml-1 font-bold text-navy hover:underline"
                  >
                    Ganti ke {ROLES.find((r) => r.id === nameHint.role)?.title ?? nameHint.role}
                  </button>
                </>
              )}
            </div>
          )}
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.id" autoComplete="email" />
          </Field>
          <Field label="Nomor WhatsApp (opsional)">
            <Input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" />
          </Field>
          <TurnstileBox onToken={setTurnstileToken} />
          {err && <p className="text-xs font-semibold text-rose-600">{err}</p>}
          <Button onClick={register} disabled={busy} className="w-full">
            {busy ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={18} /> Daftar & Terbitkan ID</>}
          </Button>
        </Card>
        <Toast message={toast} tone="dark" />
      </div>
    );
  }

  // ---------- STEP 3d: form masuk (email-only) ----------
  return (
    <div>
      <button onClick={backToMode} className="inline-flex items-center gap-1 text-sm font-bold text-navy hover:underline">
        <ArrowLeft size={15} /> Kembali
      </button>
      <Card className="mt-3 space-y-4 rounded-xl">
        <h2 className="font-display text-lg font-extrabold text-ink">Masuk sebagai {roleLabel}</h2>
        <p className="text-sm text-ink/70">
          Cukup email yang dipakai saat daftar — ID kamu (<b>{ID_PREFIX[role]}-XXXXXX</b>) ditemukan otomatis. Tanpa mengisi ID.
        </p>
        <Field label="Email terdaftar">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.id" autoComplete="email" />
        </Field>
        {err && <p className="text-xs font-semibold text-rose-600">{err}</p>}
        <Button onClick={login} disabled={busy} className="w-full">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <><LogIn size={18} /> Masuk sebagai {roleLabel}</>}
        </Button>
        <p className="text-center text-xs text-ink/60">
          Belum punya akun?{" "}
          <button onClick={() => { setMode("daftar"); setErr(""); }} className="font-bold text-navy hover:underline">
            Daftar dulu
          </button>
        </p>
      </Card>
      <Toast message={toast} tone="dark" />
    </div>
  );
}
