-- Admin stage 2 (inquiries / launch mail / privacy requests): the few columns the first migration did not have.

-- Bulk launch mail campaigns: the content is frozen when the test mail is sent; the real send is resumable.
alter table public.mail_campaigns add column if not exists test_sent_at timestamptz;          -- required before the real send
alter table public.mail_campaigns add column if not exists sent_count   int         not null default 0;
alter table public.mail_campaigns add column if not exists failures     jsonb       not null default '[]'::jsonb;  -- [{email, error, at}]
alter table public.mail_campaigns add column if not exists last_error   text;                  -- e.g. hourly rate limit message
alter table public.mail_campaigns add column if not exists updated_at   timestamptz not null default now();
create index if not exists mail_campaigns_created_at_idx on public.mail_campaigns (created_at desc);

-- Privacy requests: admin note + last change. Status stays new -> verifying -> done | rejected.
alter table public.privacy_requests add column if not exists admin_note text check (admin_note is null or char_length(admin_note) <= 2000);
alter table public.privacy_requests add column if not exists updated_at timestamptz;
