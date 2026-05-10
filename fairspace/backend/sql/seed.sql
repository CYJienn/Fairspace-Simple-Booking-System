create table if not exists public.system_smoke_test (
  id uuid primary key default gen_random_uuid(),
  note text not null,
  created_at timestamptz not null default now()
);

insert into public.system_smoke_test (note)
values ('smoke test row');
