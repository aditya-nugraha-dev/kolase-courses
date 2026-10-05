-- KOLASE — reset data UJI pendaftar (jalankan di Supabase Dashboard > SQL Editor)
-- HATI-HATI: hanya baris pola ID lama (STD-%) yang dihapus. Data STU-XXXXXX / TXN-YYYY-#### TIDAK tersentuh.
-- audit_log sengaja dipertahankan sebagai jejak audit. Jalankan SETELAH backup/Export CSV.
-- Urutan delete mengikuti foreign key (anak dulu, induk belakangan).

begin;

delete from txn_teacher_payroll_guard
where session_id in (
  select s.session_id from sessions s
  join class_membership m on m.enrollment_id = s.enrollment_id
  where m.student_id like 'STD-%'
);
delete from sessions
where enrollment_id in (select enrollment_id from class_membership where student_id like 'STD-%');
delete from txn_entitlement_ledger where student_id like 'STD-%';
delete from class_membership where student_id like 'STD-%';
delete from txn_payments where student_id like 'STD-%';
delete from trials where student_id like 'STD-%';
delete from pilot_registrations where student_id like 'STD-%';
delete from pilot_placements where student_id like 'STD-%';
delete from pilot_postclass where student_id like 'STD-%';
delete from pilot_observations where student_id like 'STD-%';
delete from mst_students where student_id like 'STD-%';

commit;

-- Verifikasi sisa (harus 0 untuk pola STD-%):
select 'mst_students' as tabel, count(*) as sisa_std from mst_students where student_id like 'STD-%'
union all select 'txn_payments', count(*) from txn_payments where student_id like 'STD-%'
union all select 'class_membership', count(*) from class_membership where student_id like 'STD-%'
union all select 'sessions', count(*) from sessions where enrollment_id in (select enrollment_id from class_membership where student_id like 'STD-%');

-- OPSIONAL (hapus juga data uji format BARU STU-*, kecuali akun demo STU-000001):
-- Buka komentar blok di bawah ini bila ingin bersih total. Tetap backup dulu.
/*
begin;
delete from txn_teacher_payroll_guard where session_id in (
  select s.session_id from sessions s
  join class_membership m on m.enrollment_id = s.enrollment_id
  where m.student_id <> 'STU-000001'
);
delete from sessions where enrollment_id in (select enrollment_id from class_membership where student_id <> 'STU-000001');
delete from txn_entitlement_ledger where student_id <> 'STU-000001';
delete from class_membership where student_id <> 'STU-000001';
delete from txn_payments where student_id <> 'STU-000001';
delete from trials where student_id <> 'STU-000001';
delete from pilot_registrations where student_id <> 'STU-000001';
delete from pilot_placements where student_id <> 'STU-000001';
delete from pilot_postclass where student_id <> 'STU-000001';
delete from pilot_observations where student_id <> 'STU-000001';
delete from mst_students where student_id <> 'STU-000001';
-- Baris yatim tanpa student (kasus uji entry-assessment tanpa ID cocok):
delete from pilot_registrations where student_id is null;
delete from pilot_placements where student_id is null;
delete from pilot_postclass where student_id is null;
delete from pilot_observations where student_id is null;
commit;
*/
