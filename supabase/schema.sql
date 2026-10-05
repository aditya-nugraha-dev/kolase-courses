-- KOLASE — Supabase/Postgres schema (mirror Google Sheets tabs)
-- Jalankan di Supabase Dashboard > SQL Editor (copy-paste seluruh file).
-- ID memakai TEXT agar format STU-XXXXXX / TXN-YYYY-#### / SES-XXXXXX (KOL-POL-COD-001) terjaga.

-- ===== Master =====
-- PUBLIC CLASS 2026-09-15: katalog diganti dari Core P15 (kuota 5, 15 sesi, 90') ke
-- Public Class Pintu Masuk (kuota 50, 4 sesi, 60'). CORE max 5 tetap di API, PUBLIC max 50.
create table if not exists classes (
  id text primary key,
  nama text not null,
  level text not null check (level in ('A1','A2','B1','PUB','KIDS','TEEN')), -- A1/A2/B1 CEFR (KOL-AKD-MOD-002)
  jadwal text not null,
  guru text not null,
  harga integer not null check (harga >= 0),
  harga_coret integer not null default 0,
  kuota integer not null default 50 check (kuota between 1 and 50), -- PUBLIC 50; CORE tetap dibatasi max 5 di API (BP-001 DEC-005)
  min_students integer not null default 3 check (min_students between 1 and 5), -- Rombel <3: tunda max 7 hari / format duo (SOP-INT)
  kategori text not null default 'PUBLIC' check (kategori in ('PUBLIC','CORE')),
  sesi_count integer not null default 4 check (sesi_count between 1 and 30), -- PUBLIC 4 sesi; CORE 15/30/45
  deskripsi text default '',
  meet text default '',
  slides text default '',
  gform text default ''
);

create table if not exists mst_students (
  student_id text primary key, -- STU-XXXXXX seumur hidup (KOL-POL-COD-001 §3.1)
  nama text not null,
  email text not null,
  wa text default '',
  tgl_daftar date not null default current_date
);

create table if not exists mst_teachers (
  teacher_id text primary key, -- TCH-XXXXXX
  nama text not null,
  email text not null,
  wa text default ''
);

create table if not exists mst_staff (
  staff_id text primary key, -- ACT-XXXXXX
  nama text not null,
  email text not null,
  wa text default '',
  role text not null default 'admin'
);

-- ===== Transaksi & ledger =====
create table if not exists txn_payments (
  trx_id text primary key, -- TXN-YYYY-#### (terbit setelah dana terverifikasi)
  enrollment_id text not null, -- ENR-XXXXXX (kunci internal prototype)
  student_id text not null references mst_students(student_id),
  class_id text not null references classes(id),
  nominal integer not null,
  method text not null, -- QRIS / Bank Transfer (VA) / E-Wallet
  status text not null default 'PENDING' check (status in ('PENDING','VERIFIED','FAILED')),
  tgl timestamptz not null default now(),
  tgl_verifikasi timestamptz
);
create index if not exists idx_pay_enr on txn_payments(enrollment_id);

create table if not exists class_membership (
  enrollment_id text primary key, -- ENR-XXXXXX (kunci internal prototype)
  student_id text not null references mst_students(student_id),
  class_id text not null references classes(id),
  status text not null default 'PENDING' check (status in ('PENDING','ACTIVE','EXPIRED')),
  sisa integer not null default 0 check (sisa >= 0), -- ledger-derived; update hanya via webhook/attendance, bukan edit manual (BP-001)
  activated_at timestamptz, -- = tgl_verifikasi (activation = verification date)
  expires_at date, -- PUBLIC 1 bln / CORE 2 bln dari activation
  trial_id text, -- TRL-XXXXXX yang dikreditkan (null bila beli langsung tanpa trial) per DEC-006
  trial_credit_applied boolean not null default false -- true bila -7 sudah diposting exactly once
);

-- BP-001 DEC-006 + DEC-029: 7 sesi trial gratis (6 belajar + Sesi 7 Progress Test), free, teacher cost 7x65k=455k per kelas.
create table if not exists trials (
  trial_id text primary key, -- TRL-XXXXXX (alur prototype; tidak ada di dokumen Drive)
  student_id text not null references mst_students(student_id),
  class_id text not null references classes(id),
  status text not null default 'STARTED' check (status in ('STARTED','COMPLETED','CONVERTED','DROPPED')),
  sessions_delivered integer not null default 0 check (sessions_delivered between 0 and 7),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_trials_student on trials(student_id);

create table if not exists sessions (
  session_id text primary key, -- SES-XXXXXX-ENR-XXXXXX (interim per-enrollment; dokumen: SES per jadwal kelas)
  enrollment_id text not null references class_membership(enrollment_id) on delete cascade,
  seq integer not null check (seq between 1 and 45), -- paket maks 45 sesi (KOL-AKD-MOD-002)
  tanggal date not null,
  -- PRESENT/LATE/STUDENT_NO_SHOW/STUDENT_CANCELLED_LATE = deduct -1;
  -- VALID_STUDENT_CANCEL (izin min 6 jam, SOP-CLS) /TEACHER_CANCELLED/ACADEMY_CANCELLED/RESCHEDULED = 0.
  -- ABSENT/CANCELLED dipertahankan sebagai legacy alias (map ke NO_SHOW / VALID_CANCEL di API).
  hadir text check (hadir in ('PRESENT','LATE','STUDENT_NO_SHOW','STUDENT_CANCELLED_LATE','VALID_STUDENT_CANCEL','TEACHER_CANCELLED','ACADEMY_CANCELLED','RESCHEDULED','ABSENT','CANCELLED')),
  status text not null default 'SCHEDULED',
  unique (enrollment_id, seq)
);

-- Sesi per JADWAL KELAS (kanonikal KOL-POL-COD-001 §3.3): 1 SES-XXXXXX = 1 pertemuan 60 mnt
-- satu rombel. Absensi guru dicatat per (session_id, student_id) sebagai dasar honor.
create table if not exists class_sessions (
  session_id text primary key, -- SES-XXXXXX
  class_id text not null references classes(id) on delete cascade,
  seq integer not null check (seq between 1 and 45),
  tanggal date not null,
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED','DONE','CANCELLED','RESCHEDULED')),
  unique (class_id, seq)
);
create table if not exists session_attendance (
  session_id text not null references class_sessions(session_id) on delete cascade,
  student_id text not null references mst_students(student_id) on delete cascade,
  hadir text not null check (hadir in ('PRESENT','LATE','STUDENT_NO_SHOW','STUDENT_CANCELLED_LATE','VALID_STUDENT_CANCEL','TEACHER_CANCELLED','ACADEMY_CANCELLED','RESCHEDULED','ABSENT','CANCELLED')),
  recorded_by text not null default '',
  recorded_at timestamptz not null default now(),
  primary key (session_id, student_id) -- 1 siswa max 1 catatan per sesi (idempoten)
);
create index if not exists idx_csession_class on class_sessions(class_id);

create table if not exists txn_entitlement_ledger (
  id bigserial primary key,
  at timestamptz not null default now(),
  enrollment_id text not null references class_membership(enrollment_id) on delete cascade,
  student_id text not null references mst_students(student_id),
  delta integer not null, -- +N grant saat VERIFIED (PUBLIC 4 / CORE 15) / -7 trial recognition / -1 deduct / 0 valid cancel
  reason text not null, -- PAYMENT_VERIFIED | TRIAL_RECOGNITION | ATTENDANCE_* | FINAL_TEST
  balance_after integer not null -- BP-011: boleh negatif sebagai integrity exception; JANGAN sembunyikan dengan MAX(0)
);
create index if not exists idx_ledger_enr on txn_entitlement_ledger(enrollment_id);
-- BP-011 idempotency: 1 enrollment hanya boleh punya 1 grant PAYMENT_VERIFIED + 1x TRIAL_RECOGNITION (exactly once DEC-006).
create unique index if not exists uq_ledger_enr_verified on txn_entitlement_ledger(enrollment_id, reason) where reason = 'PAYMENT_VERIFIED';
create unique index if not exists uq_ledger_enr_trialrec on txn_entitlement_ledger(enrollment_id, reason) where reason = 'TRIAL_RECOGNITION';

-- BP-011 DEC-008: audit log minimal (siapa-apa-kapan-objek-mengapa). Append-only, jangan diedit/hapus manual.
create table if not exists audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor text not null default 'system', -- STU/TCH/ACT ID atau 'system'/'webhook'
  action text not null, -- REGISTER/CHECKOUT/VERIFY/ATTENDANCE
  object_type text not null, -- PAYMENT/MEMBERSHIP/SESSION/LEDGER
  object_id text not null,
  reason text not null default '',
  meta jsonb not null default '{}'
);
create index if not exists idx_audit_obj on audit_log(object_type, object_id);

-- Payroll dibayar per SESI ROMBEL kelas @Rp65.000 (Single Rate Policy, KOL-MAN-CORP-001 §4.1).
-- Grain sesi kode saat ini masih per-enrollment (SES-XXXXXX-ENR-XXXXXX); dokumen menetapkan SES per jadwal
-- kelas. Tabel di bawah mencegah double-pay per session_id sebagai guard minimal sebelum migrasi grain tersebut.
create table if not exists txn_teacher_payroll_guard (
  session_id text primary key, -- SES-XXXXXX-ENR-XXXXXX (interim; 1 Session ID max 1 payroll txn)
  pay_id text not null default '', -- PAY-YYYY-#### diterbitkan saat transfer honor (KOL-POL-COD-001 §3.5)
  teacher_id text default '',
  amount integer not null default 65000 check (amount = 65000), -- locked rate Rp65.000/sesi kelas 60 mnt
  period text not null default '', -- YYYY-MM
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','PAID'))
);

-- ===== RLS (prototype): aktif + policy baca publik untuk katalog,
-- tulis via service_role (API Next.js). Ketatkan sebelum production. =====
alter table classes enable row level security;
alter table mst_students enable row level security;
alter table mst_teachers enable row level security;
alter table mst_staff enable row level security;
alter table txn_payments enable row level security;
alter table class_membership enable row level security;
alter table trials enable row level security;
alter table sessions enable row level security;
alter table class_sessions enable row level security;
alter table session_attendance enable row level security;
alter table txn_entitlement_ledger enable row level security;
alter table audit_log enable row level security;
alter table txn_teacher_payroll_guard enable row level security;

drop policy if exists "public read classes" on classes;
create policy "public read classes" on classes for select using (true);

-- ===== PILOT HYBRID — aditif, tanpa merusak ledger =====
-- Spreadsheet SoT: 00_CONFIG s/d 06_TEACHER_OBSERVATION, ID STU-XXXXXX / CLS-XXXXXX (KOL-POL-COD-001).
-- Strategi hybrid: STU tunggal seumur hidup di mst_students.student_id (= pilot_student_id).

-- 1) Jembatan ID di master yang sudah ada
alter table mst_students add column if not exists pilot_student_id text;
alter table mst_students add column if not exists segment text default ''; -- KIDS (6-12) | TEENS_ADULTS (13+)
alter table mst_students add column if not exists full_name text default '';
alter table mst_students add column if not exists preferred_name text default '';
alter table mst_students add column if not exists age_group text default '';
alter table mst_students add column if not exists guardian_name text default '';
alter table mst_students add column if not exists guardian_whatsapp text default '';
alter table mst_students add column if not exists guardian_consent text default '';
alter table mst_students add column if not exists domicile text default '';
alter table mst_students add column if not exists current_activity text default '';
alter table mst_students add column if not exists learning_goal text default '';
alter table mst_students add column if not exists main_difficulty text default '';
alter table mst_students add column if not exists current_status text default 'REGISTERED';
alter table mst_students add column if not exists placement_total integer;
alter table mst_students add column if not exists a2_fit text default '';
alter table mst_students add column if not exists pre_check_score integer;
alter table mst_students add column if not exists post_check_score integer;
alter table mst_students add column if not exists gain_score integer;
alter table mst_students add column if not exists confirmation_status text default 'PENDING';
alter table mst_students add column if not exists attendance_status text default '';
alter table mst_students add column if not exists learning_objective_result text default '';
alter table mst_students add column if not exists interest_status text default '';
alter table mst_students add column if not exists follow_up_status text default '';
alter table mst_students add column if not exists last_updated timestamptz default now();
create unique index if not exists uq_students_pilot_id on mst_students(pilot_student_id) where pilot_student_id is not null and pilot_student_id <> '';

alter table classes add column if not exists pilot_class_id text;
alter table classes add column if not exists class_date date;
alter table classes add column if not exists start_time text default '';
alter table classes add column if not exists end_time text default '';
alter table classes add column if not exists duration_minutes integer default 60; -- seragam 60 mnt (KOL-MAN-CORP-001)
alter table classes add column if not exists teacher_name text default '';
alter table classes add column if not exists meet_link text default '';
alter table classes add column if not exists learning_objective text default '';
alter table classes add column if not exists slides_link text default '';
alter table classes add column if not exists placement_form_link text default '';
alter table classes add column if not exists post_class_form_link text default '';
alter table classes add column if not exists class_status text default 'DRAFT';
create unique index if not exists uq_classes_pilot_id on classes(pilot_class_id) where pilot_class_id is not null and pilot_class_id <> '';

-- 2) Funnel pilot (mirror 01 / 02 / 03 / 06). Grain per baris form/observasi.
create table if not exists pilot_registrations (
  id bigserial primary key,
  student_id text references mst_students(student_id),
  pilot_student_id text default '',
  full_name text default '',
  preferred_name text default '',
  email text default '',
  whatsapp text default '',
  age text default '',
  domicile text default '',
  current_activity text default '',
  learning_goal text default '',
  main_difficulty text default '',
  schedule_option text default '',
  guardian_name text default '',
  guardian_whatsapp text default '',
  guardian_consent text default '',
  created_at timestamptz not null default now()
);
create table if not exists pilot_placements (
  id bigserial primary key,
  attempt_id text default '', -- ATM-######, satu pengerjaan satu ATM (KOL-POL-COD-001 §3.6)
  student_id text references mst_students(student_id),
  pilot_student_id text default '',
  language_use_score integer default 0,
  vocabulary_score integer default 0,
  reading_score integer default 0,
  listening_score integer default 0,
  placement_auto_score integer default 0,
  writing_score integer default 0,
  placement_total integer default 0 check (placement_total between 0 and 50),
  pre_check_score integer default 0 check (pre_check_score between 0 and 10),
  created_at timestamptz not null default now()
);
create table if not exists pilot_postclass (
  id bigserial primary key,
  attempt_id text default '', -- ATM-###### bila post-check dihitung sebagai attempt
  student_id text references mst_students(student_id),
  class_id text references classes(id),
  pilot_student_id text default '',
  pilot_class_id text default '',
  post_check_total integer default 0 check (post_check_total between 0 and 10),
  interest_status text default '',
  contact_consent text default '',
  technical_issue text default '',
  created_at timestamptz not null default now()
);
create table if not exists pilot_observations (
  observation_id text primary key,
  attempt_id text default '', -- ATM-###### untuk Kids Entry Assessment (KOL-POL-COD-001 §3.6)
  student_id text references mst_students(student_id),
  class_id text references classes(id),
  pilot_student_id text default '',
  pilot_class_id text default '',
  attendance text default '',
  baseline_performance integer,
  participation integer,
  grammar_score integer,
  vocabulary integer,
  fluency integer,
  interaction_score integer,
  final_performance integer,
  learning_objective_result text default '',
  recommendation text default '',
  recorded_by text default '',
  recorded_at timestamptz default now()
);

alter table pilot_registrations enable row level security;
alter table pilot_placements enable row level security;
alter table pilot_postclass enable row level security;
alter table pilot_observations enable row level security;
drop policy if exists "public read pilot_classes" on classes;
create policy "public read pilot_classes" on classes for select using (true);

-- ===== OPERASIONAL BARU (pengganti GForm website) =====
-- Konfirmasi pembayaran, laporan sesi guru, request reschedule.
-- Tulis via service_role (API Next.js). Ketatkan sebelum production.
create table if not exists payment_confirmations (
  id bigserial primary key,
  nama text not null,
  student_id text not null references mst_students(student_id),
  program text not null default '',
  method text not null default 'QRIS',
  tanggal date,
  nominal integer not null check (nominal >= 0),
  bukti_url text not null default '',
  status text not null default 'PENDING' check (status in ('PENDING','VERIFIED','REJECTED')),
  created_at timestamptz not null default now()
);
create index if not exists idx_payconf_student on payment_confirmations(student_id);
create table if not exists teacher_reports (
  id bigserial primary key,
  class_id text not null references classes(id),
  tanggal date,
  materi text not null default '',
  hadir text not null default '',
  catatan text not null default '',
  reported_by text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_treport_class on teacher_reports(class_id);
create table if not exists reschedule_requests (
  id bigserial primary key,
  class_id text not null references classes(id),
  lama text not null default '',
  baru text not null default '',
  alasan text not null default '',
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  requested_by text not null default '',
  created_at timestamptz not null default now()
);
alter table payment_confirmations enable row level security;
alter table teacher_reports enable row level security;
alter table reschedule_requests enable row level security;

-- ===== MIGRASI PUBLIC CLASS 2026-09-15 (jalankan juga di DB lama) =====
-- DB lama masih punya check level A1/A2 + kuota 1-5. Blok ini melonggarkan tanpa hapus data.
alter table classes add column if not exists kategori text not null default 'PUBLIC';
alter table classes add column if not exists sesi_count integer not null default 4;
alter table classes add column if not exists min_students integer not null default 3;
alter table mst_students add column if not exists segment text default '';
alter table mst_staff add column if not exists wa text default '';
alter table pilot_placements add column if not exists attempt_id text default '';
alter table pilot_postclass add column if not exists attempt_id text default '';
alter table pilot_observations add column if not exists attempt_id text default '';
alter table txn_teacher_payroll_guard add column if not exists pay_id text default '';
do $$ begin
  begin alter table classes drop constraint if exists classes_level_check; exception when others then null; end;
  begin alter table classes drop constraint if exists classes_kuota_check; exception when others then null; end;
  begin alter table classes add constraint classes_level_check check (level in ('A1','A2','B1','PUB','KIDS','TEEN')); exception when duplicate_object then null; end;
  begin alter table classes add constraint classes_kuota_check check (kuota between 1 and 50); exception when duplicate_object then null; end;
  begin alter table classes add constraint classes_kategori_check check (kategori in ('PUBLIC','CORE')); exception when duplicate_object then null; end;
end $$;

-- ===== FOTO PER ID (website /foto + POST /api/upload-photo) =====
-- 1 baris = 1 file foto untuk student/teacher/staff/class/payment.
-- Penyimpanan file: public/uploads/<entity>/ (server Next.js).
-- Kolom photo_url di master = foto utama (1 per ID, diupdate dari foto terbaru).
create table if not exists photo_uploads (
  id bigserial primary key,
  entity_type text not null check (entity_type in ('student','teacher','staff','class','payment')),
  entity_id text not null,
  file_url text not null default '',
  file_path text not null default '',
  mime text not null default '',
  size_bytes integer not null default 0 check (size_bytes between 0 and 5242880),
  uploaded_by text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_photo_entity on photo_uploads(entity_type, entity_id);
alter table photo_uploads enable row level security;
alter table mst_students add column if not exists photo_url text default '';
alter table mst_teachers add column if not exists photo_url text default '';
alter table mst_staff add column if not exists photo_url text default '';
alter table classes add column if not exists photo_url text default '';
