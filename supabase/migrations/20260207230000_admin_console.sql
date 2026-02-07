-- 1) Seed System Roles (Idempotent)
insert into public.system_roles (name, description)
values 
  ('analyst', 'Can view dashboards and metrics but cannot edit data.'),
  ('moderator', 'Can review reports and moderate content.'),
  ('admin', 'Full access to system configuration and user management.')
on conflict (name) do nothing;

-- 2) Helper Function: has_system_role
create or replace function public.has_system_role(
  user_id uuid, 
  required_role text
) returns boolean as $$
begin
  return exists (
    select 1 
    from public.user_system_roles usr
    join public.system_roles sr on usr.role_id = sr.id
    where usr.user_id = has_system_role.user_id
      and sr.name = required_role
  );
end;
$$ language plpgsql security definer;

-- 3) Role Overrides Table
create table if not exists public.role_overrides (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  view_as text not null check (view_as in ('job_seeker', 'job_provider')),
  expires_at timestamptz not null,
  reason text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now()
);

-- RLS for role_overrides
alter table public.role_overrides enable row level security;

create policy "Users can view their own override"
  on public.role_overrides for select
  using (auth.uid() = user_id);

create policy "Admins can manage overrides"
  on public.role_overrides for all
  using (
    public.has_system_role(auth.uid(), 'admin')
  );

-- 4) RLS for System Roles & User System Roles
alter table public.system_roles enable row level security;
alter table public.user_system_roles enable row level security;

-- Everyone can read roles (needed for joining) or restrict to authenticated?
-- Ideally, only staff needs to see system roles, but for `has_system_role` check we might need access. 
-- However, `has_system_role` is SECURITY DEFINER so it bypasses RLS.
-- Let's allow read for authenticated users to be safe for UI checks, or restrict if strict.
create policy "Authenticated users can read system_roles"
  on public.system_roles for select
  to authenticated
  using (true);

-- Only admins can modify system_roles (setup)
create policy "Admins can manage system_roles"
  on public.system_roles for all
  using (public.has_system_role(auth.uid(), 'admin'));

-- User System Roles policies
create policy "Staff can view user role assignments"
  on public.user_system_roles for select
  using (
    exists (
      select 1 from public.user_system_roles usr 
      where usr.user_id = auth.uid() 
      -- Simple check: if you have ANY entry in user_system_roles, you are staff
    )
  );

create policy "Admins can manage user roles"
  on public.user_system_roles for all
  using (public.has_system_role(auth.uid(), 'admin'));

-- 5) Demo Sessions Policies (Authoritative)
-- Drop existing policies to avoid conflicts if they exist
drop policy if exists "Users can manage their own demo session" on public.demo_sessions;
drop policy if exists "Admins can view all demo sessions" on public.demo_sessions;

alter table public.demo_sessions enable row level security;

create policy "Users can manage their own demo session"
  on public.demo_sessions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Admins can view all demo sessions"
  on public.demo_sessions for select
  using (public.has_system_role(auth.uid(), 'admin'));
