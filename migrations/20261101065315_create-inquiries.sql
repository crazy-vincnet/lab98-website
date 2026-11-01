-- Contact form submissions from the website (home → #contact).
-- Written only by the Next.js Server Action using the project admin key.
-- Visitors (anon) and signed-in users have no direct access at all.

create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  interest      text not null check (interest in ('master', 'web', 'ai', 'faith')),
  name          text check (name is null or char_length(name) <= 100),
  email         text not null check (char_length(email) between 3 and 254),
  message       text not null check (char_length(message) between 1 and 2000),
  consent_at    timestamptz not null,               -- when the visitor agreed to the privacy notice
  ip_hash       text,                               -- salted SHA-256 of the client IP, for rate limiting only
  user_agent    text check (user_agent is null or char_length(user_agent) <= 300),
  status        text not null default 'new' check (status in ('new', 'replied', 'closed', 'spam')),
  notified      boolean not null default false      -- notification email delivered to the team
);

comment on table public.inquiries is 'Website contact form submissions. Server-only (admin key). Retention: delete 1 year after the inquiry is closed (privacy policy).';

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_ip_hash_created_at_idx on public.inquiries (ip_hash, created_at desc);

alter table public.inquiries enable row level security;

-- No policies for anon/authenticated on purpose: deny everything from the public API.
revoke all on public.inquiries from anon, authenticated;
