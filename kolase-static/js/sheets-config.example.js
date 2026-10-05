// Contoh config server-side (JANGAN commit file aslinya). Cara pakai:
// 1) Copy file ini menjadi sheets-config.js (di folder yang sama, gitignored)
// 2) Isi URL Web App dari DEPLOY.txt / env APPS_SCRIPT_URL
// 3) Tambahkan <script src="js/sheets-config.js"></script> SEBELUM store.js di tiap HTML
window.KOLASE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/XXXX/exec";
window.KOLASE_SHEETS_KEY = ""; // isi jika set KOLASE_API_KEY di Apps Script
// Tombol "Demo cepat" di login.html HANYA tampil bila flag ini true.
// Biarkan false di production / file yang dibagikan ke publik.
window.KOLASE_DEV = false;
