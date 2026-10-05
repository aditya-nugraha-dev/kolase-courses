import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/session";

// Halaman guru: admin penuh (sama seperti /admin).
export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const s = await requireRole([...ADMIN_ROLES]);
  if (!s) redirect("/masuk?next=/guru&need=admin");
  return <>{children}</>;
}
