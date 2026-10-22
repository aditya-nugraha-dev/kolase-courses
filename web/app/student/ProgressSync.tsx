"use client";

import { useEffect } from "react";
import { setProgressOwner, syncProgressFromServer } from "@/lib/course-progress";
import { touchStreak } from "@/lib/rewards";

// Menandai pemilik progres (per akun) lalu menarik progres dari Supabase.
// Streak dicatat setelah owner diketahui agar tersimpan per murid.
export default function ProgressSync({ studentId }: { studentId: string }) {
  useEffect(() => {
    setProgressOwner(studentId);
    touchStreak();
    void syncProgressFromServer();
  }, [studentId]);
  return null;
}
