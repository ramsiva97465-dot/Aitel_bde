-- 1. Create the demo_requests table
create table public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text not null,
  message text,
  status text not null default 'new',           -- new | contacted | qualified | closed
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create indexes for performance
create index idx_demo_requests_created_at on public.demo_requests(created_at desc);
create index idx_demo_requests_status on public.demo_requests(status);

-- 3. Enable RLS
alter table public.demo_requests enable row level security;

-- 4. Security Policies
-- (Assumes you have a custom has_role function as per your standard pattern)
create policy "admins read demo requests"
  on public.demo_requests for select
  to authenticated
  using (true); -- Simplified for setup, replace with: (public.has_role(auth.uid(), 'admin'))

create policy "admins update demo requests"
  on public.demo_requests for update
  to authenticated
  using (true); -- Simplified for setup, replace with: (public.has_role(auth.uid(), 'admin'))

-- Note: The Edge Function uses the service_role key, so it bypasses RLS for inserts.
