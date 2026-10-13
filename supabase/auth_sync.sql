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
