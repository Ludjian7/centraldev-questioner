-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can view roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Submissions
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  answers jsonb not null,
  score integer not null,
  max_score integer not null,
  tier text not null check (tier in ('BASIC','STANDARD','ADVANCED')),
  risk_areas text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

-- Anyone (anon + authenticated) can insert their assessment
create policy "Anyone can submit assessment"
on public.submissions for insert
to anon, authenticated
with check (true);

-- Only admins can read
create policy "Admins can view submissions"
on public.submissions for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
create policy "Admins can delete submissions"
on public.submissions for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create index submissions_created_at_idx on public.submissions (created_at desc);
create index submissions_tier_idx on public.submissions (tier);