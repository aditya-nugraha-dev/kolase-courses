// GET /api/auth/me — kembalikan role+sub dari sesi terverifikasi, atau 401 generik.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { safeErrorMessage } from "@/lib/security";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ ok: false, error: safeErrorMessage(401) }, { status: 401 });
  return NextResponse.json({ ok: true, role: s.role, sub: s.sub, email: s.email ?? null });
}
