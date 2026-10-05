import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import LogoutButton from "../student/LogoutButton";

// Layout restricted: hanya admin|teacher.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireRole(["admin", "teacher"]);
  if (!s) redirect("/masuk?next=/admin&need=admin");

  return (
    <div className="bg-ivory">
      <div className="border-b border-navy-deep bg-navy">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-1 px-4 py-3">
          <span className="mr-2 rounded-full bg-sand px-3 py-1 text-xs font-extrabold text-ink">
            PANEL GURU/ADMIN
          </span>
          <nav className="flex flex-wrap items-center gap-1">
            <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Student Master</Link>
            <Link href="/admin/operasional" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Operasional</Link>
            <Link href="/core" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Core Console</Link>
            <Link href="/" className="rounded-lg px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory">Landing</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-ivory/70 sm:inline">{s.role} • {s.sub}</span>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
