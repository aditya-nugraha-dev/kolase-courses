-- KOLASE — sinkron login HP <-> PC untuk site statis (GitHub Pages).
-- Jalankan SETELAH schema.sql di Supabase Dashboard > SQL Editor.
-- Cara kerja: site statis TIDAK baca tabel langsung (RLS deny-all),
-- hanya panggil 3 RPC di bawah via anon key. Hash SHA-256 dihitung di browser
-- (lihat kolase-static/js/supabase-auth.js), server hanya bandingkan string.
-- Prototype: cocok untuk demo. Untuk produksi, pindah ke Supabase Auth / backend.

-- ===== 1) Tabel akun cloud (1 baris = 1 login, lintas perangkat) =====
create table if not exists auth_accounts (
  email text primary key, -- selalu lowercase, trim (contoh: adit@mail.id)
  nama text not null default '',
  wa text not null default '',
  role text not null default 'student'
    check (role in ('student','teacher','staff','admin','founder','academic','systems')),
  ref_id text not null default '', -- STU-XXXXXX / TCH-XXXXXX / ACT-XXXXXX
  password_hash text not null default '', -- hex SHA-256 64 char; '' = belum diset (migrasi login pertama)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table auth_accounts enable row level security;
-- Sengaja TANPA policy baca/tulis untuk anon: akses hanya via RPC SECURITY DEFINER.

-- ===== 1b) Throttle login (anti brute-force RPC anon) =====
create table if not exists auth_attempts (
  id bigserial primary key,
  identifier text not null, -- email/username ternormalisasi (max 160)
  ip text not null default 'unknown',
  at timestamptz not null default now()
);
create index if not exists idx_auth_attempts_ident_at on auth_attempts(identifier, at);
create index if not exists idx_auth_attempts_ip_at on auth_attempts(ip, at);
alter table auth_attempts enable row level security;
-- Sengaja TANPA policy: hanya ditulis/dibaca via RPC SECURITY DEFINER di bawah.

-- ===== 2) Helper ID berurutan (STU/TCH/ACT-XXXXXX) =====
create or replace function kolase_next_id(p_prefix text, p_kind text)
returns text language plpgsql as $$
declare v_max int := 0; v_id text;
begin
  if p_kind = 'student' then
    select coalesce(max((regexp_match(student_id, '(\d+)$'))[1]::int), 0) into v_max from mst_students;
  elsif p_kind = 'teacher' then
    select coalesce(max((regexp_match(teacher_id, '(\d+)$'))[1]::int), 0) into v_max from mst_teachers;
  else
    select coalesce(max((regexp_match(staff_id, '(\d+)$'))[1]::int), 0) into v_max from mst_staff
    where staff_id not like 'REQ-%';
  end if;
  v_id := p_prefix || lpad((v_max + 1)::text, 6, '0');
  return v_id;
end $$;

-- Normalisasi query login: trim + collapse spasi + lowercase
create or replace function kolase_norm(p text)
returns text language sql immutable as $$
  select lower(trim(both from regexp_replace(coalesce(p, ''), '\s+', ' ', 'g')))
$$;

-- ===== 2b) Selaraskan peran staff: UI + lokal + Sheets membolehkan 'staff' =====
do $$ begin
  begin alter table mst_staff drop constraint if exists mst_staff_role_check; exception when others then null; end;
  begin alter table mst_staff add constraint mst_staff_role_check check (role in ('admin','staff','founder','academic','systems')); exception when duplicate_object then null; end;
end $$;

-- ===== 3) REGISTER cloud (student / teacher / staff) =====
-- Bebas daftar langsung jadi — tanpa PIN, tanpa persetujuan. Tiap pendaftaran
-- dapat ID baru berurutan (STU/TCH/ACT-XXXXXX). Email = dari pendaftar (wajib unik).
-- (Param p_pin dipertahankan agar klien lama tetap kompatibel; diabaikan.)
create or replace function kolase_register(
  p_nama text, p_email text, p_wa text, p_role text, p_password_hash text, p_pin text default ''
)
returns text language plpgsql security definer set search_path = public as $$
declare v_email text; v_id text; v_role text;
begin
  v_email := kolase_norm(p_email);
  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 160 then
    raise exception 'Email tidak valid.';
  end if;
  if trim(coalesce(p_password_hash, '')) !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Password hash tidak valid.';
  end if;
  if char_length(trim(coalesce(p_nama, ''))) < 1 or char_length(trim(coalesce(p_nama, ''))) > 100 then
    raise exception 'User name 1-100 karakter.';
  end if;
  if char_length(trim(coalesce(p_wa, ''))) > 20 then
    raise exception 'No. WA maks 20 karakter.';
  end if;
  if exists (select 1 from auth_accounts where email = v_email) then
    raise exception 'Email sudah terdaftar. Silakan Login.';
  end if;
  v_role := lower(trim(coalesce(p_role, '')));
  if v_role = 'student' then
    v_id := kolase_next_id('STU-', 'student');
    insert into mst_students (student_id, nama, email, wa) values (v_id, trim(p_nama), v_email, trim(coalesce(p_wa, '')));
  elsif v_role = 'teacher' then
    v_id := kolase_next_id('TCH-', 'teacher');
    insert into mst_teachers (teacher_id, nama, email, wa) values (v_id, trim(p_nama), v_email, trim(coalesce(p_wa, '')));
  elsif v_role in ('systems', 'founder', 'academic', 'staff', 'admin') then
    v_id := kolase_next_id('ACT-', 'staff');
    insert into mst_staff (staff_id, nama, email, wa, role) values (v_id, trim(p_nama), v_email, trim(coalesce(p_wa, '')), v_role);
  else
    raise exception 'Peran tidak dikenal.';
  end if;
  insert into auth_accounts (email, nama, wa, role, ref_id, password_hash)
  values (v_email, trim(p_nama), trim(coalesce(p_wa, '')), v_role, v_id, trim(p_password_hash));
  return v_id;
end $$;

-- ===== 4) LOGIN cloud (cari via email / nama / ID, lalu cek hash) =====
-- Return jsonb {role,id,nama,email}. Migrasi: hash kosong -> set saat login pertama.
create or replace function kolase_login(p_query text, p_password_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_q text; r auth_accounts%rowtype; v_hash text; v_ip text;
begin
  v_q := kolase_norm(p_query);
  v_hash := trim(coalesce(p_password_hash, ''));
  if v_q = '' or char_length(v_q) > 160 or v_hash !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'User name/Email dan Password wajib diisi.';
  end if;
  -- Throttle: max 20x/10 mnt per akun, 60x/10 mnt per IP (anon RPC terbuka publik).
  begin
    v_ip := coalesce((current_setting('request.headers', true)::json ->> 'x-forwarded-for'), 'unknown');
  exception when others then v_ip := 'unknown'; end;
  delete from auth_attempts where at < now() - interval '10 minutes';
  if (select count(*) from auth_attempts where identifier = v_q) >= 20
     or (select count(*) from auth_attempts where ip = v_ip and v_ip <> 'unknown') >= 60 then
    raise exception 'Terlalu banyak percobaan. Tunggu 10 menit.';
  end if;
  insert into auth_attempts (identifier, ip) values (v_q, v_ip);
  select * into r from auth_accounts
  where email = v_q
  limit 1;
  if not found then
    select * into r from auth_accounts
    where lower(ref_id) = v_q
    limit 1;
  end if;
  if not found then
    -- Nama kembar mungkin (tiap pendaftaran = ID baru): pemegang terbaru menang.
    select * into r from auth_accounts
    where kolase_norm(nama) = v_q
    order by created_at desc
    limit 1;
  end if;
  if not found then
    raise exception 'Akun tidak ditemukan. Cek Email / User name, atau Register dulu.';
  end if;
  if coalesce(r.password_hash, '') = '' then
    update auth_accounts set password_hash = v_hash, updated_at = now() where email = r.email;
  elsif r.password_hash <> v_hash then
    raise exception 'Password salah. Gunakan Forgot Password untuk reset.';
  end if;
  return jsonb_build_object('role', r.role, 'id', r.ref_id, 'nama', r.nama, 'email', r.email);
end $$;

-- ===== 5) RESET PASSWORD cloud =====
create or replace function kolase_reset_password(p_query text, p_new_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_q text; v_hash text;
begin
  v_q := kolase_norm(p_query);
  v_hash := trim(coalesce(p_new_hash, ''));
  if char_length(v_q) > 160 or v_hash !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Password baru tidak valid (min. 4 karakter).';
  end if;
  -- Prioritas email -> ID -> nama terbaru (nama kembar: hanya akun terbaru yang direset).
  update auth_accounts set password_hash = v_hash, updated_at = now()
  where email = v_q;
  if not found then
    update auth_accounts set password_hash = v_hash, updated_at = now()
    where lower(ref_id) = v_q;
  end if;
  if not found then
    update auth_accounts set password_hash = v_hash, updated_at = now()
    where email = (
      select email from auth_accounts
      where kolase_norm(nama) = v_q
      order by created_at desc
      limit 1
    );
  end if;
  if not found then
    raise exception 'Akun tidak ditemukan untuk reset.';
  end if;
  -- Sinkron hash ke master lokal? Master Supabase tidak punya kolom password; cukup auth_accounts.
  return true;
end $$;

-- ===== 6) Bersih-bersih baris hantu (jalankan ulang aman/idempoten) =====
-- Menghapus placeholder leadership lama (__local__… tanpa hash) bila masih ada,
-- agar login cloud hanya berisi akun yang benar mendaftar. Akun asli TIDAK disentuh.
delete from auth_accounts
where email like '\_\_local\_\_%@kolase.local' and coalesce(password_hash, '') = '';

-- ===== 7) Izin panggil RPC dari site statis (anon key) =====
grant execute on function kolase_next_id(text, text) to anon, authenticated;
grant execute on function kolase_norm(text) to anon, authenticated;
grant execute on function kolase_register(text, text, text, text, text, text) to anon, authenticated;
grant execute on function kolase_login(text, text) to anon, authenticated;
grant execute on function kolase_reset_password(text, text) to anon, authenticated;

-- ===== 8) Foto profil sinkron HP<->PC (site statis) =====
-- Kolom menyimpan dataURL JPEG ±512px (≤500rb char, lihat profile.html).
-- Re-run aman: IF NOT EXISTS / CREATE OR REPLACE / overload (klien lama 6-arg tetap jalan).
-- Jalankan ulang SELURUH file ini di SQL Editor setelah update (idempoten).
alter table auth_accounts add column if not exists photo_url text not null default '';

-- REGISTER varian 7-arg (terima + simpan foto). Varian 6-arg (§3) dibiarkan untuk klien lama.
create or replace function kolase_register(
  p_nama text, p_email text, p_wa text, p_role text, p_password_hash text, p_pin text default '', p_photo_url text default ''
)
returns text language plpgsql security definer set search_path = public as $$
declare v_email text; v_id text; v_role text; v_photo text;
begin
  v_email := kolase_norm(p_email);
  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 160 then
    raise exception 'Email tidak valid.';
  end if;
  if trim(coalesce(p_password_hash, '')) !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Password hash tidak valid.';
  end if;
  v_photo := coalesce(p_photo_url, '');
  if char_length(v_photo) > 500000 then
    raise exception 'Foto kebesaran (maks 500rb karakter).';
  end if;
  if char_length(trim(coalesce(p_nama, ''))) < 1 or char_length(trim(coalesce(p_nama, ''))) > 100 then
    raise exception 'User name 1-100 karakter.';
  end if;
  if char_length(trim(coalesce(p_wa, ''))) > 20 then
    raise exception 'No. WA maks 20 karakter.';
  end if;
  if exists (select 1 from auth_accounts where email = v_email) then
    raise exception 'Email sudah terdaftar. Silakan Login.';
  end if;
  v_role := lower(trim(coalesce(p_role, '')));
  if v_role = 'student' then
    v_id := kolase_next_id('STU-', 'student');
    insert into mst_students (student_id, nama, email, wa) values (v_id, trim(p_nama), v_email, trim(coalesce(p_wa, '')));
  elsif v_role = 'teacher' then
    v_id := kolase_next_id('TCH-', 'teacher');
    insert into mst_teachers (teacher_id, nama, email, wa) values (v_id, trim(p_nama), v_email, trim(coalesce(p_wa, '')));
  elsif v_role in ('systems', 'founder', 'academic', 'staff', 'admin') then
    v_id := kolase_next_id('ACT-', 'staff');
    insert into mst_staff (staff_id, nama, email, wa, role) values (v_id, trim(p_nama), v_email, trim(coalesce(p_wa, '')), v_role);
  else
    raise exception 'Peran tidak dikenal.';
  end if;
  insert into auth_accounts (email, nama, wa, role, ref_id, password_hash, photo_url)
  values (v_email, trim(p_nama), trim(coalesce(p_wa, '')), v_role, v_id, trim(p_password_hash), v_photo);
  return v_id;
end $$;

-- ===== 9) LOGIN kembalikan foto (perangkat lain ikut dapat foto saat login) =====
-- Return jsonb {role,id,nama,email,photo}. Klien lama mengabaikan field photo.
create or replace function kolase_login(p_query text, p_password_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_q text; r auth_accounts%rowtype; v_hash text; v_ip text;
begin
  v_q := kolase_norm(p_query);
  v_hash := trim(coalesce(p_password_hash, ''));
  if v_q = '' or char_length(v_q) > 160 or v_hash !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Gmail dan Password wajib diisi.';
  end if;
  -- Throttle: max 20x/10 mnt per akun, 60x/10 mnt per IP (anon RPC terbuka publik).
  begin
    v_ip := coalesce((current_setting('request.headers', true)::json ->> 'x-forwarded-for'), 'unknown');
  exception when others then v_ip := 'unknown'; end;
  delete from auth_attempts where at < now() - interval '10 minutes';
  if (select count(*) from auth_attempts where identifier = v_q) >= 20
     or (select count(*) from auth_attempts where ip = v_ip and v_ip <> 'unknown') >= 60 then
    raise exception 'Terlalu banyak percobaan. Tunggu 10 menit.';
  end if;
  insert into auth_attempts (identifier, ip) values (v_q, v_ip);
  select * into r from auth_accounts
  where email = v_q
  limit 1;
  if not found then
    select * into r from auth_accounts
    where lower(ref_id) = v_q
    limit 1;
  end if;
  if not found then
    -- Nama kembar mungkin (tiap pendaftaran = ID baru): pemegang terbaru menang.
    select * into r from auth_accounts
    where kolase_norm(nama) = v_q
    order by created_at desc
    limit 1;
  end if;
  if not found then
    raise exception 'Akun tidak ditemukan. Cek Gmail, atau Register dulu.';
  end if;
  if coalesce(r.password_hash, '') = '' then
    update auth_accounts set password_hash = v_hash, updated_at = now() where email = r.email;
  elsif r.password_hash <> v_hash then
    raise exception 'Password salah. Gunakan Forgot Password untuk reset.';
  end if;
  return jsonb_build_object('role', r.role, 'id', r.ref_id, 'nama', r.nama, 'email', r.email, 'photo', coalesce(r.photo_url, ''));
end $$;

-- ===== 10) SET foto profil (dipanggil halaman Profil setelah upload lokal) =====
-- Tanpa password (prototype): foto juga tampil di direktori untuk user login.
-- Kosongkan ('') untuk hapus. Prioritas cari: email -> ID -> nama terbaru.
create or replace function kolase_set_photo(p_query text, p_photo_url text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_q text; v_photo text; v_email text;
begin
  v_q := kolase_norm(p_query);
  v_photo := coalesce(p_photo_url, '');
  if v_q = '' or char_length(v_q) > 160 then
    raise exception 'Akun tidak valid.';
  end if;
  if char_length(v_photo) > 500000 then
    raise exception 'Foto kebesaran (maks 500rb karakter).';
  end if;
  if v_photo <> '' and v_photo !~ '^data:image/(jpeg|png|webp);base64,' then
    raise exception 'Format foto tidak didukung.';
  end if;
  select email into v_email from auth_accounts where email = v_q limit 1;
  if not found then
    select email into v_email from auth_accounts where lower(ref_id) = v_q limit 1;
  end if;
  if not found then
    select email into v_email from auth_accounts
    where kolase_norm(nama) = v_q order by created_at desc limit 1;
  end if;
  if not found then
    raise exception 'Akun tidak ditemukan. Register dulu.';
  end if;
  update auth_accounts set photo_url = v_photo, updated_at = now() where email = v_email;
  return true;
end $$;

-- ===== 11) GET foto profil (perangkat lain menarik tanpa password) =====
create or replace function kolase_get_photo(p_query text)
returns text language plpgsql security definer set search_path = public as $$
declare v_q text; v_photo text;
begin
  v_q := kolase_norm(p_query);
  select photo_url into v_photo from auth_accounts where email = v_q limit 1;
  if not found then
    select photo_url into v_photo from auth_accounts where lower(ref_id) = v_q limit 1;
  end if;
  if not found then
    select photo_url into v_photo from auth_accounts
    where kolase_norm(nama) = v_q order by created_at desc limit 1;
  end if;
  if not found then return ''; end if;
  return coalesce(v_photo, '');
end $$;

-- ===== 12) Izin RPC foto dari site statis (anon key) =====
grant execute on function kolase_register(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function kolase_set_photo(text, text) to anon, authenticated;
grant execute on function kolase_get_photo(text) to anon, authenticated;

-- ===== 13) Pembayaran manual lintas perangkat (transfer/QRIS + bukti) =====
-- Murid checkout di HP -> admin verifikasi di PC -> status VERIFIED dibaca
-- kembali di HP. Re-run aman (IF NOT EXISTS / CREATE OR REPLACE).
create table if not exists pay_orders (
  order_id text primary key, -- = enrollment_id ENR-XXXXXX (dibuat 1x di perangkat murid)
  trx_id text not null, -- TXN-YYYY-####
  student_id text not null,
  student_nama text not null default '',
  student_email text not null default '',
  class_id text not null default '',
  class_nama text not null default '',
  nominal integer not null default 0,
  method text not null default '',
  proof text not null default '', -- dataURL JPEG bukti transfer ('' = belum kirim)
  status text not null default 'PENDING' check (status in ('PENDING','VERIFIED','REJECTED')),
  sisa integer not null default 0, -- sisa sesi final (diisi saat verifikasi)
  grant_n integer not null default 0, -- total sesi diberikan (diisi saat verifikasi)
  trial_applied boolean not null default false,
  activated_at timestamptz,
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table pay_orders enable row level security;
-- Sengaja TANPA policy: akses hanya via RPC SECURITY DEFINER di bawah.

-- Buat / update order (bukti susulan tidak menimpa status VERIFIED).
create or replace function kolase_order_upsert(
  p_order_id text, p_trx_id text, p_student_id text, p_nama text, p_email text,
  p_class_id text, p_class_nama text, p_nominal integer, p_method text,
  p_proof text default '', p_status text default 'PENDING'
)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_proof text; v_cur text;
begin
  if coalesce(p_order_id, '') = '' or coalesce(p_trx_id, '') = '' or coalesce(p_student_id, '') = '' then
    raise exception 'Order tidak valid.';
  end if;
  if coalesce(p_nominal, 0) < 0 or coalesce(p_nominal, 0) > 100000000 then
    raise exception 'Nominal tidak valid.';
  end if;
  if char_length(coalesce(p_method, '')) > 60 then raise exception 'Metode tidak valid.'; end if;
  v_proof := coalesce(p_proof, '');
  if char_length(v_proof) > 500000 then raise exception 'Bukti kebesaran (maks 500rb karakter).'; end if;
  if v_proof <> '' and v_proof !~ '^data:image/(jpeg|png|webp);base64,' then
    raise exception 'Format bukti tidak didukung.';
  end if;
  if coalesce(p_status, 'PENDING') not in ('PENDING','VERIFIED','REJECTED') then
    raise exception 'Status tidak dikenal.';
  end if;
  select status into v_cur from pay_orders where order_id = p_order_id;
  if found and v_cur = 'VERIFIED' and p_status = 'PENDING' then
    -- Jangan turunkan status yang sudah terverifikasi via upsert.
    update pay_orders set updated_at = now() where order_id = p_order_id;
    return true;
  end if;
  insert into pay_orders (order_id, trx_id, student_id, student_nama, student_email, class_id, class_nama, nominal, method, proof, status, updated_at)
  values (p_order_id, p_trx_id, p_student_id, trim(coalesce(p_nama, '')), lower(trim(coalesce(p_email, ''))), p_class_id, trim(coalesce(p_class_nama, '')), p_nominal, trim(coalesce(p_method, '')), v_proof, coalesce(p_status, 'PENDING'), now())
  on conflict (order_id) do update set
    trx_id = excluded.trx_id, student_nama = excluded.student_nama, student_email = excluded.student_email,
    class_id = excluded.class_id, class_nama = excluded.class_nama, nominal = excluded.nominal, method = excluded.method,
    proof = (case when excluded.proof <> '' then excluded.proof else pay_orders.proof end),
    status = excluded.status, updated_at = now();
  return true;
end $$;

-- Antrean untuk admin (PENDING terbaru dulu, maks 100).
create or replace function kolase_orders_pending()
returns jsonb language plpgsql security definer set search_path = public as $$
declare out jsonb;
begin
  select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at desc), '[]'::jsonb) into out
  from (select * from pay_orders where status = 'PENDING' order by created_at desc limit 100) t;
  return out;
end $$;

-- Verifikasi admin: PENDING -> VERIFIED (+angka final) / REJECTED. Idempoten.
create or replace function kolase_order_verify(
  p_order_id text, p_status text, p_sisa integer default 0,
  p_grant integer default 0, p_trial boolean default false,
  p_activated_at timestamptz default null, p_expires_at date default null
)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_cur text;
begin
  if coalesce(p_status, '') not in ('VERIFIED','REJECTED') then
    raise exception 'Status verifikasi tidak dikenal.';
  end if;
  select status into v_cur from pay_orders where order_id = p_order_id;
  if not found then raise exception 'Order tidak ditemukan.'; end if;
  if v_cur = p_status then return true; end if; -- retry aman
  if v_cur <> 'PENDING' then raise exception 'Order sudah diputuskan.';
  end if;
  update pay_orders set status = p_status, sisa = greatest(coalesce(p_sisa, 0), 0),
    grant_n = greatest(coalesce(p_grant, 0), 0), trial_applied = coalesce(p_trial, false),
    activated_at = coalesce(p_activated_at, now()), expires_at = p_expires_at, updated_at = now()
  where order_id = p_order_id;
  return true;
end $$;

-- Order milik murid (email / ID), terbaru dulu, maks 50.
create or replace function kolase_my_orders(p_query text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_q text; out jsonb;
begin
  v_q := kolase_norm(p_query);
  select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at desc), '[]'::jsonb) into out
  from (select * from pay_orders where lower(student_id) = v_q or student_email = v_q order by created_at desc limit 50) t;
  return out;
end $$;

-- ===== 14) Metode pembayaran (rekening/QRIS, dikelola owner dari website) =====
create table if not exists payment_methods (
  id text primary key, -- PM-XXXXXX
  type text not null default 'bank' check (type in ('bank','qris','ewallet')),
  label text not null default '', -- tampil di checkout, cth. "BCA • 1234567890"
  account text not null default '', -- nomor rekening / nomor e-wallet
  holder text not null default '', -- atas nama
  qr text not null default '', -- dataURL foto QRIS ('' bila bukan QRIS)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table payment_methods enable row level security;
-- Sengaja TANPA policy: baca via RPC publik, tulis via RPC di bawah.
-- CATATAN prototype: tulis RPC bisa dipanggil siapa pun yang tahu endpoint;
-- di klien hanya peran founder/academic/systems yang diberi form. Sebelum
-- memproses uang besar, pindah ke Supabase Auth + RLS per-peran.

create or replace function kolase_pay_methods()
returns jsonb language plpgsql security definer set search_path = public as $$
declare out jsonb;
begin
  select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at), '[]'::jsonb) into out
  from (select * from payment_methods where is_active order by created_at limit 20) t;
  return out;
end $$;

create or replace function kolase_pay_method_save(
  p_id text, p_type text, p_label text, p_account text, p_holder text, p_qr text, p_active boolean default true
)
returns text language plpgsql security definer set search_path = public as $$
declare v_id text;
begin
  v_id := trim(coalesce(p_id, ''));
  if v_id = '' then
    v_id := 'PM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    while exists (select 1 from payment_methods where id = v_id) loop
      v_id := 'PM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    end loop;
  end if;
  if coalesce(p_type, '') not in ('bank','qris','ewallet') then raise exception 'Tipe tidak dikenal.'; end if;
  if char_length(trim(coalesce(p_label, ''))) < 1 or char_length(trim(coalesce(p_label, ''))) > 60 then
    raise exception 'Label 1-60 karakter.';
  end if;
  if char_length(coalesce(p_account, '')) > 50 or char_length(coalesce(p_holder, '')) > 60 then
    raise exception 'Rekening/nama terlalu panjang.';
  end if;
  if char_length(coalesce(p_qr, '')) > 500000 then raise exception 'Foto QR kebesaran.'; end if;
  if coalesce(p_qr, '') <> '' and coalesce(p_qr, '') !~ '^data:image/(jpeg|png|webp);base64,' then
    raise exception 'Format foto QR tidak didukung.';
  end if;
  insert into payment_methods (id, type, label, account, holder, qr, is_active, updated_at)
  values (v_id, p_type, trim(p_label), trim(coalesce(p_account, '')), trim(coalesce(p_holder, '')), coalesce(p_qr, ''), coalesce(p_active, true), now())
  on conflict (id) do update set type = excluded.type, label = excluded.label, account = excluded.account,
    holder = excluded.holder, qr = excluded.qr, is_active = excluded.is_active, updated_at = now();
  return v_id;
end $$;

create or replace function kolase_pay_method_delete(p_id text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from payment_methods where id = trim(coalesce(p_id, ''));
  if not found then raise exception 'Metode tidak ditemukan.'; end if;
  return true;
end $$;

-- ===== 15) Audit login permanen (tambahan #3 keamanan) =====
-- Jejak login cloud yang tidak bisa dihapus dari browser. Dibaca owner
-- langsung di Supabase (Table Editor / SQL), bukan dari website.
create table if not exists auth_logins (
  id bigserial primary key,
  email text not null default '',
  ref_id text not null default '',
  role text not null default '',
  at timestamptz not null default now()
);
create index if not exists idx_auth_logins_at on auth_logins(at desc);
create index if not exists idx_auth_logins_email on auth_logins(email, at desc);
alter table auth_logins enable row level security;
-- Sengaja TANPA policy: tulis via RPC di bawah, baca via dashboard owner.

-- LOGIN versi audit: sama seperti §9 + catat setiap login sukses.
create or replace function kolase_login(p_query text, p_password_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_q text; r auth_accounts%rowtype; v_hash text; v_ip text;
begin
  v_q := kolase_norm(p_query);
  v_hash := trim(coalesce(p_password_hash, ''));
  if v_q = '' or char_length(v_q) > 160 or v_hash !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'Gmail dan Password wajib diisi.';
  end if;
  -- Throttle: max 20x/10 mnt per akun, 60x/10 mnt per IP (anon RPC terbuka publik).
  begin
    v_ip := coalesce((current_setting('request.headers', true)::json ->> 'x-forwarded-for'), 'unknown');
  exception when others then v_ip := 'unknown'; end;
  delete from auth_attempts where at < now() - interval '10 minutes';
  if (select count(*) from auth_attempts where identifier = v_q) >= 20
     or (select count(*) from auth_attempts where ip = v_ip and v_ip <> 'unknown') >= 60 then
    raise exception 'Terlalu banyak percobaan. Tunggu 10 menit.';
  end if;
  insert into auth_attempts (identifier, ip) values (v_q, v_ip);
  select * into r from auth_accounts
  where email = v_q
  limit 1;
  if not found then
    select * into r from auth_accounts
    where lower(ref_id) = v_q
    limit 1;
  end if;
  if not found then
    -- Nama kembar mungkin (tiap pendaftaran = ID baru): pemegang terbaru menang.
    select * into r from auth_accounts
    where kolase_norm(nama) = v_q
    order by created_at desc
    limit 1;
  end if;
  if not found then
    raise exception 'Akun tidak ditemukan. Cek Gmail, atau Register dulu.';
  end if;
  if coalesce(r.password_hash, '') = '' then
    update auth_accounts set password_hash = v_hash, updated_at = now() where email = r.email;
  elsif r.password_hash <> v_hash then
    raise exception 'Password salah. Gunakan Forgot Password untuk reset.';
  end if;
  insert into auth_logins (email, ref_id, role) values (r.email, r.ref_id, r.role);
  return jsonb_build_object('role', r.role, 'id', r.ref_id, 'nama', r.nama, 'email', r.email, 'photo', coalesce(r.photo_url, ''));
end $$;

-- ===== 16) Izin RPC pembayaran + audit dari site statis (anon key) =====
grant execute on function kolase_order_upsert(text, text, text, text, text, text, text, integer, text, text, text) to anon, authenticated;
grant execute on function kolase_orders_pending() to anon, authenticated;
grant execute on function kolase_order_verify(text, text, integer, integer, boolean, timestamptz, date) to anon, authenticated;
grant execute on function kolase_my_orders(text) to anon, authenticated;
grant execute on function kolase_pay_methods() to anon, authenticated;
grant execute on function kolase_pay_method_save(text, text, text, text, text, text, boolean) to anon, authenticated;
grant execute on function kolase_pay_method_delete(text) to anon, authenticated;

-- ===== 17) Profil anak (opsional, dipanggil best-effort setelah register) =====
-- Nama panggilan & usia dipakai guru untuk menyapa anak di kelas.
-- Tidak wajib dijalankan: bila RPC belum ada, pendaftaran tetap berhasil.
alter table mst_students add column if not exists preferred_name text default '';
alter table mst_students add column if not exists age_group text default '';
alter table mst_students add column if not exists guardian_whatsapp text default '';

create or replace function kolase_update_student_profile(
  p_email text,
  p_password_hash text,
  p_panggilan text default '',
  p_usia text default '',
  p_guardian_wa text default ''
) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ref text;
begin
  select ref_id into v_ref from auth_accounts
  where lower(email) = lower(trim(coalesce(p_email, '')))
    and role = 'student'
    and password_hash = trim(coalesce(p_password_hash, ''))
  limit 1;
  if v_ref is null or v_ref = '' then return false; end if;
  update mst_students set
    preferred_name = coalesce(nullif(left(trim(coalesce(p_panggilan, '')), 40), ''), preferred_name),
    age_group = case
      when trim(coalesce(p_usia, '')) ~ '^(6|7|8|9|10|11|12)$' then trim(p_usia)
      else age_group
    end,
    guardian_whatsapp = coalesce(nullif(left(trim(coalesce(p_guardian_wa, '')), 20), ''), guardian_whatsapp)
  where student_id = v_ref;
  return found;
end $$;

grant execute on function kolase_update_student_profile(text, text, text, text, text) to anon, authenticated;
