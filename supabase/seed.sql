-- KOLASE — seed Public Class Pintu Masuk (jalankan SETELAH schema.sql)
-- Hanya katalog kelas. Akun demo (student/teacher/staff) sudah dihapus.
delete from sessions where enrollment_id in (select enrollment_id from class_membership where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02'));
delete from txn_entitlement_ledger where enrollment_id in (select enrollment_id from class_membership where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02'));
delete from class_membership where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from txn_payments where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from trials where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from pilot_postclass where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from pilot_observations where class_id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
delete from classes where id in ('CLS-A1-01','CLS-A1-02','CLS-A2-01','CLS-A2-02');
insert into classes (id, nama, level, jadwal, guru, harga, harga_coret, kuota, min_students, kategori, sesi_count, deskripsi, pilot_class_id, teacher_name, duration_minutes, class_status) values
('CLS-PUB-KIDS-01','Public Class - Pintu Masuk KOLASE (Kids Public Class)','KIDS','Sabtu 10:00 WIB (4 sesi @60 mnt)','Galang',50000,0,50,3,'PUBLIC',4,'Pintu masuk KOLASE anak 6-12 th. 4 sesi large-group ~50 siswa: Hello Its Me, My Favorite Things, My Day, I Can Speak English (showcase + invitation). Observasi 7 area, bukan placement/CEFR. Min. 3 pendaftar untuk mulai.','CLS-000001','Galang',60,'OPEN'),
('CLS-PUB-TEEN-01','Beginner English - Mass Entry Program (Adult/Teen)','TEEN','Minggu 13:00 WIB (4 sesi @60 mnt)','Hilal (TCH-000003)',75000,0,50,3,'PUBLIC',4,'Nama resmi KOL-AKD-MOD-002: Beginner English Mass Entry 4 sesi @60 mnt, ~50 peserta, Rp75.000. Tanpa asesmen awal. Lanjut via Diagnostic Placement 50 poin ke Small Group 6/10/15/30/45. Min. 3 pendaftar untuk mulai. Status COMING_SOON: belum bisa checkout.','CLS-000002','Hilal',60,'COMING_SOON')
on conflict (id) do update set nama=excluded.nama, level=excluded.level, jadwal=excluded.jadwal, guru=excluded.guru, harga=excluded.harga, kuota=excluded.kuota, min_students=excluded.min_students, kategori=excluded.kategori, sesi_count=excluded.sesi_count, deskripsi=excluded.deskripsi, pilot_class_id=excluded.pilot_class_id, teacher_name=excluded.teacher_name, duration_minutes=excluded.duration_minutes, class_status=excluded.class_status;

-- Backfill jembatan pilot (idempotent)
update classes set pilot_class_id='CLS-000001', teacher_name='Galang', duration_minutes=60, class_status='OPEN' where id='CLS-PUB-KIDS-01';
update classes set pilot_class_id='CLS-000002', teacher_name='Hilal', duration_minutes=60, class_status='COMING_SOON' where id='CLS-PUB-TEEN-01';
