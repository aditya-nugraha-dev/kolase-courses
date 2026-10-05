// KOLASE — helper sesi untuk Server Components / Route Handlers.
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyToken, type SessionPayload } from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireRole(roles: SessionPayload["role"][]): Promise<SessionPayload | null> {
  const s = await getSession();
  if (!s || !roles.includes(s.role)) return null;
  return s;
}
