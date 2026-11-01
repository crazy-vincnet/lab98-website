-- 1) Division rename Web → Dev: contact form now sends 'dev'. Keep 'web' valid for older rows.
alter table public.inquiries drop constraint if exists inquiries_interest_check;
alter table public.inquiries add constraint inquiries_interest_check
  check (interest in ('master', 'dev', 'web', 'ai', 'faith'));

-- 2) Product launch notifications (Praise Tool, 2026-11-11). Server-only, same model as inquiries.
create table if not exists public.launch_signups (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  product     text not null default 'praise-tool' check (product in ('praise-tool')),
  email       text not null check (char_length(email) between 3 and 254),
  org         text check (org is null or char_length(org) <= 100),  -- church / organization (optional)
  consent_at  timestamptz not null,
  ip_hash     text,
  notified_at timestamptz,                                          -- when the launch email was sent
  unique (product, email)
);

comment on table public.launch_signups is 'Launch notification sign-ups from the website. Server-only (admin key). Delete after the launch notice is sent (privacy policy).';

create index if not exists launch_signups_ip_hash_created_at_idx on public.launch_signups (ip_hash, created_at desc);

alter table public.launch_signups enable row level security;
revoke all on public.launch_signups from anon, authenticated;
