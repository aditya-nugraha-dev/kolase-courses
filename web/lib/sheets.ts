// KOLASE — forward ke Google Sheets via Apps Script Web App (Source of Truth).
// Legacy: register | checkout | verify | attendance (+ generic {tab,payload})
// Pilot hybrid V1.0: register_pilot | placement | postclass | observation (header pilot baris 3)

export function sheetsConfigured() {
  return Boolean(process.env.SHEETS_ENDPOINT);
}

export async function postSheets(body: Record<string, unknown>) {
  const endpoint = process.env.SHEETS_ENDPOINT;
  if (!endpoint) return { ok: false, skipped: true as const };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ ...body, key: process.env.SHEETS_API_KEY || "" }),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: json.ok === true, skipped: false as const, res: json };
  } catch (e) {
    return { ok: false, skipped: false as const, error: String(e) };
  }
}
