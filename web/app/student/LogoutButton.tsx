"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
        router.push("/");
      }}
      disabled={busy}
      className="rounded-lg px-3 py-2 text-sm font-semibold text-ivory/85 hover:bg-white/10 hover:text-ivory disabled:opacity-60"
    >
      <span className="inline-flex items-center gap-1.5"><LogOut size={15} /> Keluar</span>
    </button>
  );
}
