-- Signed-token unsubscribe: per-address cooldown for confirmation mails sent from /unsubscribe.
-- email_hash = HMAC-SHA256(UNSUBSCRIBE_SECRET, normalized email) in hex, so no raw address is stored.
-- A row means "a confirmation mail went to this address at last_sent_at"; at most 1 mail per address per hour.
-- The same table, counted over the last hour, is the site-wide cap on confirmation mails.
-- Rows older than a day are deleted by the app. Server-only (admin key).
create table if not exists public.unsubscribe_confirmations (
  email_hash   text primary key check (char_length(email_hash) = 64),
  last_sent_at timestamptz not null default now()
);

comment on table public.unsubscribe_confirmations is 'Cooldown + global cap for unsubscribe confirmation mails (hashed address, last send time). Server-only (admin key). Rows are purged after 1 day.';

create index if not exists unsubscribe_confirmations_last_sent_at_idx on public.unsubscribe_confirmations (last_sent_at desc);

alter table public.unsubscribe_confirmations enable row level security;
revoke all on public.unsubscribe_confirmations from anon, authenticated;
