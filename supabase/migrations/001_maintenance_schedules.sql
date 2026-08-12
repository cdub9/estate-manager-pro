-- ============================================================
-- Migration: Maintenance schedules (preventive maintenance)
-- Run this once in the Supabase SQL editor (Project → SQL Editor)
-- on an existing project that predates this feature. New projects
-- get the same objects from schema.sql.
--
-- Each schedule tracks recurring upkeep for an inventory asset OR a
-- free-text subject (e.g. "Front lawn"). next_due is rolled forward
-- when the work is logged as serviced.
-- ============================================================

create table if not exists maintenance_schedules (
  id                uuid primary key default gen_random_uuid(),
  estate_id         uuid not null references estates(id) on delete cascade,
  title             text not null,
  subject           text not null default '',
  inventory_id      uuid references inventory(id) on delete set null,
  interval_unit     text not null default 'month',
  interval_count    integer not null default 1,
  anchor            text not null default 'completion',
  assignee_ids      uuid[] not null default '{}',
  category_id       uuid references categories(id) on delete set null,
  next_due          bigint not null,
  last_completed_at bigint,
  notes             text not null default '',
  active            boolean not null default true,
  created_by_id     uuid references profiles(id) on delete set null,
  created_at        bigint not null,
  updated_at        bigint not null
);

alter table maintenance_schedules enable row level security;

-- Policies are dropped first so this migration is safe to re-run.
drop policy if exists "read estate maintenance"   on maintenance_schedules;
drop policy if exists "insert estate maintenance" on maintenance_schedules;
drop policy if exists "update estate maintenance" on maintenance_schedules;
drop policy if exists "delete estate maintenance" on maintenance_schedules;

create policy "read estate maintenance"
  on maintenance_schedules for select using (estate_id = get_my_estate_id());
create policy "insert estate maintenance"
  on maintenance_schedules for insert with check (estate_id = get_my_estate_id());
create policy "update estate maintenance"
  on maintenance_schedules for update using (estate_id = get_my_estate_id());
create policy "delete estate maintenance"
  on maintenance_schedules for delete using (estate_id = get_my_estate_id());
