// POST /api/auth/staff — DINONAKTIFKAN. Login staff via Staff ID sudah dihapus.
import { NextResponse } from "next/server";
import { safeErrorMessage } from "@/lib/security";

export async function POST() {
  return NextResponse.json({ ok: false, error: safeErrorMessage(410) }, { status: 410 });
}
