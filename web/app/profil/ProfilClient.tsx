"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, LayoutDashboard, LogOut, MessagesSquare } from "lucide-react";
import { Badge, Card } from "../components/ui";

interface Me {
  ok: boolean;
  role: string;
  sub: string;
  email: string | null;
  nama: string;
}

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Staff • Admin",
  founder: "Staff • Founder",
  academic: "Staff • Academic",
  systems: "Staff • Systems",
};

export default function ProfilClient() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setMe(j as Me);
        else router.push("/masuk?next=/profil&need=login");
      })
      .catch(() => router.push("/masuk?next=/profil&need=login"));
  }, [router]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/");
    router.refresh();
  };

  if (!me) return <p className="px-4 py-8 text-center text-sm text-ink/60">Memuat profil…</p>;

  const initial = ((me.nama || me.sub || "K").trim().charAt(0) || "K").toUpperCase();
  const shortcuts =
    me.role === "student"
      ? [
          { href: "/student", icon: LayoutDashboard, t: "Dashboard", d: "Kelas, tugas, kalender, progres" },
          { href: "/chat", icon: MessagesSquare, t: "Chat Teacher", d: "Tanya guru kelasmu" },
          { href: "/kalender", icon: CalendarDays, t: "Kalender", d: "Jadwal semua sesi" },
        ]
      : me.role === "teacher"
        ? [
            { href: "/guru", icon: LayoutDashboard, t: "Portal Teacher", d: "Laporan, trial, materi" },
            { href: "/chat", icon: MessagesSquare, t: "Chat Student", d: "Balas chat murid" },
          ]
        : [
            { href: "/admin", icon: LayoutDashboard, t: "Dashboard Staff", d: "Student master & operasional" },
            { href: "/admin/pengguna", icon: LayoutDashboard, t: "Database", d: "Kelola teacher & student" },
            { href: "/chat", icon: MessagesSquare, t: "Chat", d: "Pantau chat murid" },
          ];

  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">PROFIL • AKUN SAYA</p>
        <div className="mt-4 flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-3xl font-extrabold text-sand">
            {initial}
          </span>
          <h1 className="font-display mt-3 text-2xl font-extrabold text-ink">{me.nama || me.sub}</h1>
          <p className="mt-1 text-sm text-ink/60">
            <code className="rounded bg-sand-soft px-2 py-0.5 font-bold">{me.sub}</code>
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Badge tone="navy">{ROLE_LABEL[me.role] ?? me.role}</Badge>
            {me.email && <Badge tone="slate">{me.email}</Badge>}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {shortcuts.map((x) => (
            <Link key={x.href + x.t} href={x.href} className="rounded-xl border border-sand/40 bg-paper p-4 hover:border-ink">
              <x.icon size={20} className="text-navy" />
              <p className="font-display mt-2 flex items-center gap-1 text-base font-extrabold text-ink">
                {x.t} <ArrowRight size={15} />
              </p>
              <p className="mt-0.5 text-xs text-ink/60">{x.d}</p>
            </Link>
          ))}
        </div>

        <Card className="mt-4 rounded-xl">
          <button
            onClick={() => void logout()}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-5 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50"
          >
            <LogOut size={16} /> Keluar dari Akun
          </button>
          <p className="mt-2 text-center text-xs text-ink/50">Setelah keluar, navbar kembali ke Home • Katalog • Kalender • Masuk.</p>
        </Card>
      </div>
    </div>
  );
}
