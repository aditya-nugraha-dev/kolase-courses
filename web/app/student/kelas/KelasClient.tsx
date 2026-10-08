"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardList, Gift, Link2, Video } from "lucide-react";
import { Badge, Card } from "../../components/ui";
import MateriPanel from "../../components/MateriPanel";

interface TrialRow {
  trial_id: string;
  class_id: string;
  status: string;
  sessions_delivered: number;
}

interface MeData {
  student: Record<string, unknown>;
  class: Record<string, unknown> | null;
  membership?: Record<string, unknown> | null;
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

// My Class & Materials: CTA Meet + GForm + materi (Kids), checklist trial 7 sesi.
export default function KelasClient() {
  const [data, setData] = useState<MeData | null>(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    fetch("/api/student/me").then((r) => r.json()).then(setData).catch(() => {});
    fetch("/api/auth/me").then((r) => r.json()).then((j) => {
      if (typeof j.role === "string") setRole(j.role);
    }).catch(() => {});
  }, []);

  const cls = (data?.class ?? {}) as Record<string, unknown>;
  const mem = (data?.membership ?? {}) as Record<string, unknown>;
  const trial = data?.trial ?? null;
  const classId = getStr(cls, "id", "pilot_class_id");
  const name = String(cls.nama ?? cls.name ?? "Menunggu class matching");
  const schedule = String(cls.jadwal ?? cls.schedule ?? "Jadwal menyusul via WhatsApp");
  const teacher = String(cls.teacher_name ?? cls.guru ?? cls.teacher ?? "Tim KOLASE");
  const meet = getStr(cls, "meet_link", "meet");
  const slides = getStr(cls, "slides_link", "slides");
  const gformPost = getStr(cls, "post_class_form_link", "gform");
  const gformPlace = getStr(cls, "placement_form_link");
  const level = getStr(cls, "level");
  const isKids = level === "KIDS" || classId.startsWith("CLS-PUB-KIDS");
  const isTeacher = role !== "" && role !== "student";
  const trialActive = trial?.status === "STARTED";
  const trialDone = Number(trial?.sessions_delivered ?? 0);
  const memActive = mem.status === "ACTIVE" || mem.status === "PENDING";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">
          {isKids ? "KELAS KIDS • LITTLE SPEAKERS" : "MY CLASS & MATERIALS"}
        </p>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">{name}</h1>
        <p className="mt-1 text-sm text-ink/70">{schedule} • {teacher}</p>
        {classId && (
          <p className="mt-1 text-xs text-ink/50">
            <code className="rounded bg-ivory px-1.5 py-0.5 font-bold">{classId}</code>
            {typeof mem.sisa === "number" && <span className="ml-2">Sisa {String(mem.sisa)} sesi • {String(mem.status ?? "")}</span>}
          </p>
        )}
      </div>

      {/* Checklist trial 7 sesi (belum jadi member berbayar) */}
      {trialActive && !memActive && (
        <Card className="rounded-xl border-sand-deep">
          <div className="flex items-center gap-2">
            <Gift size={17} className="text-sand-deep" />
            <h2 className="font-display text-base font-extrabold text-ink">Trial gratis: sesi {trialDone} dari 7</h2>
          </div>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                className={`h-2.5 flex-1 rounded-full ${i < trialDone ? "bg-sand-deep" : "bg-ivory"}`}
                title={i < 6 ? `Sesi ${i + 1}` : "Sesi 7 Progress Test"}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-ink/60">
            Guru menandai tiap sesi selesai. Sesi 1–6 belajar, Sesi 7 Progress Test — setelah itu kamu ditanya lanjut ke Kelas Kids atau tidak.
          </p>
          <Link href="/student" className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-ivory hover:bg-navy">
            Cek Progres di Dashboard
          </Link>
        </Card>
      )}

      {/* CTA utama Kids: GMeet + GForm */}
      {isKids && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="rounded-xl border-navy bg-navy text-ivory">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display flex items-center gap-2 text-base font-extrabold"><Video size={17} /> Google Meet</h2>
              <Badge tone={meet ? "green" : "amber"}>{meet ? "TERSEDIA" : "MENUNGGU"}</Badge>
            </div>
            {meet ? (
              <a href={meet} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-sand px-5 py-3 text-sm font-bold text-ink hover:bg-sand-deep">
                <Video size={16} /> Join Kelas Sekarang
              </a>
            ) : (
              <p className="mt-2 text-sm text-ivory/75">Link dibagikan setelah class matching (min. 3 siswa). Cek WhatsApp H-1.</p>
            )}
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ivory/60"><Link2 size={12} /> Jangan bagikan link ke luar kelas.</p>
          </Card>
          <Card className="rounded-xl">
            <h2 className="font-display flex items-center gap-2 text-base font-extrabold text-ink"><ClipboardList size={17} /> Form Kelas (GForm)</h2>
            <div className="mt-3 grid gap-2">
              {gformPost ? (
                <a href={gformPost} target="_blank" rel="noreferrer" className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory hover:bg-navy">
                  Isi Absensi & Feedback Sesi
                </a>
              ) : (
                <p className="rounded-xl bg-ivory p-3 text-xs text-ink/60">Form absensi & feedback menyusul via WhatsApp.</p>
              )}
              {gformPlace && (
                <a href={gformPlace} target="_blank" rel="noreferrer" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-sand px-5 py-3 text-sm font-bold text-ink hover:border-ink">
                  Form Entry Assessment
                </a>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Kelas non-Kids: kartu Meet generik (tetap seperti semula) */}
      {!isKids && (
        <Card className="rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-extrabold text-ink">Link Google Meet</h2>
            <Badge tone={meet ? "green" : "amber"}>{meet ? "TERSEDIA" : "MENUNGGU MATCHING"}</Badge>
          </div>
          {meet ? (
            <a href={meet} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory hover:bg-navy">
              <Video size={16} /> Join Google Meet
            </a>
          ) : (
            <p className="mt-2 text-sm text-ink/70">
              Link dibagikan setelah class matching manual (3–5 siswa se-level & se-jadwal).
              Pastikan notifikasi WhatsApp aktif.
            </p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/60"><Link2 size={13} /> Jangan bagikan link ke luar kelas.</p>
        </Card>
      )}

      {/* Materi: murid unduh, guru upload */}
      {classId ? (
        <MateriPanel classId={classId} canUpload={isTeacher} />
      ) : (
        <Card className="rounded-xl">
          <p className="text-sm text-ink/60">Materi muncul setelah kamu masuk ke sebuah kelas.</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl">
          <h2 className="font-display flex items-center gap-2 text-base font-extrabold text-ink"><BookOpen size={17} /> Modul pembelajaran</h2>
          <ul className="mt-2 space-y-2 text-sm text-ink/80">
            {isKids ? (
              <>
                <li>• Hello It&apos;s Me — perkenalan & keberanian bicara</li>
                <li>• My Favorite Things — kosakata benda sekitar</li>
                <li>• My Day — rutinitas harian sederhana</li>
                <li>• I Can Speak English — showcase + invitation</li>
              </>
            ) : (
              <>
                <li>• Model recount + verb bank (went, had, saw, ate, did, stayed…)</li>
                <li>• Time markers (then, after that, finally, last weekend…)</li>
                <li>• Sentence frames 4–6 kalimat + speaking prompts 60–90 detik</li>
              </>
            )}
          </ul>
          {slides ? (
            <a href={slides} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-xl border border-sand bg-paper px-4 py-2.5 text-sm font-bold text-ink hover:border-ink">Buka Slide Deck</a>
          ) : (
            <p className="mt-3 text-xs text-ink/60">Slide deck dibagikan H-1 via WhatsApp.</p>
          )}
        </Card>
        <Card className="rounded-xl">
          <h2 className="font-display text-base font-extrabold text-ink">Bahan studi & rekaman</h2>
          <ul className="mt-2 space-y-2 text-sm text-ink/80">
            <li>• Audio warm-up: daily routines & weekend stories</li>
            <li>• Worksheet: controlled practice past simple</li>
            <li>• Rekaman: tidak wajib untuk pilot (butuh consent terpisah)</li>
          </ul>
          <p className="mt-3 rounded-xl bg-ivory p-3 text-xs text-ink/60">
            Class norms: join 5 menit awal, mute saat tidak bicara, hargai giliran, English dianjurkan — salah itu wajar.
          </p>
        </Card>
      </div>
    </div>
  );
}
