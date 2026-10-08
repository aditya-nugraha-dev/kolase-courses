-- KOLASE — migrasi chat murid ↔ teacher (opsional, produksi).
-- Kode saat ini memakai file lokal data/chat.json (tanpa migrasi).
-- Jalankan file ini di Supabase Dashboard > SQL Editor bila ingin pindah ke DB,
-- lalu ganti lib/chat.ts agar baca/tulis tabel di bawah.
create table if not exists chat_threads (
  student_id text primary key references mst_students(student_id) on delete cascade,
  student_name text not null default '',
  read_student_at timestamptz not null default now(),
  read_staff_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists chat_messages (
  id bigserial primary key,
  student_id text not null references chat_threads(student_id) on delete cascade,
  sender text not null default '', -- 'student:STU-..' | 'teacher:TCH-..' | 'staff:..'
  text text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_chat_msg_thread on chat_messages(student_id, created_at);
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;
