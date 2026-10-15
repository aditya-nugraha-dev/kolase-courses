// Contoh config (JANGAN commit file aslinya — sudah gitignored).
// Production (GitHub Pages): JANGAN commit — isi via repo Settings > Secrets:
//   SHEETS_ENDPOINT (+ opsional SHEETS_API_KEY). Workflow deploy-static.yml
//   menyuntik otomatis menjadi js/sheets-config.js saat deploy.
// Lokal: copy file ini menjadi sheets-config.js (folder yang sama), isi URL.
// Tanpa file ini, kiriman hanya antre di localStorage (mode mock).
window.KOLASE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/XXXX/exec";
window.KOLASE_SHEETS_KEY = ""; // isi jika set KOLASE_API_KEY di Apps Script
window.KOLASE_DEV = false;
