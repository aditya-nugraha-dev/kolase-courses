import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

// Layout khusus murid: server guard (sesi student|admin|teacher) + sub-navigasi portal.
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const s = await requireRole(["student", "admin", "teacher"]);
  if (!s) redirect("/masuk?next=/student&need=student");

  return (
    <div className="bg-ivory">
      <div className="border-b border-navy-deep bg-navy">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-1 px-4 py-3">
          <span className="mr-2 rounded-full bg-sand px-3 py-1 text-xs font-extrabold text-ink">
            PORTAL MURID
          </span>
          <nav className="flex flex-wrap items-center gap-1">
            <Link href="/student" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Overview</Link>
            <Link href="/student/kelas" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Kelas & Materi</Link>
            <Link href="/student/progress" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Feedback & Progres</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-ivory/70 sm:inline">{s.sub}</span>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
