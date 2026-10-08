"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  TrendingUp,
} from "lucide-react";

const NAV = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/kelas", label: "Kelas Saya", icon: BookOpen },
  { href: "/student/progress", label: "Progres", icon: TrendingUp },
];

const INSIGHT = [
  { href: "/student/kelas", label: "Jadwal Saya", icon: CalendarDays },
  { href: "/bantuan", label: "Bantuan", icon: LifeBuoy },
];

function isActive(path: string, href: string) {
  if (href === "/student") return path === "/student";
  return path.startsWith(href);
}

export default function StudentSidebar({
  name,
  studentId,
}: {
  name: string;
  studentId: string;
}) {
  const path = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const initial = (name.trim().charAt(0) || "K").toUpperCase();

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/");
  };

  return (
    <>
      {/* Desktop sidebar ala referensi */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-paper px-5 py-6 lg:flex">
        <p className="font-display text-xl font-extrabold text-ink">
          KOLASE<span className="text-sand-deep">.</span>
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-ivory p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-sand">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-ink">{name}</span>
            <span className="block truncate text-[11px] text-ink/55">{studentId}</span>
          </span>
        </div>

        <nav className="mt-6 space-y-1" aria-label="Portal murid">
          {NAV.map((n) => {
            const act = isActive(path, n.href);
            return (
              <Link
                key={n.href + n.label}
                href={n.href}
                aria-current={act ? "page" : undefined}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  act ? "bg-sand-soft font-extrabold text-ink" : "text-ink/55 hover:bg-ivory hover:text-ink"
                }`}
              >
                <n.icon size={17} className={act ? "text-sand-deep" : ""} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <p className="mt-7 px-3 text-xs font-extrabold text-ink">Insight<span className="text-sand-deep">.</span></p>
        <nav className="mt-2 space-y-1" aria-label="Insight">
          {INSIGHT.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/55 transition hover:bg-ivory hover:text-ink"
            >
              <n.icon size={17} />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <button
            onClick={logout}
            disabled={busy}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/55 transition hover:bg-ivory hover:text-ink disabled:opacity-60"
          >
            <LogOut size={17} /> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile: bar atas + nav geser */}
      <div className="border-b border-sand/40 bg-paper lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <p className="font-display text-lg font-extrabold text-ink">
            KOLASE<span className="text-sand-deep">.</span>
          </p>
          <span className="ml-auto flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-sand">
              {initial}
            </span>
            <span className="max-w-[140px] truncate text-xs font-bold text-ink/70">{studentId}</span>
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3" aria-label="Portal murid">
          {[...NAV, ...INSIGHT].map((n) => {
            const act = isActive(path, n.href);
            return (
              <Link
                key={n.label}
                href={n.href}
                aria-current={act ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold ${
                  act ? "border-ink bg-ink text-ivory" : "border-sand/40 bg-paper text-ink/65"
                }`}
              >
                <n.icon size={14} />
                {n.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            disabled={busy}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-sand/40 px-3.5 py-2 text-xs font-bold text-ink/65 disabled:opacity-60"
          >
            <LogOut size={14} /> Keluar
          </button>
        </nav>
      </div>
    </>
  );
}
