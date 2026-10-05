"use client";

import { useEffect, useState } from "react";
import { Badge, Card } from "../../components/ui";

// Feedback & Progress Tracker: pre vs post, gain, rekomendasi.
export default function ProgressClient() {
  const [data, setData] = useState<{ student: Record<string, unknown> } | null>(null);

  useEffect(() => {
    fetch("/api/student/me").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const st = (data?.student ?? {}) as Record<string, unknown>;
  const num = (v: unknown): number | null => (typeof v === "number" ? v : null);
  const pre = num(st.preCheck ?? st.pre_check_score) ?? 0;
  const post = num(st.postCheck ?? st.post_check_score);
  const gain = num(st.gainScore ?? st.gain_score) ?? (post != null ? post - pre : null);
  const placement = num(st.placementScore ?? st.placement_total) ?? 0;
  const fit = String(st.a2Fit ?? st.a2_fit ?? "PLACEMENT_PENDING");

  const pct = (v: number, max: number) => `${Math.min(100, Math.round((v / max) * 100))}%`;
  const reco = fit === "A2_CONFIRMED"
    ? "Pertahankan ritme: tambah detail where/with whom/why + 1 follow-up question ke teman. Siap ke sesi lanjutan."
    : fit === "OTHER_LEVEL"
      ? "Tim akan rekomendasikan jalur yang lebih pas (materi di atas/di bawah A2 pilot). Tunggu info via WhatsApp."
      : "Fokus ke 4 past verbs + 2 time markers tiap recount. Ulangi speaking 60–90 detik 2× sehari.";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-extrabold tracking-[0.2em] text-navy">FEEDBACK & PROGRESS TRACKER</p>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">Perkembangan cara bicara</h1>
        <p className="mt-1 text-sm text-ink/70">Gain = Post − Pre (0–10). Bukan klaim kenaikan CEFR.</p>
      </div>

      <Card className="rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-extrabold text-ink">Pre-Check vs Post-Check</h2>
          <Badge tone={gain != null && gain > 0 ? "green" : "slate"}>{gain != null ? `GAIN +${gain}` : "BELUM ADA POST"}</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {[
            ["Pre-Check", pre, 10],
            ["Post-Check", post ?? 0, 10],
            ["Placement Total", placement, 50],
          ].map(([label, val, max]) => (
            <div key={label as string}>
              <div className="flex justify-between text-xs font-bold text-ink/70">
                <span>{label}</span><span>{val}/{max}</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ivory">
                <div className="h-full rounded-full bg-navy" style={{ width: pct(val as number, max as number) }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-xl">
        <h2 className="font-display text-base font-extrabold text-ink">Rekomendasi pengajar</h2>
        <p className="mt-2 rounded-xl bg-sand-soft p-3 text-sm leading-relaxed text-ink/80">{reco}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-ink/70">
          <li>• LO Result: {fit === "A2_CONFIRMED" ? "Achieved / Partially Achieved" : "Menunggu observasi speaking"}</li>
          <li>• Next step spesifik, bukan diagnosis level penuh</li>
          <li>• Post-Class Review dikirim maks. 1×24 jam setelah kelas</li>
        </ul>
      </Card>
    </div>
  );
}
