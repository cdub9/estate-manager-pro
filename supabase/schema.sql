-- ============================================================
-- Estate Manager Pro – Supabase Schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor).
-- ============================================================

-- 1. Estates (households / workspaces)
create table if not exists estates (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  join_code text unique not null
              default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz default now()
);

-- 2. Profiles (one per auth user, belongs to one estate)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  estate_id   uuid not null references estates(id),
  email       text not null,
  name        text not null,
  color_index integer not null default 0,
  timezone    text not null default 'America/Denver',
  created_at  bigint not null
);

-- 3. Categories
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  estate_id  uuid not null references estates(id) on delete cascade,
  name       text not null,
  color      text not null,
  created_at bigint not null
);

-- 4. Tasks
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  estate_id     uuid not null references estates(id) on delete cascade,
  title         text not null,
  description   text not null default '',
  status        text not null default 'open',
  assignee_ids  uuid[] not null default '{}',
  created_by_id uuid references profiles(id) on delete set null,
  due_date      bigint,
  photos        text[] not null default '{}',
  inventory_ids uuid[] not null default '{}',
  category_id   uuid references categories(id) on delete set null,
  recurrence    text not null default 'none',
  "order"       integer not null default 0,
  created_at    bigint not null,
  updated_at    bigint not null,
  completed_at  bigint,
  comments      jsonb not null default '[]'::jsonb
);

-- 5. Inventory
create table if not exists inventory (
  id          uuid primary key default gen_random_uuid(),
  estate_id   uuid not null references estates(id) on delete cascade,
  name        text not null,
  vendor      text not null default '',
  part_number text not null default '',
  location    text not null default '',
  description text not null default '',
  photo       text,
  state       text not null default 'active',
  archived_at bigint,
  created_at  bigint not null,
  updated_at  bigint not null
);

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table estates   enable row level security;
alter table profiles  enable row level security;
alter table categories enable row level security;
alter table tasks     enable row level security;
alter table inventory enable row level security;

-- Helper: returns the calling user's estate_id (NULL before profile exists)
create or replace function get_my_estate_id()
returns uuid
language sql stable security definer
as $$
  select estate_id from profiles where id = auth.uid()
$$;

-- Estates: members can read their own estate
create policy "read own estate"
  on estates for select
  using (id = get_my_estate_id());

-- Profiles: estate members can read each other
create policy "read estate profiles"
  on profiles for select
  using (estate_id = get_my_estate_id());

-- Profiles: users can insert their own profile (during registration via RPC)
create policy "insert own profile"
  on profiles for insert
  with check (id = auth.uid());

-- Profiles: users can update their own profile
create policy "update own profile"
  on profiles for update
  using (id = auth.uid());

-- Categories
create policy "read estate categories"
  on categories for select using (estate_id = get_my_estate_id());
create policy "insert estate categories"
  on categories for insert with check (estate_id = get_my_estate_id());
create policy "update estate categories"
  on categories for update using (estate_id = get_my_estate_id());
create policy "delete estate categories"
  on categories for delete using (estate_id = get_my_estate_id());

-- Tasks
create policy "read estate tasks"
  on tasks for select using (estate_id = get_my_estate_id());
create policy "insert estate tasks"
  on tasks for insert with check (estate_id = get_my_estate_id());
create policy "update estate tasks"
  on tasks for update using (estate_id = get_my_estate_id());
create policy "delete estate tasks"
  on tasks for delete using (estate_id = get_my_estate_id());

-- Inventory
create policy "read estate inventory"
  on inventory for select using (estate_id = get_my_estate_id());
create policy "insert estate inventory"
  on inventory for insert with check (estate_id = get_my_estate_id());
create policy "update estate inventory"
  on inventory for update using (estate_id = get_my_estate_id());
create policy "delete estate inventory"
  on inventory for delete using (estate_id = get_my_estate_id());

-- ============================================================
-- Registration RPCs (security definer = bypass RLS)
-- These run under the function owner's privileges so a brand-new
-- user (who has no profile yet) can create or join an estate.
-- ============================================================

-- Create a new estate and profile in one atomic call.
create or replace function register_new_estate(
  p_email       text,
  p_name        text,
  p_color_index integer,
  p_timezone    text
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_estate_id  uuid;
  v_join_code  text;
  v_created_at bigint;
begin
  v_created_at := (extract(epoch from now()) * 1000)::bigint;

  insert into estates (name)
  values (p_name || '''s Estate')
  returning id, join_code into v_estate_id, v_join_code;

  insert into profiles (id, estate_id, email, name, color_index, timezone, created_at)
  values (auth.uid(), v_estate_id, p_email, p_name, p_color_index, p_timezone, v_created_at);

  return jsonb_build_object(
    'estate_id',  v_estate_id,
    'join_code',  v_join_code
  );
end;
$$;

-- Join an existing estate by join code.
create or replace function join_existing_estate(
  p_join_code   text,
  p_email       text,
  p_name        text,
  p_color_index integer,
  p_timezone    text
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_estate_id  uuid;
  v_join_code  text;
  v_created_at bigint;
begin
  v_created_at := (extract(epoch from now()) * 1000)::bigint;

  select id, join_code into v_estate_id, v_join_code
  from estates
  where upper(join_code) = upper(p_join_code);

  if v_estate_id is null then
    raise exception 'No estate found with that code';
  end if;

  insert into profiles (id, estate_id, email, name, color_index, timezone, created_at)
  values (auth.uid(), v_estate_id, p_email, p_name, p_color_index, p_timezone, v_created_at);

  return jsonb_build_object(
    'estate_id',  v_estate_id,
    'join_code',  v_join_code
  );
end;
$$;

-- Remove a specific inventory item ID from all tasks in an estate.
-- Called when an inventory item is deleted.
create or replace function remove_inventory_from_tasks(
  p_inventory_id uuid
)
returns void
language sql security definer
as $$
  update tasks
  set inventory_ids = array_remove(inventory_ids, p_inventory_id),
      updated_at    = (extract(epoch from now()) * 1000)::bigint
  where estate_id = get_my_estate_id()
    and p_inventory_id = any(inventory_ids);
$$;
