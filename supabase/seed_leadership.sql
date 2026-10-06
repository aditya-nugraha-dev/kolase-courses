-- KOLASE — seed akun leadership (INVITE-ONLY, jalankan di Supabase Dashboard > SQL Editor).
-- Pendaftaran mandiri founder/academic/systems DINONAKTIFKAN di /api/register + UI.
-- Cara pakai: ganti 3 email placeholder di bawah dengan email asli, lalu jalankan seluruh file.
-- Idempoten: aman dijalankan ulang (on conflict = update nama/email/role).

insert into mst_staff (staff_id, nama, email, wa, role) values
  ('ACT-000001', 'Ahrenz Galang', 'FILL-founder-email@example.id', '', 'founder'),
  ('ACT-000002', 'Hilal Ibrahim', 'FILL-academic-email@example.id', '', 'academic'),
  ('ACT-000003', 'Aditya Nugraha', 'FILL-systems-email@example.id', '', 'systems')
on conflict (staff_id) do update set
  nama = excluded.nama,
  email = excluded.email,
  role = excluded.role;
