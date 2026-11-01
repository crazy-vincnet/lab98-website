# Admin (`/admin`) architecture

Owner-only back office. Korean UI. Stage 1 (foundation) is done; stages 2-4 build on it.

## Layout

```
src/
  proxy.ts                         Next 16 proxy: updateSession() ONLY for /admin/** and /api/auth/**; adds X-Robots-Tag
  app/api/auth/refresh/route.ts    createRefreshAuthRouter() (SDK token refresh)
  app/(admin)/layout.tsx           ROOT layout #3: <html lang="ko">, noindex, imports ../styles, Suspense, no site chrome
  app/(admin)/admin/(auth)/        login, setup, forgot-password + actions.ts (the only actions without requireAdmin)
  app/(admin)/admin/(panel)/       everything behind login; layout.tsx = sidebar/topbar shell
    page.tsx                       dashboard         audit/ search/ (built)
    inquiries/ launch/ privacy/ optouts/ blog/ content/ projects/ praise-tool/ faq/ legal/ media/   placeholders (<ComingSoon/>)
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
| `nav.ts` | Sidebar sections. Set `ready: true` when you replace a placeholder |
| `format.ts` | `formatKst(iso)` |
| `throttle.ts`, `insforge.ts`, `env.ts`, `auth-state.ts`, `search.ts` | sign-in plumbing / search page logic |

## Primitives (`src/components/admin`)

`Button`, `LinkButton`, `SubmitButton` (pending state), `ConfirmButton` (two-step), `Field` + `TextInput`/`TextArea`/`SelectInput`
(label, hint, error, aria wiring), `Table`/`THead`/`TBody`/`Tr`/`Th`/`Td`/`EmptyRow`, `Badge`, `Card`/`Stat`, `PageHeader`, `Alert`,
`Toast` + `FlashFromUrl`, `CopyButton`, `ComingSoon`, `AdminShell`. Style: site tokens from `globals.css`, plain and readable,
44px touch targets, Korean "해요체" copy. Add new generic pieces here; feature-specific components go in a feature subfolder
(`components/admin/<feature>/`).

## Database (one migration, applied)

`admins`, `audit_log`, `login_attempts`, `site_settings`, `content_entries` (+`content_versions`), `posts` (+`post_versions`),
`media` (+ public storage bucket `media`), `inquiry_replies`, `mail_campaigns`; `inquiries` gained `admin_note`, `replied_at`
(its `status` already allows new|replied|closed|spam). Later stages should add columns/tables only with a new migration.

## Cache & public pages

The public site is static (Cache Components). Anything the admin edits that public pages show must be read through a
`"use cache"` function with `cacheTag(...)` and the admin action must call `updateTag(tag)` (Server Actions only; use
`revalidateTag(tag, "max")` in route handlers). Reference: `lib/site-settings.ts` + `search/actions.ts`. Search-verification meta tags
come from `site_settings` (env `GOOGLE_SITE_VERIFICATION`/`NAVER_SITE_VERIFICATION` only as fallback).
Never use `Date.now()`/`new Date()` in code that prerenders; admin pages and actions are fine.

## File ownership

| Area | Owner | Notes |
| --- | --- | --- |
| `proxy.ts`, `lib/admin/{auth,action,audit,throttle,insforge,env}.ts`, `(admin)/layout.tsx`, `(auth)/**`, `(panel)/layout.tsx`, migration `…_admin-foundation.sql`, `components/admin/*` primitives | Stage 1 | Change only to fix bugs or add a primitive; do not weaken `requireAdmin` |
| `lib/admin/nav.ts` | shared | each stage flips its own entries to `ready: true` (and may add sub-links) |
| `(panel)/inquiries`, `launch`, `privacy`, `optouts` + `components/admin/requests/*` | Stage 2 | |
| `(panel)/blog` + `components/admin/blog/*` (block editor) | Stage 3 | |
| `(panel)/content`, `projects`, `praise-tool`, `faq`, `legal` + `components/admin/content/*` | Stage 4 | public side reads via cached getters |
| `(panel)/media` + `components/admin/media/*` | Stage 4 | storage bucket `media` already exists |
| `(panel)/search`, `(panel)/audit`, dashboard `(panel)/page.tsx`, `lib/site-settings.ts` | Stage 1 | |
| `src/app/(ko)`, `(en)`, `components/pages/*`, `lib/seo.ts` | public site | stages touch these only to read admin-managed data |
