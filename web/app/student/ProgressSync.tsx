"use client";

import { useEffect } from "react";
import { setProgressOwner, syncProgressFromServer } from "@/lib/course-progress";

// Menandai pemilik progres (per akun) lalu menarik progres dari Supabase.
export default function ProgressSync({ studentId }: { studentId: string }) {
  useEffect(() => {
    setProgressOwner(studentId);
    void syncProgressFromServer();
  }, [studentId]);
  return null;
}
