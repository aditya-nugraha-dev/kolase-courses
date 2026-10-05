// KOLASE — Google Calendar API: proyeksikan sesi mingguan sebagai event.
// Standar seragam 60 menit/sesi (KOL-MAN-CORP-001). DEC-031: buffer guru min 15 menit antar sesi.
// Tanpa dependency tambahan (pakai fetch). Auth: OAuth2 refresh token milik
// akun Google operasional KOLASE; siswa & guru diundang sebagai attendees
// sehingga jadwal otomatis masuk ke kalender mereka. Lihat google-calendar/CALENDAR_SETUP.txt.

export const SESSION_DURATION_MIN = 60; // seragam 60 mnt (KOL-MAN-CORP-001)
export const TEACHER_BUFFER_MIN = 15; // BP-001 DEC-031 locked

export type CalSession = { seq: number; tanggal: string }; // tanggal: YYYY-MM-DD

export function calendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

async function getAccessToken(): Promise<string | null> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string };
  return json.access_token ?? null;
}

export async function createSessionEvents(opts: {
  sessions: CalSession[];
  refId: string; // ID acuan: class_id (sesi per kelas, KOL-POL-COD-001 §3.3)
  className: string;
  studentEmail?: string;
  teacherEmail?: string;
  meetUrl?: string;
  startTime?: string; // "10:00" WIB
  durationMin?: number; // seragam 60 mnt (KOL-MAN-CORP-001)
}) {
  const {
    sessions, refId, className,
    studentEmail, teacherEmail, meetUrl,
    startTime = "10:00", durationMin = SESSION_DURATION_MIN,
  } = opts;
  if (!calendarConfigured()) return { ok: false, skipped: true as const };
  const token = await getAccessToken();
  if (!token) return { ok: false, skipped: false as const, error: "gagal refresh access token" };

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const timeZone = "Asia/Jakarta";
  const attendees = [studentEmail, teacherEmail].filter(Boolean).map((email) => ({ email }));
  const created: string[] = [];
  const failed: { seq: number; error: string }[] = [];

  // DEC-031 conflict guard: tolak batch yang mengandung tanggal duplikat
  // (overlap sederhana; cek menyeluruh teacher/student/class dilakukan di scheduling engine).
  const seen = new Set(sessions.map((s) => s.tanggal));
  if (seen.size !== sessions.length) {
    return { ok: false, skipped: false as const, error: "conflict: tanggal sesi duplikat dalam batch" };
  }

  for (const s of sessions) {
    const [h, min] = startTime.split(":").map(Number);
    const endMin = min + durationMin;
    const pad = (n: number) => String(n).padStart(2, "0");
    const total = sessions.length;
    const body: Record<string, unknown> = {
      summary: `KOLASE ${className} — Sesi ${s.seq}/${total} (${durationMin} mnt)`,
      description:
        `Ref: ${refId}\n` +
        (meetUrl ? `Join: ${meetUrl}\n` : "") +
        `Durasi: ${durationMin} mnt (seragam 60) + buffer guru ${TEACHER_BUFFER_MIN} mnt.\n` +
        `Sumber kebenaran: database/Sheets KOLASE (Calendar hanya proyeksi).`,
      start: { dateTime: `${s.tanggal}T${pad(h)}:${pad(min)}:00`, timeZone },
      end: { dateTime: `${s.tanggal}T${pad(h + Math.floor(endMin / 60))}:${pad(endMin % 60)}:00`, timeZone },
      attendees: attendees.length ? attendees : undefined,
    };
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
        { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const json = (await res.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
      if (json.id) created.push(json.id);
      else failed.push({ seq: s.seq, error: json.error?.message || `HTTP ${res.status}` });
    } catch (e) {
      failed.push({ seq: s.seq, error: String(e) });
    }
  }
  return { ok: failed.length === 0, skipped: false as const, created: created.length, failed };
}
