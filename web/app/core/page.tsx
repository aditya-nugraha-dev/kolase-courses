// KOLASE — konsol uji modul inti: register -> checkout -> webhook (7 trial gratis -> P15 sisa 8) -> attendance
// + hybrid pilot: placement (02, max 50) -> postclass (03, max 10) -> observation (06, skala 1-5)
// Responsif desktop + HP: max-width cairan, input 16px cegah auto-zoom iOS, tap target >=44px.
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

async function getCsrf(): Promise<string> {
  try {
    const r = await fetch("/api/csrf");
    const j = await r.json();
    return typeof j.csrfToken === "string" ? j.csrfToken : "";
  } catch {
    return "";
  }
}

async function call(path: string, body?: unknown) {
  const csrf = body ? await getCsrf() : "";
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    body: body
      ? JSON.stringify({
          ...(body as Record<string, unknown>),
          ...(csrf ? { csrfToken: csrf, formStartedAt: Date.now() - 5000 } : {}),
        })
      : undefined,
  });
  return res.json();
}

export default function CorePage() {
  const [health, setHealth] = useState("...");
  const [out, setOut] = useState("");
  const [f, setF] = useState({ role: "student", nama: "", email: "", wa: "", student_id: "STU-000001", pilot_student_id: "STU-000001", class_id: "CLS-PUB-KIDS-01", pilot_class_id: "CLS-000001", method: "QRIS", trx_id: "", trial_id: "", session_id: "", hadir: "PRESENT", placement_total: "35", pre_check_score: "7", post_check_total: "8", interest_status: "YES" });
  useEffect(() => { call("/api/health").then((h) => setHealth(`supabase:${h.supabase ? "ON" : "OFF"} sheets:${h.sheets ? "ON" : "OFF"}`)); }, []);
  const run = async (label: string, p: Promise<unknown>) => {
    try { setOut(label + "\n" + JSON.stringify(await p, null, 2)); }
    catch (e) { setOut(label + " ERROR: " + String(e)); }
  };
  const inp = { width: "100%", boxSizing: "border-box" as const, padding: 12, margin: "6px 0", borderRadius: 10, border: "1px solid #B29E84", background: "#FFFFFF", color: "#121212", fontSize: 16 } as const;
  const btn = { width: "100%", background: "#121212", color: "#F7F3EC", border: 0, borderRadius: 10, padding: "14px 16px", fontWeight: 700, cursor: "pointer", fontSize: 16, minHeight: 48 } as const;
  return (
    <main style={{ maxWidth: 720, width: "100%", margin: "0 auto", padding: "16px", color: "#121212", boxSizing: "border-box" }}>
      <h1 style={{ fontFamily: "Georgia,serif", letterSpacing: 4, fontSize: "clamp(22px,5vw,32px)", margin: "8px 0" }}>KOLASE <span style={{ color: "#203248" }}>CORE</span></h1>
      <p style={{ color: "#203248", fontSize: 14, lineHeight: 1.5 }}>Public Class 4 sesi @60 mnt, max 50 • Kids 50k / Teen 75k • wiring: {health} • <Link href="/" style={{ color: "#203248" }}>← home</Link></p>
      {[
        { t: "1. Register (STU-###### seumur hidup)", k: ["role", "nama", "email", "wa"], fn: () => call("/api/register", { role: f.role, nama: f.nama, email: f.email, wa: f.wa }) },
        { t: "2. Checkout Public (ENR + TXN PENDING, max 50)", k: ["student_id", "class_id", "method"], fn: () => call("/api/checkout", { student_id: f.student_id, class_id: f.class_id, method: f.method }) },
        { t: "3. Webhook VERIFIED (Public → 4 sesi; Core → 15/8 sesi)", k: ["trx_id", "trial_id"], fn: () => call("/api/webhook", { trx_id: f.trx_id, trial_id: f.trial_id || undefined }) },
        { t: "4. Attendance SES-XXXXXX + student (deduct −1)", k: ["session_id", "student_id", "hadir"], fn: () => call("/api/attendance", { session_id: f.session_id, student_id: f.student_id, hadir: f.hadir }) },
        { t: "5. Placement 50p DEWASA only (02, ATM baru)", k: ["pilot_student_id", "placement_total", "pre_check_score"], fn: () => call("/api/placement", { pilot_student_id: f.pilot_student_id, honesty_declaration: "Dikerjakan mandiri via konsol core.", language_use_score: 10, vocabulary_score: 10, reading_score: 8, listening_score: 7, writing_score: 7, writing_response: "Last weekend I visited my grandmother. Then we ate lunch together. After that I played football. Finally I went home.", pre_check_response: "Last weekend I visited my grandmother. Then we ate lunch together. After that I played football. Finally I went home.", pre_check_score: Number(f.pre_check_score) }) },
        { t: "5b. Entry Assessment KIDS 10-15 mnt (ATM baru)", k: ["pilot_student_id"], fn: () => call("/api/entry-assessment", { pilot_student_id: f.pilot_student_id, attendance: "ATTENDED", vocabulary: 4, confidence: 4 }) },
        { t: "6. Post-class pilot (03 max 10 + minat)", k: ["pilot_student_id", "pilot_class_id", "post_check_total", "interest_status"], fn: () => call("/api/postclass", { pilot_student_id: f.pilot_student_id, pilot_class_id: f.pilot_class_id, post_check_total: Number(f.post_check_total), interest_status: f.interest_status }) },
        { t: "7. Observasi guru (06 skala 1-5)", k: ["pilot_student_id", "pilot_class_id"], fn: () => call("/api/observation", { pilot_student_id: f.pilot_student_id, pilot_class_id: f.pilot_class_id, attendance: "ATTENDED", participation: 4, grammar: 4, fluency: 4 }) },
      ].map((b) => (
        <section key={b.t} style={{ border: "1px solid #B29E84", borderRadius: 12, padding: 14, margin: "12px 0", background: "#F7F3EC" }}>
          <b style={{ fontSize: 15, lineHeight: 1.4, display: "block", marginBottom: 8 }}>{b.t}</b>
          {b.k.map((k) => (
            <input key={k} style={inp} placeholder={k} value={(f as Record<string, string>)[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })} />
          ))}
          <button onClick={() => run(b.t, b.fn())} style={btn}>Kirim</button>
        </section>
      ))}
      <pre style={{ background: "#FFFFFF", border: "1px solid #B29E84", borderRadius: 12, padding: 14, overflowX: "auto", minHeight: 120, fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{out || "Hasil tampil di sini…"}</pre>
    </main>
  );
}
