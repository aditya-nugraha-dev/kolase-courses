import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

// Halaman guru: hanya admin|teacher (sama seperti /admin).
export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const s = await requireRole(["admin", "teacher"]);
  if (!s) redirect("/masuk?next=/guru&need=admin");
  return <>{children}</>;
}
