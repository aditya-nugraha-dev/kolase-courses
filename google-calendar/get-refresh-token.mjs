// KOLASE — ambil Google OAuth refresh token (sekali saja, ~2 menit).
// Syarat: OAuth Client ID/Secret dari Google Cloud (lihat CALENDAR_SETUP.txt langkah 1-2),
// dan redirect URI http://localhost:53682/callback sudah didaftarkan di client tersebut.
//
// Cara pakai:
//   node get-refresh-token.mjs --client-id=XXX --client-secret=YYY
// Buka URL yang muncul, klik Allow, refresh token langsung tercetak.
// Node 18+ (pakai fetch + http bawaan, tanpa install apa pun).

import http from "node:http";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), "true"];
  })
);

const client_id = args["client-id"];
const client_secret = args["client-secret"];
if (!client_id || !client_secret) {
  console.error("Pakai: node get-refresh-token.mjs --client-id=XXX --client-secret=YYY");
  process.exit(1);
}

const PORT = 53682;
const redirect_uri = `http://localhost:${PORT}/callback`;
const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
  });

console.log("\n1) Buka URL ini di browser:\n\n" + authUrl + "\n\n2) Klik Allow, lalu tunggu di sini...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const code = url.searchParams.get("code");
  if (url.pathname !== "/callback" || !code) {
    res.writeHead(404).end("Tunggu callback Google...");
    return;
  }
  res.end("OK! Kembali ke terminal.");
  server.close();
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id, client_secret, redirect_uri, grant_type: "authorization_code" }),
  });
  const json = await tokenRes.json().catch(() => ({}));
  if (json.refresh_token) {
    console.log("\n=== BERHASIL ===\nGOOGLE_REFRESH_TOKEN=" + json.refresh_token + "\n\nSimpan ke web/.env\n");
  } else {
    console.log("\nGAGAL, respons Google:\n" + JSON.stringify(json, null, 2));
  }
});
server.listen(PORT);
