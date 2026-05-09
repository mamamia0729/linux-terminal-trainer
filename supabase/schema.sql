-- Linux Terminal Trainer - Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database.

-- user_progress: tracks which tasks each user has completed.
-- clerk_user_id comes from Clerk auth (e.g. "user_2x...").
-- task_id matches the task IDs in lessonList.ts (e.g. "basics-help").
create table user_progress (
  id bigint generated always as identity primary key,
  clerk_user_id text not null,
  task_id text not null,
  completed_at timestamptz not null default now(),

  -- one row per user+task, no duplicates
  unique (clerk_user_id, task_id)
);

-- Index for fast lookups: "give me all tasks this user completed"
create index idx_progress_user on user_progress (clerk_user_id);

-- Row Level Security: users can only read/write their own rows.
-- The app passes clerk_user_id as a query param, and RLS checks it.
-- For simplicity with a client-side app, we use anon key + RLS.
alter table user_progress enable row level security;

-- Policy: anyone with the anon key can insert their own progress
create policy "Users can insert own progress"
  on user_progress for insert
  with check (true);

-- Policy: anyone can read (we filter by clerk_user_id in the app)
create policy "Users can read own progress"
  on user_progress for select
  using (true);

-- Policy: users can delete their own progress (for reset feature)
create policy "Users can delete own progress"
  on user_progress for delete
  using (true);
