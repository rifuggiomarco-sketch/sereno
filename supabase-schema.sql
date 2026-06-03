-- TASK 5: Database tables for Sereno

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users(id) primary key,
  name text default '',
  streak integer default 0,
  trees integer default 0,
  intensity text default 'balanced',
  active_mode text default 'famiglia',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Sessions (focus sessions logged by the user)
create table sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  type text not null,                -- 'breath' | 'bloom'
  duration integer not null,         -- minutes
  flower text,                       -- 'rose' | 'lotus' | 'sunflower' | 'cherry'
  completed boolean default false,
  created_at timestamptz default now()
);

alter table sessions enable row level security;

-- Friendships
create table friendships (
  user_id uuid references profiles(id) not null,
  friend_id uuid references profiles(id) not null,
  created_at timestamptz default now(),
  primary key (user_id, friend_id)
);

alter table friendships enable row level security;

-- Gifts (gestures between friends)
create table gifts (
  id uuid default gen_random_uuid() primary key,
  from_id uuid references profiles(id) not null,
  to_id uuid references profiles(id) not null,
  gift_type text not null,           -- 'bee' | 'butterfly' | 'leaf' | 'seed'
  created_at timestamptz default now()
);

alter table gifts enable row level security;

-- RLS policies
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can read own sessions"
  on sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on sessions for insert with check (auth.uid() = user_id);

create policy "Users can read friendships"
  on friendships for select using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can insert friendships"
  on friendships for insert with check (auth.uid() = user_id);

create policy "Users can read gifts they send or receive"
  on gifts for select using (auth.uid() = from_id or auth.uid() = to_id);

create policy "Users can send gifts"
  on gifts for insert with check (auth.uid() = from_id);
