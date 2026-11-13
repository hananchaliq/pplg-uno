-- Schema SQL untuk Kelas XII PPLG 1 (Supabase / PostgreSQL)
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
  id uuid primary key default gen_random_uuid(),
  roll_no int not null unique check (roll_no between 1 and 99),
  name text not null,
  role text not null default 'Anggota',
  avatar_url text,
  bio text,
  tags text[] default '{}',
  links jsonb default '[]'::jsonb,
  tone smallint not null default 1 check (tone between 1 and 5),
  sort_order int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 1 and 6),
  start_time time not null,
  end_time time not null,
  subject text not null,
  teacher text,
  room text
);

create table if not exists piket (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 1 and 6),
  student_id uuid not null references students(id) on delete cascade,
  unique (weekday, student_id)
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text default 'Umum',
  is_pinned boolean default false,
  published_at timestamptz default now()
);

create table if not exists announcement_reactions (
  announcement_id uuid references announcements(id) on delete cascade,
  reaction text not null,
  count int not null default 0,
  primary key (announcement_id, reaction)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  title text not null,
  description text,
  deadline timestamptz,
  link text,
  created_at timestamptz default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  url text not null,
  file_type text,
  created_at timestamptz default now()
);

create table if not exists albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_url text,
  taken_on date,
  created_at timestamptz default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references albums(id) on delete cascade,
  url text not null,
  caption text,
  sort_order int default 0,
  width int,
  height int
);

create table if not exists kas_transactions (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null,
  type text not null check (type in ('masuk','keluar')),
  amount bigint not null check (amount > 0),
  note text,
  created_at timestamptz default now()
);

create table if not exists guestbook (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null check (char_length(sender_name) <= 40),
  message text not null check (char_length(message) <= 280),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null
);

create table if not exists admin_profile (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_profile where user_id = auth.uid());
$$;

create or replace function react(p_announcement_id uuid, p_reaction text) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into announcement_reactions (announcement_id, reaction, count)
  values (p_announcement_id, p_reaction, 1)
  on conflict (announcement_id, reaction)
  do update set count = announcement_reactions.count + 1;
end;
$$;

-- Enable RLS on all tables
alter table class_info enable row level security;
alter table students enable row level security;
alter table schedules enable row level security;
alter table piket enable row level security;
alter table announcements enable row level security;
alter table announcement_reactions enable row level security;
alter table events enable row level security;
alter table assignments enable row level security;
alter table resources enable row level security;
alter table albums enable row level security;
alter table photos enable row level security;
alter table kas_transactions enable row level security;
alter table guestbook enable row level security;
alter table site_settings enable row level security;
alter table admin_profile enable row level security;

-- Public read policies
create policy "Public read class_info" on class_info for select using (true);
create policy "Public read published students" on students for select using (is_published = true or is_admin());
create policy "Public read schedules" on schedules for select using (true);
create policy "Public read piket" on piket for select using (true);
create policy "Public read announcements" on announcements for select using (true);
create policy "Public read reactions" on announcement_reactions for select using (true);
create policy "Public read events" on events for select using (true);
create policy "Public read assignments" on assignments for select using (true);
create policy "Public read resources" on resources for select using (true);
create policy "Public read albums" on albums for select using (true);
create policy "Public read photos" on photos for select using (true);
create policy "Public read kas" on kas_transactions for select using (true);
create policy "Public read approved guestbook" on guestbook for select using (status = 'approved' or is_admin());
create policy "Public insert pending guestbook" on guestbook for insert with check (status = 'pending');
create policy "Public read site_settings" on site_settings for select using (true);

-- Admin all policies
create policy "Admin all class_info" on class_info for all using (is_admin()) with check (is_admin());
create policy "Admin all students" on students for all using (is_admin()) with check (is_admin());
create policy "Admin all schedules" on schedules for all using (is_admin()) with check (is_admin());
create policy "Admin all piket" on piket for all using (is_admin()) with check (is_admin());
create policy "Admin all announcements" on announcements for all using (is_admin()) with check (is_admin());
create policy "Admin all reactions" on announcement_reactions for all using (is_admin()) with check (is_admin());
create policy "Admin all events" on events for all using (is_admin()) with check (is_admin());
create policy "Admin all assignments" on assignments for all using (is_admin()) with check (is_admin());
create policy "Admin all resources" on resources for all using (is_admin()) with check (is_admin());
create policy "Admin all albums" on albums for all using (is_admin()) with check (is_admin());
create policy "Admin all photos" on photos for all using (is_admin()) with check (is_admin());
create policy "Admin all kas" on kas_transactions for all using (is_admin()) with check (is_admin());
create policy "Admin all guestbook" on guestbook for all using (is_admin()) with check (is_admin());
create policy "Admin all site_settings" on site_settings for all using (is_admin()) with check (is_admin());
