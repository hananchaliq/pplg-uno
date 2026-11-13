-- Schema SQL Lengkap untuk Kelas XII PPLG 1 — Class of 2026 (Supabase / PostgreSQL)
create extension if not exists "pgcrypto";

create table if not exists class_info (
  id int primary key default 1 check (id = 1),
  name text not null default 'XII PPLG 1',
  tagline text,
  description text,
  homeroom_teacher text,
  school_year text,
  logo_url text,
  socials jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists students (
  id text primary key,
  roll_no int not null unique check (roll_no between 1 and 99),
  nis text not null default '20231000',
  name text not null,
  role text not null default 'Anggota',
  avatar_url text,
  bio text,
  tags text[] default '{}',
  links jsonb default '[]'::jsonb,
  tone smallint not null default 1 check (tone between 1 and 5),
  dream_title text default 'Software Engineer',
  dream_reason text default 'Ingin bikin produk teknologi yang dipakai banyak orang dan bermanfaat.',
  dream_description text default 'Fokus mendalami full-stack development dan arsitektur sistem sebelum lulus.',
  dream_paper_color text default '#DDEBD6',
  capsule_message text default 'Sampai jumpa di puncak kesuksesan teman-teman XII PPLG 1 — Class of 2026!',
  sort_order int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

alter table students
  add column if not exists nis text default '20231000',
  add column if not exists dream_title text default 'Software Engineer',
  add column if not exists dream_reason text default 'Ingin bikin produk teknologi yang dipakai banyak orang dan bermanfaat.',
  add column if not exists dream_description text default 'Fokus mendalami full-stack development dan arsitektur sistem sebelum lulus.',
  add column if not exists dream_paper_color text default '#DDEBD6',
  add column if not exists capsule_message text default 'Sampai jumpa di puncak kesuksesan teman-teman XII PPLG 1 — Class of 2026!';

create table if not exists farewell_letters (
  id text primary key,
  author_name text not null,
  author_role text not null default 'Siswa XII PPLG 1',
  title text not null,
  body text not null,
  memory_highlight text,
  created_at timestamptz default now()
);

create table if not exists schedules (
  id text primary key,
  weekday smallint not null check (weekday between 1 and 6),
  start_time text not null,
  end_time text not null,
  subject text not null,
  teacher text,
  room text
);

create table if not exists piket (
  weekday smallint primary key check (weekday between 1 and 6),
  day_name text not null,
  student_roll_nos int[] not null default '{}'
);

create table if not exists announcements (
  id text primary key,
  title text not null,
  body text not null,
  category text default 'Umum',
  is_pinned boolean default false,
  published_at timestamptz default now(),
  reactions jsonb default '{}'::jsonb
);

create table if not exists events (
  id text primary key,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz
);

create table if not exists assignments (
  id text primary key,
  subject text not null,
  title text not null,
  description text,
  deadline timestamptz,
  link text,
  created_at timestamptz default now()
);

create table if not exists resources (
  id text primary key,
  title text not null,
  category text not null,
  url text not null,
  file_type text,
  created_at timestamptz default now()
);

create table if not exists gallery_photos (
  id text primary key,
  album_title text not null,
  caption text not null,
  taken_on text not null,
  tint text default 'tint-lilac',
  accent text default '#6E78E8',
  aspect text default '16:10',
  code_snippet text default '',
  created_at timestamptz default now()
);

create table if not exists kas_transactions (
  id text primary key,
  occurred_on text not null,
  type text not null check (type in ('masuk','keluar')),
  amount bigint not null check (amount > 0),
  note text,
  created_at timestamptz default now()
);

create table if not exists guestbook (
  id text primary key,
  sender_name text not null check (char_length(sender_name) <= 40),
  message text not null check (char_length(message) <= 280),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists admin_profile (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Helper: authenticated admin check (1 shared class admin account or registered admin_profile)
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.role() = 'authenticated' or exists (select 1 from admin_profile where user_id = auth.uid());
$$;

-- Enable Row Level Security (RLS) on all tables
alter table class_info enable row level security;
alter table students enable row level security;
alter table farewell_letters enable row level security;
alter table schedules enable row level security;
alter table piket enable row level security;
alter table announcements enable row level security;
alter table events enable row level security;
alter table assignments enable row level security;
alter table resources enable row level security;
alter table gallery_photos enable row level security;
alter table kas_transactions enable row level security;
alter table guestbook enable row level security;
alter table admin_profile enable row level security;

-- Public SELECT policies
drop policy if exists "Public read class_info" on class_info;
create policy "Public read class_info" on class_info for select using (true);

drop policy if exists "Public read published students" on students;
create policy "Public read published students" on students for select using (is_published = true or is_admin());

drop policy if exists "Public read farewell_letters" on farewell_letters;
create policy "Public read farewell_letters" on farewell_letters for select using (true);

drop policy if exists "Public read schedules" on schedules;
create policy "Public read schedules" on schedules for select using (true);

drop policy if exists "Public read piket" on piket;
create policy "Public read piket" on piket for select using (true);

drop policy if exists "Public read announcements" on announcements;
create policy "Public read announcements" on announcements for select using (true);

drop policy if exists "Public read events" on events;
create policy "Public read events" on events for select using (true);

drop policy if exists "Public read assignments" on assignments;
create policy "Public read assignments" on assignments for select using (true);

drop policy if exists "Public read resources" on resources;
create policy "Public read resources" on resources for select using (true);

drop policy if exists "Public read gallery_photos" on gallery_photos;
create policy "Public read gallery_photos" on gallery_photos for select using (true);

drop policy if exists "Public read kas" on kas_transactions;
create policy "Public read kas" on kas_transactions for select using (true);

drop policy if exists "Public read approved guestbook" on guestbook;
create policy "Public read approved guestbook" on guestbook for select using (status = 'approved' or is_admin());

drop policy if exists "Public insert pending guestbook" on guestbook;
create policy "Public insert pending guestbook" on guestbook for insert with check (status = 'pending');

-- Authenticated Admin Full CRUD Policies (INSERT / UPDATE / DELETE)
drop policy if exists "Admin all class_info" on class_info;
create policy "Admin all class_info" on class_info for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all students" on students;
create policy "Admin all students" on students for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all farewell_letters" on farewell_letters;
create policy "Admin all farewell_letters" on farewell_letters for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all schedules" on schedules;
create policy "Admin all schedules" on schedules for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all piket" on piket;
create policy "Admin all piket" on piket for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all announcements" on announcements;
create policy "Admin all announcements" on announcements for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all events" on events;
create policy "Admin all events" on events for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all assignments" on assignments;
create policy "Admin all assignments" on assignments for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all resources" on resources;
create policy "Admin all resources" on resources for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all gallery_photos" on gallery_photos;
create policy "Admin all gallery_photos" on gallery_photos for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all kas" on kas_transactions;
create policy "Admin all kas" on kas_transactions for all using (is_admin()) with check (is_admin());

drop policy if exists "Admin all guestbook" on guestbook;
create policy "Admin all guestbook" on guestbook for all using (is_admin()) with check (is_admin());
