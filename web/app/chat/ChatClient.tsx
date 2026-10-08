"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { Badge, Button, Card, Input } from "../components/ui";

interface Message {
  id: string;
  from: string;
  text: string;
  at: string;
}

interface Thread {
  student_id: string;
  student_name: string;
  messages: Message[];
}

interface ThreadSummary {
  student_id: string;
  student_name: string;
  count: number;
  last_text: string;
  last_at: string;
  last_from: string;
  unread_student: number;
  unread_staff: number;
}

function bubble(m: Message, mine: boolean) {
  const who = m.from.startsWith("student:") ? "Murid" : m.from.startsWith("teacher:") ? "Teacher" : "Staff";
  return (
    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${mine ? "bg-navy text-ivory" : "bg-ivory text-ink"}`}>
        <p className={`text-[10px] font-bold ${mine ? "text-sand" : "text-navy/70"}`}>{who} • {String(m.at).slice(11, 16)}</p>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{m.text}</p>
      </div>
    </div>
  );
}

export default function ChatClient() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [sub, setSub] = useState("");
  const [thread, setThread] = useState<Thread | null>(null);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeSid, setActiveSid] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setRole(String(j.role));
          setSub(String(j.sub));
        } else router.push("/masuk?next=/chat&need=login");
      })
      .catch(() => router.push("/masuk?next=/chat&need=login"));
  }, [router]);

  const isStaffSide = role !== "" && role !== "student";

  const loadThread = useCallback(async (sid?: string) => {
    try {
      const url = isStaffSide && sid ? `/api/chat?student_id=${encodeURIComponent(sid)}` : "/api/chat";
      const r = await fetch(url);
      const j = await r.json();
      if (j.ok && j.thread) setThread(j.thread as Thread);
    } catch { /* abaikan */ }
  }, [isStaffSide]);

  const loadList = useCallback(async () => {
    try {
      const r = await fetch("/api/chat?list=1");
      const j = await r.json();
      if (j.ok && Array.isArray(j.threads)) setThreads(j.threads as ThreadSummary[]);
    } catch { /* abaikan */ }
  }, []);

  // Polling ringan tiap 4 detik.
  useEffect(() => {
    if (!role) return;
    let live = true;
    if (isStaffSide && !activeSid) {
      (async () => {
        if (!live) return;
        await loadList();
      })();
      const t = window.setInterval(() => void loadList(), 4000);
      return () => {
        live = false;
        window.clearInterval(t);
      };
    }
    const sid = isStaffSide ? (activeSid ?? undefined) : undefined;
    (async () => {
      if (!live) return;
      await loadThread(sid);
    })();
    const t = window.setInterval(() => void loadThread(sid), 4000);
    return () => {
      live = false;
      window.clearInterval(t);
    };
  }, [role, isStaffSide, activeSid, loadThread, loadList]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread?.messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: isStaffSide ? (activeSid ?? "") : undefined, text: msg }),
      });
      const j = await r.json();
      if (j.ok) {
        setText("");
        await loadThread(isStaffSide ? (activeSid ?? undefined) : undefined);
        if (isStaffSide) await loadList();
      }
    } catch { /* abaikan */ } finally {
      setSending(false);
    }
  };

  if (!role) return <p className="px-4 py-8 text-center text-sm text-ink/60">Memuat chat…</p>;

  // Tampilan teacher/staff: daftar chat murid + detail.
  if (isStaffSide) {
    return (
      <div className="bg-ivory">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[320px_1fr]">
          <Card className={`rounded-xl ${activeSid ? "hidden lg:block" : ""}`}>
            <h1 className="font-display text-lg font-extrabold text-ink">Chat masuk dari murid</h1>
            <p className="mt-0.5 text-xs text-ink/60">Setiap teacher memegang chat dari murid — pilih untuk membalas.</p>
            <div className="mt-3 space-y-2">
              {threads.length === 0 && <p className="rounded-xl bg-ivory p-3 text-xs text-ink/55">Belum ada chat masuk.</p>}
              {threads.map((t) => (
                <button
                  key={t.student_id}
                  onClick={() => {
                    setActiveSid(t.student_id);
                    setThread(null);
                  }}
                  className={`w-full rounded-xl border p-3 text-left ${activeSid === t.student_id ? "border-ink bg-ivory" : "border-sand/40 bg-paper hover:border-sand-deep"}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <b className="truncate text-sm text-ink">{t.student_name || t.student_id}</b>
                    {t.unread_staff > 0 && (
                      <Badge tone="red">{t.unread_staff} baru</Badge>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink/55">{t.last_text || "—"}</span>
                  <span className="mt-0.5 block text-[10px] text-ink/40">{t.student_id} • {t.count} pesan</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className={`flex min-h-[60vh] flex-col rounded-xl ${activeSid ? "" : "hidden lg:flex"}`}>
            {!activeSid ? (
              <p className="m-auto text-sm text-ink/55">Pilih chat murid di sebelah kiri.</p>
            ) : (
              <>
                <div className="flex items-center gap-2 border-b border-sand/40 pb-3">
                  <button onClick={() => setActiveSid(null)} className="rounded-lg p-2 text-ink/60 hover:bg-ivory lg:hidden" aria-label="Kembali ke daftar">
                    <ArrowLeft size={17} />
                  </button>
                  <div>
                    <p className="text-sm font-extrabold text-ink">{thread?.student_name || activeSid}</p>
                    <p className="text-[11px] text-ink/55">{activeSid}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto py-3">
                  {(thread?.messages ?? []).map((m) => bubble(m, !m.from.startsWith("student:")))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={send} className="flex gap-2 border-t border-sand/40 pt-3">
                  <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Balas murid…" aria-label="Balas murid" maxLength={1000} />
                  <Button type="submit" disabled={sending || !text.trim()} aria-label="Kirim">
                    <SendHorizonal size={17} />
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Tampilan murid: 1 thread dengan teacher.
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <Card className="flex min-h-[70vh] flex-col rounded-xl">
          <div className="border-b border-sand/40 pb-3">
            <p className="text-xs font-extrabold tracking-[0.2em] text-navy">CHAT TEACHER</p>
            <h1 className="font-display mt-0.5 text-lg font-extrabold text-ink">Tanya Teacher KOLASE</h1>
            <p className="mt-0.5 text-xs text-ink/60">{sub} • Jadwal, materi, progres — dibalas teacher.</p>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto py-3">
            {(thread?.messages ?? []).length === 0 && (
              <p className="rounded-xl bg-ivory p-3 text-center text-xs text-ink/55">
                Belum ada pesan. Sapa teachermu — contoh: “Halo, kapan sesi berikutnya?”
              </p>
            )}
            {(thread?.messages ?? []).map((m) => bubble(m, m.from.startsWith("student:")))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-sand/40 pt-3">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan…" aria-label="Tulis pesan" maxLength={1000} />
            <Button type="submit" disabled={sending || !text.trim()} aria-label="Kirim">
              <SendHorizonal size={17} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
