-- FairSpace initial schema (apply in Supabase SQL editor)

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

do $$ begin
  create type public.user_role as enum ('student', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_status as enum ('pending', 'confirmed', 'rejected', 'cancelled', 'expired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  matric_id text,
  faculty text,
  role public.user_role not null default 'student',
  no_show_count int not null default 0,
  cancellation_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity int not null default 1,
  location text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.booking_status not null default 'pending',
  checked_in_at timestamptz,
  qr_code_token text,
  created_at timestamptz not null default now(),
  constraint booking_time_valid check (end_time > start_time),
  constraint booking_duration_min check (end_time - start_time >= interval '30 minutes'),
  constraint booking_duration_max check (end_time - start_time <= interval '2 hours')
);

-- Prevent overlapping (pending/confirmed) bookings per room.
-- This is the hard "no overlap" guarantee, even under race conditions.
create index if not exists bookings_room_time_gist
  on public.bookings using gist (room_id, tstzrange(start_time, end_time, '[)'));

do $$ begin
  alter table public.bookings
    add constraint bookings_no_overlap
    exclude using gist (
      room_id with =,
      tstzrange(start_time, end_time, '[)') with &&
    )
    where (status in ('pending', 'confirmed'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.booking_participants (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  verification_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (booking_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_participants enable row level security;

-- profiles: user can read/write themselves
create policy "profiles_select_self" on public.profiles
for select to authenticated
using (id = auth.uid());

create policy "profiles_update_self" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- rooms: readable by all authenticated users
create policy "rooms_select_authenticated" on public.rooms
for select to authenticated
using (true);

-- bookings: creator can CRUD; participants can read
create policy "bookings_select_related" on public.bookings
for select to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.booking_participants bp
    where bp.booking_id = bookings.id and bp.user_id = auth.uid()
  )
);

create policy "bookings_insert_creator" on public.bookings
for insert to authenticated
with check (created_by = auth.uid());

create policy "bookings_update_creator" on public.bookings
for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "bookings_delete_creator" on public.bookings
for delete to authenticated
using (created_by = auth.uid());

create policy "participants_select_related" on public.booking_participants
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.bookings b
    where b.id = booking_participants.booking_id and b.created_by = auth.uid()
  )
);

create policy "participants_insert_creator" on public.booking_participants
for insert to authenticated
with check (
  exists (
    select 1 from public.bookings b
    where b.id = booking_participants.booking_id and b.created_by = auth.uid()
  )
);

create policy "participants_update_self" on public.booking_participants
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Automatically create a profile row when a user signs up.
create schema if not exists internal;

create or replace function internal.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure internal.handle_new_user();

