-- KOLASE — seed Public Class Pintu Masuk (jalankan SETELAH schema.sql)
-- 2026-09-15: ganti 4 Core P15 menjadi 2 Public Class. CORE max 5 tetap di API, PUBLIC max 50.
-- Fase testing: bersihkan dulu baris uji yang menunjuk katalog lama agar delete classes tidak kena FK,
-- lalu hapus katalog lama agar web hanya tampil Pintu Masuk (idempotent, aman diulang).
delete from sessions where enrollment_id in (select enrollment_id from class_membership where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02'));
delete from txn_entitlement_ledger where enrollment_id in (select enrollment_id from class_membership where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02'));
delete from class_membership where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from txn_payments where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from trials where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from pilot_postclass where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from pilot_observations where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from classes where id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
insert into classes (id, nama, level, jadwal, guru, harga, harga_coret, kuota, min_students, kategori, sesi_count, deskripsi, pilot_class_id, teacher_name, duration_minutes, class_status) values
('CLS-PUB-KIDS-01','Public Class - Pintu Masuk KOLASE (Kids Public Class)','KIDS','Sabtu 10:00 WIB (4 sesi @60 mnt)','Galang (TCH-000002)',50000,0,50,3,'PUBLIC',4,'Pintu masuk KOLASE anak 6-12 th. 4 sesi large-group ~50 siswa: Hello Its Me, My Favorite Things, My Day, I Can Speak English (showcase + invitation). Observasi 7 area, bukan placement/CEFR. Min. 3 pendaftar untuk mulai.','CLS-000001','Galang',60,'OPEN'),
('CLS-PUB-TEEN-01','Beginner English - Mass Entry Program (Adult/Teen)','TEEN','Minggu 13:00 WIB (4 sesi @60 mnt)','Hilal (TCH-000003)',75000,0,50,3,'PUBLIC',4,'Nama resmi KOL-AKD-MOD-002: Beginner English Mass Entry 4 sesi @60 mnt, ~50 peserta, Rp75.000. Tanpa asesmen awal. Lanjut via Diagnostic Placement 50 poin ke Small Group 6/10/15/30/45. Min. 3 pendaftar untuk mulai. Status COMING_SOON: belum bisa checkout.','CLS-000002','Hilal',60,'COMING_SOON')
on conflict (id) do update set nama=excluded.nama, level=excluded.level, jadwal=excluded.jadwal, guru=excluded.guru, harga=excluded.harga, kuota=excluded.kuota, min_students=excluded.min_students, kategori=excluded.kategori, sesi_count=excluded.sesi_count, deskripsi=excluded.deskripsi, pilot_class_id=excluded.pilot_class_id, teacher_name=excluded.teacher_name, duration_minutes=excluded.duration_minutes, class_status=excluded.class_status;

insert into mst_students (student_id, pilot_student_id, nama, email, wa, tgl_daftar) values
('STU-000001','STU-000001','Siswa Demo','siswa@demo.id','0812000001','2026-09-01')
on conflict (student_id) do nothing;

insert into mst_teachers (teacher_id, nama, email, wa) values
('TCH-000001','Ms. Sarah','sarah@kolase.id','0812000011')
on conflict (teacher_id) do nothing;

insert into mst_staff (staff_id, nama, email, wa, role) values
('ACT-000001','Mohammad Ahrenz Galang Maharsi','kolaseenglish@gmail.com','+90 505-930-20-45','author'),
('ACT-000002','Aditya Nugraha','darthrangert04@gmail.com','+62 896-2737-3322','staff')
on conflict (staff_id) do update set nama=excluded.nama, email=excluded.email, wa=excluded.wa, role=excluded.role;

-- PILOT HYBRID seed (00_CONFIG): jembatan CLS-000001 <-> CLS-A2-01 + guru pilot Galang/Hilal
insert into mst_teachers (teacher_id, nama, email, wa) values
('TCH-000002','Galang','galang@kolase.id','0812000012'),
('TCH-000003','Hilal','hilal@kolase.id','0812000013')
on conflict (teacher_id) do nothing;

-- Backfill jembatan pilot (idempotent)
update classes set pilot_class_id='CLS-000001', teacher_name='Galang', duration_minutes=60, class_status='OPEN' where id='CLS-PUB-KIDS-01';
update classes set pilot_class_id='CLS-000002', teacher_name='Hilal', duration_minutes=60, class_status='COMING_SOON' where id='CLS-PUB-TEEN-01';
update mst_students set pilot_student_id='STU-000001', full_name=nama where student_id='STU-000001';
