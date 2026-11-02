# Admin (`/admin`) architecture

Owner-only back office. Korean UI. All planned stages are built: 1 foundation, 2 requests, 3 blog + media, 4a content engine, 4b all site copy.
Project overview, env vars and the operations runbook: [README](../README.md). Copy editing engine: [admin-content.md](admin-content.md).

## Layout

```
src/
  proxy.ts                         Next 16 proxy: updateSession() ONLY for /admin/** and /api/auth/**; adds X-Robots-Tag
  app/api/auth/refresh/route.ts    createRefreshAuthRouter() (SDK token refresh)
  app/(admin)/layout.tsx           ROOT layout #3: <html lang="ko">, noindex, imports ../styles, Suspense, no site chrome
  app/(admin)/admin/(auth)/        login, setup, forgot-password + actions.ts (the only actions without requireAdmin)
  app/(admin)/admin/(preview)/     content preview (iframe / new tab), no sidebar
  app/(admin)/admin/(panel)/       everything behind login; layout.tsx = sidebar/topbar shell
    page.tsx                       dashboard         audit/ search/ (built)
    blog/ media/                   built (stage 3, see "Blog + media" below)
    inquiries/ launch/ privacy/ optouts/   built (stage 2)
    content/ projects/ praise-tool/ faq/ legal/   built (stage 4a engine, 4b registry): see docs/admin-content.md
  app/(admin)/admin/api/media/route.ts   media upload + list (adminRoute). Lives under /admin so proxy.ts refreshes the session cookies for it
  components/admin/*               primitives (below)
  lib/admin/*                      server helpers (below)
  lib/site-settings.ts             public-site side: getSiteSettings() "use cache" + tag `site-settings`
migrations/20261101120000_admin-foundation.sql   all admin tables (applied)
```

`(ko)`, `(en)/en` and `(admin)` are three independent root layouts; `global-not-found.tsx` still handles unmatched URLs.
Admin pages are dynamic (they read cookies) and render behind the Suspense in `(admin)/layout.tsx`. The public site never
goes through `proxy.ts`. `/admin` is not in `sitemap.ts` and is disallowed in `robots.ts`.

## Auth model

* Sign-in is InsForge email+password via `createAuthActions()`; cookies are `insforge_access_token` / `insforge_refresh_token`.
* **Signup on the project is open, so "signed in" means nothing.** `requireAdmin()` (`lib/admin/auth.ts`) requires a valid session
  (checked against InsForge), `emailVerified === true`, and the email in `ADMIN_EMAILS` **or** a row in `admins`. Fails closed.
* `/admin/setup` only lets an `ADMIN_EMAILS`/`admins` address create the account, and first removes any *unverified*
  pre-registration of that address (`admin_purge_unverified_user`, service key only) so nobody can plant a password for the owner.
* Sign-in, setup and reset never reveal whether an email exists or is an admin (same messages, setup/reset always show the code step).
* `login_attempts` throttles by salted hash of IP+email (5 failures / 10 min; 20 per IP).

## The three patterns every stage must use

```ts
// 1. Page: first line
export default async function Page() {
  const admin = await requireAdmin();           // redirects to /admin/login
  ...
}

// 2. Server Action: wrap it; the check runs before your code
"use server";
export const savePost = adminAction(async ({ admin }, prev: State, formData: FormData) => {
  ...                                           // service-key data access is fine from here
  await audit(admin.email, "post.save", { type: "post", id }, { slug });
  updateTag("posts");                           // if public pages read it
  redirectWithFlash("/admin/blog", "ok", "저장했어요.");
});

// 3. Route handler (app/api/admin/**): 401 JSON instead of redirect
export const POST = adminRoute(async ({ admin }, request: Request) => Response.json({ ok: true }));
```

Rules: never import `getInsforgeAdmin()` in a page/action before the check; never trust a layout for security (layouts are not
re-run on client navigation); never return tokens or service data you did not intend to show. Do not put secrets or whole message
bodies in `audit` meta. Data access always uses `getInsforgeAdmin()` (RLS is on with no policies; anon/authenticated have no access).

## Helpers (`src/lib/admin`, server-only)

| File | What |
| --- | --- |
| `auth.ts` | `requireAdmin()`, `getAdmin()` (null if not admin), `isAdminEmail()` |
| `action.ts` | `adminAction(fn)`, `adminRoute(fn)` |
| `audit.ts` | `audit(actor, action, target?, meta?)` -> `audit_log`; never throws |
| `flash.ts` | `redirectWithFlash(path, "ok"\|"error", text)` -> toast on the next page |
| `nav.ts` | Sidebar sections (every entry is `ready: true` now; `ready: false` would render `<ComingSoon/>`) |
| `format.ts` | `formatKst(iso)` |
| `throttle.ts`, `insforge.ts`, `env.ts`, `auth-state.ts`, `search.ts` | sign-in plumbing / search page logic |

## Primitives (`src/components/admin`)

`Button`, `LinkButton`, `SubmitButton` (pending state), `ConfirmButton` (two-step), `Field` + `TextInput`/`TextArea`/`SelectInput`
(label, hint, error, aria wiring), `Table`/`THead`/`TBody`/`Tr`/`Th`/`Td`/`EmptyRow`, `Badge`, `Card`/`Stat`, `PageHeader`, `Alert`,
`Toast` + `FlashFromUrl`, `CopyButton`, `ComingSoon`, `AdminShell`. Style: site tokens from `globals.css`, plain and readable,
44px touch targets, Korean "해요체" copy. Add new generic pieces here; feature-specific components go in a feature subfolder
(`components/admin/<feature>/`).

## Database (all applied)

Foundation (`20261101120000_admin-foundation.sql`): `admins`, `audit_log`, `login_attempts`, `site_settings`, `content_entries` (+`content_versions`),
`posts` (+`post_versions`), `media` (+ public storage bucket `media`), `inquiry_replies`, `mail_campaigns`; `inquiries` gained `admin_note`, `replied_at`
(its `status` allows new|replied|closed|spam). Later migrations: `…120001_admin-requests` (campaign send state, privacy request notes), `…140000_blog-media-stage3`,
`…150000_content-engine-stage4a`. The public-form tables (`inquiries`, `launch_signups`, `privacy_requests`, `email_optouts`, `unsubscribe_confirmations`) and the
retention function are listed in the README (section 6). Add columns/tables only with a new migration; every table has RLS on and no policies (service key only).

## Cache & public pages

The public site is static (Cache Components). Anything the admin edits that public pages show must be read through a
`"use cache"` function with `cacheTag(...)` and the admin action must call `updateTag(tag)` (Server Actions only; use
`revalidateTag(tag, "max")` in route handlers). Reference: `lib/site-settings.ts` + `search/actions.ts`. Search-verification meta tags
come from `site_settings` (env `GOOGLE_SITE_VERIFICATION`/`NAVER_SITE_VERIFICATION` only as fallback).
Never use `Date.now()`/`new Date()` in code that prerenders; admin pages and actions are fine.

## Blog + media (stage 3)

Migration `20261101140000_blog-media-stage3.sql`: `posts.translation_key` (+ unique per language), `posts.division`, `posts.author`,
`post_versions.cover_media_id`, `media.alt_ko` may not be blank (DB check = backstop for the upload code).

### Media library `/admin/media`
* Upload = `POST /admin/api/media` (multipart `file`, `alt_ko` required, `alt_en`). The server checks the **real** file type from its bytes
  (`lib/admin/image-info.ts`: png, jpg, webp, gif; **SVG is rejected** because it can carry script), reads width/height, max 5MB, then
  uploads with the admin key to the public `media` bucket under a random key (`uploads/YYYY/MM/<uuid>.<ext>`; the user's file name is never used)
  and inserts the `media` row (`key` + `url`). A failed insert removes the file again.
  Hosting caveat: serverless hosts cap request bodies (Vercel: 4.5MB), so a 4.5-5MB file can be refused by the host before our 5MB check.
* The grid shows size, whether the English alt is missing (warning only), and **where each image is used** (post cover, body, SEO image;
  `getMediaUsage()` reads `posts.cover_media_id`, `seo.og_media_id` and image nodes in `posts.blocks`). **Delete is blocked while it is used.**
* `<MediaPicker onSelect locale>` (`components/admin/media/media-picker.tsx`) is the reusable modal (native `<dialog>`: library, search by alt, or upload).
  Used by the editor toolbar (image), cover image and SEO share image. For English posts it warns when `alt_en` is empty and falls back to `alt_ko`.
* Editing alt text calls `updateTag("posts")` (cover alt is read from the library); alt text already copied into a post body stays as it was.

### Blog `/admin/blog`, `/new`, `/[id]`, `/[id]/preview`
* Body = Tiptap JSON in `posts.blocks` (`@tiptap/react` + `starter-kit` + `extension-image` + `extension-placeholder`, all pinned to 3.32.2;
  Link comes with StarterKit, underline/strike are turned off). `lib/post-doc.ts` is the one allowlist: `normalizeDoc()` keeps only
  paragraph, heading 2/3, bold/italic/code/link, lists, quote, code block, divider, image, hard break, and `sanitizeUrl()` allows only
  `http(s)`, `mailto:` and site-relative links. It runs in the editor, on every save (server) and again when rendering.
* Public rendering = `components/notes/rich-body.tsx`: React elements only, **no dangerouslySetInnerHTML**.
* Status `draft | scheduled | published`, `published_at` (typed in KST). **Scheduled needs no cron**: the public reader treats
  `status='scheduled' AND published_at <= now()` as live, evaluated inside the cached function (`lib/posts.ts`, `isLive`).
* Autosave every ~10s (only while the saved status is `draft`; a live/scheduled post is changed only by the explicit save button).
  Saves carry the `updated_at` the editor loaded; if another tab saved in between the save is refused (no silent overwrite).
* Versions: every manual save/schedule/publish snapshots title, excerpt, body, SEO and cover into `post_versions` (last 50 kept);
  restore snapshots the current state first, then applies the old one (title/excerpt/body/SEO/cover; status and slug stay).
* Translation: "영어/한국어 버전 만들기" creates a sibling draft that shares `translation_key` (same slug if free, else `-en`/`-ko`).
  hreflang alternates and sitemap `alternates` are emitted only when a sibling exists. Posts and static notes pair by slug when there is no key.
* Preview `/admin/blog/[id]/preview` renders the saved post with the same `<InsightArticle>` the public page uses.
* Slug rules: `^[a-z0-9]+(-[a-z0-9]+)*$`, max 80, unique per language (validated before save, DB unique as backstop).
  A title with no latin letters suggests `post-YYMMDD-xxxx`.

### Public side (`/insights`, `/insights/[slug]`, `/en/insights*`, RSS, sitemap, OG image)
* `lib/posts.ts`: `getLivePosts(locale)` / `getLivePost(locale, slug)`, `"use cache"` + `cacheTag("posts")` + `cacheLife("minutes")`
  (revalidate 60s, so a scheduled post shows up about 1-2 minutes after its time). Every post save/publish/delete/restore/translate calls
  `updateTag("posts")` (draft-to-draft autosaves skip it: nothing public changes). They never throw (DB error -> empty list, retried in a minute).
* `lib/insights.ts` merges them with the static notes in `content.ts` / `content.en.ts` (same slug + language: **the DB post wins**).
  `getInsights`, `getInsight`, `getInsightSlugs`, `findTranslation`, `getInsightLanguages`. `starting-lab98` was copied into the DB with
  `tools/seed-starting-post.mts` (`npx -y tsx --env-file=.env.local tools/seed-starting-post.mts --apply`); delete those two rows and the static
  note is the fallback again.
* Slugs added later: `generateStaticParams` lists what is live at build; other slugs render on first visit and are cached (ISR with
  Cache Components, `dynamicParams` stays on). Unknown/draft/future slugs call `notFound()` (404). `ensureStatic = "navigation"` stays.
* RSS (`insights/rss.xml`), `sitemap.ts`, the per-post OG image (`insights/[slug]/opengraph-image.tsx`, Korean) and the home "latest insights"
  block read the same merged list. A post's own SEO share image replaces the generated card in its metadata.
* Not covered yet: `llms.txt` / `llms-full.txt` (still static notes only), per-post English OG cards (English uses the generic card unless a share image is set).

## Requests (stage 2)

* `/admin/inquiries`: list/detail, reply (sent through InsForge email, stored in `inquiry_replies`, `reply-to` = `hello@lab98.io`), status, note, spam, delete.
* `/admin/launch`: Praise Tool sign-ups + the launch mail. Flow: compose -> **test mail to yourself is required** -> real send in chunks of 8 (1.2s apart,
  recipients are claimed via `notified_at` before sending so nobody is mailed twice) -> pauses when InsForge's hourly cap (10-50 mails, plan dependent) is hit ->
  resume. Opt-outs are skipped (fail-closed if the lookup fails); every mail carries a per-recipient signed unsubscribe link (`lib/unsubscribe-token.ts`, env `UNSUBSCRIBE_SECRET`).
  Max 5 new campaigns per hour. CSV export at `/api/admin/launch/export`.
* `/admin/privacy`: data-subject requests (due date = receipt + 10 days) and `/admin/privacy/erase` (preview, then erase by email across tables; audit stores a hash, not the address).
* `/admin/optouts`: add/remove/export. Tokenless `/unsubscribe` requests only trigger a confirmation mail (cooldown + caps in `unsubscribe_confirmations`).

## Content override engine (stages 4a + 4b)

See **docs/admin-content.md** (API `getCopy`, registered documents, conversion recipe, pitfalls). Migration `20261101150000_content-engine-stage4a.sql` adds `draft` columns to `content_entries`. Stage 4b registered all site copy (ko + en), FAQ, Praise Tool, legal documents and SEO meta.

## File ownership

| Area | Owner | Notes |
| --- | --- | --- |
| `proxy.ts`, `lib/admin/{auth,action,audit,throttle,insforge,env}.ts`, `(admin)/layout.tsx`, `(auth)/**`, `(panel)/layout.tsx`, migration `…_admin-foundation.sql`, `components/admin/*` primitives | Stage 1 | Change only to fix bugs or add a primitive; do not weaken `requireAdmin` |
| `lib/admin/nav.ts` | shared | each stage flips its own entries to `ready: true` (and may add sub-links) |
| `(panel)/inquiries`, `launch`, `privacy`, `optouts` + `components/admin/requests/*` | Stage 2 | |
| `(panel)/blog` + `components/admin/blog/*` (block editor), `lib/posts.ts`, `lib/insights.ts`, `lib/post-doc.ts`, `lib/admin/posts.ts`, `components/notes/rich-body.tsx` | Stage 3 | public side reads posts only through `lib/insights.ts` |
| `(panel)/content`, `projects`, `praise-tool`, `faq`, `legal`, `(preview)` + `components/admin/content/*`, `lib/copy-store.ts`, `lib/content-registry*.ts`, `lib/site-content.ts` | Stage 4 | public side reads via `getCopy` / `getSiteContent` |
| `(panel)/media` + `components/admin/media/*`, `app/(admin)/admin/api/media`, `lib/admin/{media,image-info}.ts` | Stage 3 | storage bucket `media` already exists |
| `(panel)/search`, `(panel)/audit`, dashboard `(panel)/page.tsx`, `lib/site-settings.ts` | Stage 1 | |
| `src/app/(ko)`, `(en)`, `components/pages/*`, `lib/seo.ts` | public site | stages touch these only to read admin-managed data |
