-- Admin stage 3: blog block editor + media library.
-- * posts.translation_key links a Korean and an English version of the same post.
-- * posts.division / posts.author feed the public post card (same fields the static notes have).
-- * post_versions also snapshots the cover image.
-- * media.alt_ko may never be blank (the upload action checks it too; this is the backstop).

alter table public.posts add column if not exists translation_key text;
alter table public.posts add column if not exists division text not null default 'master';
alter table public.posts add column if not exists author text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'posts_division_check') then
    alter table public.posts add constraint posts_division_check check (division in ('master', 'dev', 'ai', 'faith'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'media_alt_ko_required') then
    alter table public.media add constraint media_alt_ko_required check (length(btrim(alt_ko)) > 0);
  end if;
end $$;

-- One version per language inside a translation group.
create unique index if not exists posts_translation_key_locale_uidx
  on public.posts (translation_key, locale) where translation_key is not null;
create index if not exists posts_cover_media_idx on public.posts (cover_media_id) where cover_media_id is not null;

alter table public.post_versions add column if not exists cover_media_id uuid;
create unique index if not exists post_versions_post_version_uidx on public.post_versions (post_id, version);
