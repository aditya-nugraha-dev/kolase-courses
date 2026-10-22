-- Progres LMS KOLASE (Little Speakers, kids 6-12).
-- Satu baris per murid + course + lesson. Ditulis oleh /api/course-progress
-- memakai service role; RLS aktif tanpa policy publik.
create table if not exists public.course_progress (
  student_id text not null,
  course_slug text not null,
  lesson_key text not null,
  completed boolean not null default false,
  quiz_score integer,
  quiz_total integer,
  updated_at timestamptz not null default now(),
  primary key (student_id, course_slug, lesson_key),
  constraint course_progress_quiz_score_nonnegative check (quiz_score is null or quiz_score >= 0),
  constraint course_progress_quiz_total_nonnegative check (quiz_total is null or quiz_total >= 0)
);

create index if not exists course_progress_student_idx
  on public.course_progress (student_id, updated_at desc);

alter table public.course_progress enable row level security;
