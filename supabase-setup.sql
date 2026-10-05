create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (char_length(btrim(email)) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  message text check (message is null or char_length(message) <= 5000),
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

revoke all on table public.contact_submissions from anon, authenticated;
grant insert (name, email, phone, message, consent) on table public.contact_submissions to anon, authenticated;
grant select on table public.contact_submissions to authenticated;

drop policy if exists "Public can submit contact requests" on public.contact_submissions;
create policy "Public can submit contact requests"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (consent = true);

drop policy if exists "Only the configured admin can read contact requests" on public.contact_submissions;
create policy "Only the configured admin can read contact requests"
  on public.contact_submissions
  for select
  to authenticated
  using (auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid);