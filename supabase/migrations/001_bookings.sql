-- supabase/migrations/001_bookings.sql

create extension if not exists "pgcrypto";

create table bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  start_date date not null,
  end_date date not null,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  ical_uid uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Block all direct client access — only service role key (server-side) can access
alter table bookings enable row level security;
-- No RLS policies are needed since we exclusively use the service role key in API routes
