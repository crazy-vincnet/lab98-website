-- Admin (/admin) foundation: every table the admin stages need, created once so stages don't collide.
-- All tables are server-only: RLS on, no policies, anon/authenticated privileges revoked. Written and read
-- only by Next.js Server Actions / route handlers with the project admin key AFTER requireAdmin() passes.

-- 1) Extra admins besides ADMIN_EMAILS env. Being in this table (or env) AND having a verified email = admin.
create table if not exists public.admins (
  email      text primary key check (char_length(email) between 3 and 254 and email = lower(email)),
  created_at timestamptz not null default now()
);
comment on table public.admins is 'Additional admin emails (lowercase). ADMIN_EMAILS env always counts too. Checked by requireAdmin() in src/lib/admin/auth.ts.';

-- 2) Audit log: who did what, written by audit() in src/lib/admin/audit.ts.
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_email text not null,
  action      text not null,
  target_type text,
  target_id   text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- 3) Login throttling. Hashes only (salted SHA-256) - no raw IP or email. Old rows are purged by the app.
create table if not exists public.login_attempts (
  id         bigint generated always as identity primary key,
  kind       text not null default 'login' check (kind in ('login', 'setup', 'reset')),
  ip_hash    text not null,
  email_hash text not null,
  success    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_ip_created_idx on public.login_attempts (ip_hash, created_at desc);
create index if not exists login_attempts_ip_email_created_idx on public.login_attempts (ip_hash, email_hash, created_at desc);

-- 4) Site-wide settings (search verification codes, etc.).
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- 5) Editable page copy. One row per (key, locale); published rows are what the public site reads.
create table if not exists public.content_entries (
  id         uuid primary key default gen_random_uuid(),
  key        text not null,
  locale     text not null check (locale in ('ko', 'en')),
  status     text not null default 'draft' check (status in ('draft', 'published')),
  data       jsonb not null default '{}'::jsonb,
  version    int not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text,
  unique (key, locale)
);
create table if not exists public.content_versions (
  id         bigint generated always as identity primary key,
  key        text not null,
  locale     text not null,
  version    int not null,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  created_by text,
  note       text
);
create index if not exists content_versions_key_locale_idx on public.content_versions (key, locale, version desc);

-- 6) Blog posts (block editor) + history.
create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  locale         text not null default 'ko' check (locale in ('ko', 'en')),
  status         text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  title          text not null default '',
  excerpt        text not null default '',
  cover_media_id uuid,
  blocks         jsonb not null default '[]'::jsonb,
  seo            jsonb not null default '{}'::jsonb,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (slug, locale)
);
create index if not exists posts_status_published_idx on public.posts (status, published_at desc);

create table if not exists public.post_versions (
  id         bigint generated always as identity primary key,
  post_id    uuid not null references public.posts(id) on delete cascade,
  version    int not null,
  title      text not null default '',
  excerpt    text not null default '',
  blocks     jsonb not null default '[]'::jsonb,
  seo        jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by text,
  note       text
);
create index if not exists post_versions_post_idx on public.post_versions (post_id, version desc);

-- 7) Media library (files live in the public `media` storage bucket).
create table if not exists public.media (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  url        text not null,
  alt_ko     text not null default '',
  alt_en     text not null default '',
  width      int,
  height     int,
  mime       text,
  size       bigint,
  created_at timestamptz not null default now()
);
create index if not exists media_created_at_idx on public.media (created_at desc);

alter table public.posts
  add constraint posts_cover_media_fk foreign key (cover_media_id) references public.media(id) on delete set null;

-- 8) Inquiry replies and mail campaigns (launch notice etc.).
create table if not exists public.inquiry_replies (
  id         uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  to_email   text not null,
  subject    text not null,
  body       text not null,
  sent_at    timestamptz,
  sent_by    text,
  error      text,
  created_at timestamptz not null default now()
);
create index if not exists inquiry_replies_inquiry_idx on public.inquiry_replies (inquiry_id, created_at desc);

create table if not exists public.mail_campaigns (
  id               uuid primary key default gen_random_uuid(),
  kind             text not null,
  subject          text not null,
  body             text not null,
  recipients_count int not null default 0,
  skipped_optout   int not null default 0,
  sent_at          timestamptz,
  sent_by          text,
  status           text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'failed')),
  created_at       timestamptz not null default now()
);

-- 9) Existing tables: admin-only extras (status values new|replied|closed|spam already exist on inquiries).
alter table public.inquiries add column if not exists admin_note text;
alter table public.inquiries add column if not exists replied_at timestamptz;

-- 10) Lock everything down: server-only via the admin key.
do $$
declare t text;
begin
  foreach t in array array[
    'admins', 'audit_log', 'login_attempts', 'site_settings', 'content_entries', 'content_versions',
    'posts', 'post_versions', 'media', 'inquiry_replies', 'mail_campaigns'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- 11) Setup hardening: signup is open, so someone could pre-register the owner's email with their own
--     password. /admin/setup calls this (admin key only) right before signing the owner up, which removes any
--     UNVERIFIED account for that email. Verified accounts are never touched.
create or replace function public.admin_purge_unverified_user(p_email text)
returns int
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare n int;
begin
  delete from auth.users where lower(email) = lower(p_email) and email_verified = false;
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function public.admin_purge_unverified_user(text) from public, anon, authenticated;
