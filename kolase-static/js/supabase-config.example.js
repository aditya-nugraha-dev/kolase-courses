// KOLASE cloud config (JANGAN commit file aslinya — sudah gitignored).
// Lokal: copy file ini menjadi supabase-config.js (folder yang sama) lalu isi 2 nilai.
// Production (GitHub Pages): JANGAN commit — isi via repo Settings > Secrets:
//   SUPABASE_URL + SUPABASE_ANON_KEY (workflow deploy-static.yml menyuntik otomatis).
//   Tanpa secrets, deploy tetap jalan offline (localStorage per-perangkat).
// Isi dari Supabase Dashboard > Project Settings > Data API:
//   - Project URL -> KOLASE_SUPABASE_URL
//   - anon public key -> KOLASE_SUPABASE_ANON_KEY (aman untuk site statis via RLS+RPC)
// Syarat DB: di Supabase > SQL Editor jalankan schema.sql, lalu auth_sync.sql.
window.KOLASE_SUPABASE_URL = "https://xxxx.supabase.co";
window.KOLASE_SUPABASE_ANON_KEY = "isi-anon-key-di-sini";
