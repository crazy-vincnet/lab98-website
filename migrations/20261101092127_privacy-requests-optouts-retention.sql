-- Privacy features: data-subject requests (/privacy/request), email opt-outs (/unsubscribe),
-- and automatic deletion of personal data past its retention period (privacy policy §3).
-- All tables are server-only: written by Next.js Server Actions with the project admin key.

-- 1) 개인정보 열람·정정·삭제·처리정지·동의 철회 요청.
--    The web form only records the request; nothing is changed or deleted until the requester
--    confirms their identity by replying to the confirmation email. The team then acts and sets
--    status = 'done' | 'rejected' and resolved_at.
create table if not exists public.privacy_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  email        text not null check (char_length(email) between 3 and 254),
  request_type text not null check (request_type in ('access', 'correct', 'delete', 'suspend', 'withdraw')),
  details      text check (details is null or char_length(details) <= 2000),
  ip_hash      text,                                  -- salted SHA-256 of the client IP, for rate limiting only
  status       text not null default 'new' check (status in ('new', 'verifying', 'done', 'rejected')),
  resolved_at  timestamptz
);

comment on table public.privacy_requests is 'Data-subject requests from /privacy/request. Server-only (admin key). Act only after the requester replies to the confirmation email. Retention: 3 years after resolution.';

create index if not exists privacy_requests_ip_hash_created_at_idx on public.privacy_requests (ip_hash, created_at desc);
create index if not exists privacy_requests_created_at_idx on public.privacy_requests (created_at desc);

alter table public.privacy_requests enable row level security;
revoke all on public.privacy_requests from anon, authenticated;

-- 2) 이메일 수신거부 목록. Any bulk / launch mail must skip these addresses.
--    Kept until the person asks otherwise (it is what stops future mail).
create table if not exists public.email_optouts (
  email      text primary key check (char_length(email) between 3 and 254 and email = lower(email)),
  created_at timestamptz not null default now(),
  source     text not null default 'web'
);

comment on table public.email_optouts is 'Email opt-out list from /unsubscribe (lowercased). Server-only (admin key). Check before any non-essential mail.';

alter table public.email_optouts enable row level security;
revoke all on public.email_optouts from anon, authenticated;

-- 3) Retention purge. Plain SQL, security invoker; only project_admin (admin key / scheduler) may run it.
--    - inquiries: closed/spam older than 1 year (created_at as proxy for "1 year after closing"),
--      and any inquiry older than 3 years regardless of status.
--    - launch_signups: 1 day after the launch notice was sent, and everything 30 days after launch (2026-11-11).
--    - privacy_requests: 3 years after resolution.
create or replace function public.purge_expired_personal_data()
returns json
language sql
volatile
set search_path = pg_catalog, public, pg_temp
as $$
  with
    del_inquiries as (
      delete from public.inquiries
      where (status in ('closed', 'spam') and created_at < now() - interval '1 year')
         or created_at < now() - interval '3 years'
      returning 1
    ),
    del_launch as (
      delete from public.launch_signups
      where (notified_at is not null and notified_at < now() - interval '1 day')
         or now() > date '2026-11-11' + interval '30 days'
      returning 1
    ),
    del_requests as (
      delete from public.privacy_requests
      where status in ('done', 'rejected')
        and resolved_at < now() - interval '3 years'
      returning 1
    )
  select json_build_object(
    'inquiries',        (select count(*) from del_inquiries),
    'launch_signups',   (select count(*) from del_launch),
    'privacy_requests', (select count(*) from del_requests),
    'ran_at',           now()
  );
$$;

comment on function public.purge_expired_personal_data() is 'Deletes personal data past its retention period (privacy policy §3). Run daily by an InsForge schedule (POST /api/database/rpc/purge_expired_personal_data with the admin key).';

revoke execute on function public.purge_expired_personal_data() from public, anon, authenticated;
