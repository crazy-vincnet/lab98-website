-- Stage 4a: content override engine. One row per (key, locale):
--   data  = PUBLISHED partial override, flat map { "path.to.leaf": "text" } (only edited string leaves)
--   draft = unpublished working copy of the same shape (NULL = no pending draft)
-- status is 'draft' while a draft is pending (or nothing was ever published), else 'published'. The public site reads `data` only.
alter table public.content_entries add column if not exists draft jsonb;
alter table public.content_entries add column if not exists draft_updated_at timestamptz;
alter table public.content_entries add column if not exists draft_updated_by text;
alter table public.content_entries add column if not exists published_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'content_entries_key_format') then
    alter table public.content_entries add constraint content_entries_key_format check (key ~ '^[a-z0-9][a-z0-9._-]{0,79}$');
  end if;
end $$;

create unique index if not exists content_versions_key_locale_version_uidx on public.content_versions (key, locale, version);
