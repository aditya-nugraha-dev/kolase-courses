# KOLASE Web — Next.js 16 (brand + operasional)

## Jalankan lokal
```bash
cd web
cp .env.example .env   # isi Supabase, Sheets, Calendar, Session, Admin key
npm install
npm run dev
```

## Halaman utama
- `/` landing (A2 + Little Speakers), `/program/little-speakers`
- `/daftar` registrasi + placement (Kids `<13` wajib data wali)
- `/bayar` konfirmasi pembayaran → `POST /api/payment-confirm`
- `/guru` session report + reschedule (login teacher/admin) → `POST /api/teacher-report`, `/api/reschedule`
- `/orang-tua` parent journey, `/konten` kalender + video Drive
- `/foto` upload & galeri foto per ID (STU/TCH/ACT/CLS/payment) → `POST /api/upload-photo`
- `/sertifikat` certificate + eBadge (cetak PDF), `/bantuan` SOP/FAQ
- `/student/*` portal murid, `/admin` student master, `/core` konsol internal

## Backend & data
- API hardened: rate-limit, honeypot, CSRF double-submit, timing anti-bot, Turnstile opsional, Zod + sanitasi.
- Supabase: jalankan `supabase/schema.sql` di SQL Editor. Tabel baru: `payment_confirmations`, `teacher_reports`, `reschedule_requests`, `photo_uploads` (+ kolom `photo_url` di master & `classes`).
- Sheets mirror via `SHEETS_ENDPOINT` + `SHEETS_API_KEY` (actions: register, checkout, payment_confirm, teacher_report, reschedule_request, placement, postclass, observation).
- Seed demo: `supabase/seed.sql`. Reset data uji: `supabase/reset_test_data.sql`.

## Go-live checklist
1. Isi `.env` (Supabase URL + service role, SESSION_SECRET 32 char, ADMIN_KEY, Sheets, Calendar, Turnstile).
2. Jalankan schema + seed di Supabase, buat akun teacher/staff via `/masuk` → Daftar.
3. Verifikasi alur: daftar (adult + kids), placement, checkout `/core`, konfirmasi `/bayar`, laporan `/guru`, cek `/admin` + Sheets.
4. Ganti logo bila ada update di `public/kolase-*` (primary black/white, icon black/white).

## QA
```bash
npm run lint
npm run build
```
