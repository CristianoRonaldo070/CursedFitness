-- CursedFitness Supabase Schema
-- Run this in your Supabase SQL Editor to set up profile and quest persistence

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  age integer default 24,
  height numeric default 175,
  weight numeric default 72,
  goal text default ''recomp'',
  activity text default ''moderate'',
  diet text default ''balanced'',
  xp integer default 340,
  completed_quests jsonb default ''[]''::jsonb,
  is_mission_active boolean default false,
  created_at timestamp with time zone default timezone(''utc''::text, now()) not null,
  updated_at timestamp with time zone default timezone(''utc''::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Drop existing policies if any
drop policy if exists " Users can view their own profile\ on public.profiles;
drop policy if exists \Users can insert their own profile\ on public.profiles;
drop policy if exists \Users can update their own profile\ on public.profiles;

-- Create RLS policies so hunters can only read and update their own records
create policy \Users can view their own profile\
 on public.profiles for select
 using (auth.uid() = id);

create policy \Users can insert their own profile\
 on public.profiles for insert
 with check (auth.uid() = id);

create policy \Users can update their own profile\
 on public.profiles for update
 using (auth.uid() = id);

-- Auto create profile on auth signup trigger
create or replace function public.handle_new_hunter()
returns trigger as \$\$
begin
 insert into public.profiles (id, name, xp)
 values (
 new.id,
 coalesce(new.raw_user_meta_data->>''full_name'', ''Hunter''),
 340
 )
 on conflict (id) do nothing;
 return new;
end;
\$\$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
 after insert on auth.users
 for each row execute procedure public.handle_new_hunter();
