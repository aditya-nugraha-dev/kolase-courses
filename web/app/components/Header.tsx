"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Gift, LogOut } from "lucide-react";
import MobileMenu from "./MobileMenu";

// Navbar per-role: guest (Home, Katalog, Kalender, Masuk + CTA trial),
// student (Dashboard, Kalender, Chat, Profil), teacher (Dashboard, Chat, Profil),
// staff (Dashboard, Kalender, Chat, Database, Profil). Logo mengarah ke dashboard
// masing-masing peran (student tidak lagi melihat Home).
interface NavLink {
  href: string;
  label: string;
}

const GUEST_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/katalog", label: "Katalog" },
  { href: "/kalender", label: "Kalender" },
  { href: "/masuk", label: "Masuk / Signup" },
];

const STUDENT_LINKS: NavLink[] = [
  { href: "/student", label: "Dashboard" },
  { href: "/kalender", label: "Kalender" },
  { href: "/chat", label: "Chat Teacher" },
  { href: "/profil", label: "Profil" },
];

const TEACHER_LINKS: NavLink[] = [
  { href: "/guru", label: "Dashboard" },
  { href: "/chat", label: "Chat Student" },
  { href: "/profil", label: "Profil" },
];

const STAFF_LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/kalender", label: "Kalender" },
  { href: "/chat", label: "Chat" },
  { href: "/admin/pengguna", label: "Database" },
  { href: "/profil", label: "Profil" },
];

const STAFF_ROLES = ["admin", "founder", "academic", "systems"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (live) setRole(j.ok && typeof j.role === "string" ? j.role : null);
      })
      .catch(() => {
        if (live) setRole(null);
      })
      .finally(() => {
        if (live) setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, [pathname]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setRole(null);
    router.push("/");
    router.refresh();
  };

  const isStaff = role !== null && STAFF_ROLES.includes(role);
  const links = !loaded || role === null ? GUEST_LINKS : role === "student" ? STUDENT_LINKS : role === "teacher" ? TEACHER_LINKS : isStaff ? STAFF_LINKS : GUEST_LINKS;
  const logoHref = role === "student" ? "/student" : role === "teacher" ? "/guru" : isStaff ? "/admin" : "/";
  const loggedIn = loaded && role !== null;
  const showTrialCta = !loggedIn || role === "student";

  return (
    <header className="sticky top-0 z-50 border-b border-violet/15 bg-paper/95 backdrop-blur">
      <div className="h-1 bg-gradient-to-r from-violet via-sand to-cyan" />
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <Link href={logoHref} className="flex items-center gap-3" aria-label="KOLASE English Academy — ke dashboard">
          <Image
            src="/brand/kolase-wordmark-blue.png"
            alt="KOLASE English Academy"
            width={172}
            height={49}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                pathname === l.href
                  ? "bg-sand-soft font-extrabold text-navy"
                  : "text-ink/65 hover:bg-sand-soft hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {showTrialCta && (
          <Link
            href="/daftar"
            className={`hidden items-center gap-1.5 rounded-xl bg-sand px-4 py-2 text-sm font-bold text-ink transition hover:bg-sand-deep sm:inline-flex ${loggedIn ? "lg:hidden" : ""}`}
          >
            <Gift size={15} /> Trial 7 Sesi Gratis
          </Link>
        )}
        {!loggedIn && (
          <Link href="/masuk" className="hidden rounded-xl border border-violet/25 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-sand-soft lg:inline-flex">
            Masuk
          </Link>
        )}
        {loggedIn && (
          <button
            onClick={() => void logout()}
            className="hidden items-center gap-1.5 rounded-xl border border-violet/25 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-sand-soft lg:inline-flex"
          >
            <LogOut size={15} /> Keluar
          </button>
        )}
        <MobileMenu links={links} showTrialCta={showTrialCta} loggedIn={loggedIn} onLogout={() => void logout()} />
      </div>
    </header>
  );
}
