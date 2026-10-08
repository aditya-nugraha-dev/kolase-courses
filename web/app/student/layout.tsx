import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { STUDENT_AREA_ROLES } from "@/lib/session";
import StudentSidebar from "./StudentSidebar";

// Layout portal murid ala referensi: sidebar kiri + konten.
// Server guard (student + admin penuh); nama diambil best-effort untuk sidebar.
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const s = await requireRole([...STUDENT_AREA_ROLES]);
  if (!s) redirect("/masuk?next=/student&need=student");

  let displayName = "Murid KOLASE";
  try {
    const { supabaseServer } = await import("@/lib/supabase");
    const sb = supabaseServer();
    const { data } = await sb
      .from("mst_students")
      .select("nama,full_name,preferred_name")
      .eq("student_id", s.sub)
      .maybeSingle();
    if (data) {
      const d = data as Record<string, unknown>;
      const v =
        (typeof d.preferred_name === "string" && d.preferred_name) ||
        (typeof d.full_name === "string" && d.full_name) ||
        (typeof d.nama === "string" && d.nama) ||
        "";
      if (v) displayName = v;
    }
  } catch {
    /* fallback: nama generik */
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto flex w-full max-w-6xl items-stretch gap-0 lg:gap-6 lg:px-4 lg:py-6">
        <StudentSidebar name={displayName} studentId={s.sub} />
        <main className="min-w-0 flex-1 px-4 py-6 lg:rounded-3xl lg:bg-paper lg:p-6 lg:shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
