create extension if not exists pgcrypto;

create table if not exists public.fairspace_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text not null default 'student' check (role in ('student', 'admin', 'recruiter')),
  matric_id text,
  faculty text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.fairspace_profiles add column if not exists matric_id text;
alter table public.fairspace_profiles add column if not exists faculty text;
alter table public.fairspace_profiles add column if not exists avatar_url text;

create table if not exists public.fairspace_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  building text not null,
  floor text not null,
  capacity integer not null check (capacity > 0),
  amenities text[] not null default '{}',
  status text not null default 'available' check (status in ('available', 'maintenance')),
  created_at timestamptz not null default now()
);

create table if not exists public.fairspace_bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.fairspace_rooms(id) on delete cascade,
  organizer_id uuid not null references public.fairspace_profiles(id) on delete cascade,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  attendees integer not null check (attendees > 0),
  status text not null default 'confirmed' check (status in ('confirmed', 'checked-in', 'pending', 'cancelled')),
  request_message text,
  backup_email text,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

alter table public.fairspace_bookings add column if not exists request_message text;
alter table public.fairspace_bookings add column if not exists backup_email text;

create index if not exists fairspace_bookings_room_date_idx
  on public.fairspace_bookings (room_id, booking_date, start_time, end_time);

delete from public.fairspace_rooms
where slug in ('room-a', 'room-b', 'room-c', 'room-d');

insert into public.fairspace_profiles (full_name, email, role, matric_id, faculty, avatar_url)
values
  ('Sarah Chen', 'sarah@university.edu', 'student', 'A12345678', 'Faculty of Computing', ''),
  ('Admin User', 'admin@university.edu', 'admin', null, null, ''),
  ('Hiring Team', 'hiring@shortcut.asia', 'recruiter', null, null, '')
on conflict (email) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  matric_id = excluded.matric_id,
  faculty = excluded.faculty,
  avatar_url = excluded.avatar_url;

insert into public.fairspace_rooms (slug, name, building, floor, capacity, amenities, status)
values
  ('discussion-room-1', 'Discussion Room 1', 'Main Library', 'Level 2', 4, array['Whiteboard', 'Power Plugs', 'Wi-Fi'], 'available'),
  ('discussion-room-2', 'Discussion Room 2', 'Main Library', 'Level 2', 6, array['Whiteboard', 'Display Screen', 'Wi-Fi'], 'available'),
  ('discussion-room-3', 'Discussion Room 3', 'Student Learning Hub', 'Level 1', 8, array['Display Screen', 'Power Plugs', 'Wi-Fi'], 'available'),
  ('seminar-room-a', 'Discussion Room 4', 'Faculty Block', 'Level 3', 8, array['Projector', 'Whiteboard', 'Wi-Fi'], 'available'),
  ('discussion-room-5', 'Discussion Room 5', 'Engineering Block', 'Level 1', 4, array['Whiteboard', 'Power Plugs', 'Wi-Fi'], 'available'),
  ('discussion-room-6', 'Discussion Room 6', 'Science Library', 'Level 2', 6, array['Display Screen', 'Whiteboard', 'Wi-Fi'], 'available'),
  ('discussion-room-7', 'Discussion Room 7', 'Main Library', 'Level 3', 8, array['Display Screen', 'Power Plugs', 'Wi-Fi'], 'maintenance'),
  ('discussion-room-8', 'Discussion Room 8', 'Student Learning Hub', 'Level 2', 6, array['Whiteboard', 'Power Plugs', 'Wi-Fi'], 'maintenance')
on conflict (slug) do update set
  name = excluded.name,
  building = excluded.building,
  floor = excluded.floor,
  capacity = excluded.capacity,
  amenities = excluded.amenities,
  status = excluded.status;

with organizer as (
  select id from public.fairspace_profiles where email = 'sarah@university.edu'
),
focus_room as (
  select id from public.fairspace_rooms where slug = 'discussion-room-1'
),
team_room as (
  select id from public.fairspace_rooms where slug = 'discussion-room-2'
)
insert into public.fairspace_bookings (room_id, organizer_id, booking_date, start_time, end_time, title, attendees, status)
select focus_room.id, organizer.id, date '2026-06-03', time '10:00', time '11:00', 'Group assignment discussion', 3, 'confirmed'
from organizer, focus_room
where not exists (
  select 1 from public.fairspace_bookings
  where room_id = focus_room.id and booking_date = date '2026-06-03' and start_time = time '10:00'
)
union all
select team_room.id, organizer.id, date '2026-06-03', time '14:00', time '17:00', 'Final year project rehearsal - 3-hour request', 6, 'pending'
from organizer, team_room
where not exists (
  select 1 from public.fairspace_bookings
  where room_id = team_room.id and booking_date = date '2026-06-03' and start_time = time '14:00'
);
