# Content override engine (admin stage 4a)

Lets the owner edit nearly all site copy (ko + en) from `/admin/content` without a deploy. **Defaults stay in code**
(`content.ts`, `components/*/copy*.ts`, `praise-tool*.ts` …). The database stores only a sparse override on top.

```
code defaults (tree of strings/objects/arrays)  +  content_entries.data (flat { "path": "text" })  =  what the site renders
```

## Files

| File | Role |
| --- | --- |
| `src/lib/copy-merge.ts` | PURE helpers (client-safe): `flattenStrings`, `mergeOverrides`, `pruneOverrides`, `validateOverrides`, `tokensOf`, `isEditableLeaf` |
| `src/lib/copy-store.ts` | `server-only`. **`getCopy`**, `getCopyPreview`, `enableCopyPreview`, `CONTENT_TAG`, `contentTag(key)` |
| `src/lib/content-registry.ts` | `CONTENT_DOCS` (the registry: `home.hero`, `chrome.footer` + the four files below), groups, `getDoc` |
| `src/lib/content-registry-{site,pages,chrome,legal}.ts` | the rest of the registry, split by area so edits never collide (see "Registered documents") |
| `src/lib/site-content.ts` | `getSiteContent(locale)` / `getPraiseToolCopy(locale)`: `content.ts` data + published overrides, plus the `*Defaults` projections the registry uses |
| `src/components/<area>/load.ts` | per-area loaders that call `getCopy` for the page sections (home, about, divisions, experiments, notes, privacy-request, unsubscribe) |
| `src/lib/admin/content.ts` | DB layer: `getRow/listRows/saveDraft/publish/discardDraft/listVersions/getVersion` |
| `src/lib/admin/content-tree.ts` | defaults tree -> serializable form model (labels, grouping) |
| `src/app/(admin)/admin/(panel)/content/` | list page, `[key]` editor page, `actions.ts` (save draft / publish / discard / restore) |
| `src/app/(admin)/admin/(preview)/content/[key]/preview/` | iframe / new-tab preview (no sidebar) |
| `src/components/admin/content/` | `ContentEditor` (client), `DocList`, `VersionHistory` |
| `migrations/20261101150000_content-engine-stage4a.sql` | adds `draft`, `draft_updated_at/by`, `published_at`, key format check, unique `(key,locale,version)` on versions |

The sidebar pages `/admin/content`, `/admin/projects`, `/admin/praise-tool`, `/admin/faq`, `/admin/legal` all render `DocList` for their groups
(`GROUPS_BY_PAGE` in the registry). `/admin/content?group=SEO·메타` shows any single group. Editing always happens at `/admin/content/<key>?locale=ko|en`.

## Data model

`content_entries (key, locale, status, data, draft, version, updated_at, updated_by, draft_updated_at, draft_updated_by, published_at)`, unique `(key, locale)`.

* `data` = PUBLISHED override map. The public site reads only this, whatever `status` says.
* `draft` = pending working copy of the same shape (`NULL` = none). The editor loads `draft ?? data`.
* `status` = `'draft'` while a draft is pending or nothing was ever published, else `'published'`.
* `version` = last published version number (0 = never published). `content_versions (key, locale, version, data, created_by, note)` gets a snapshot of
  `data` on every publish and restore (last 50 kept). **Restore publishes the old text as a NEW version** and drops the pending draft.
* Concurrency: every mutation carries the `updated_at` the editor loaded; a mismatch is refused with a Korean message (no silent overwrite).
* Audit (`audit_log`): `content.save_draft`, `content.publish`, `content.discard_draft`, `content.restore` (target `content` / `<key>:<locale>`; meta has counts, paths, note; never full texts).

Override paths: object keys joined by `.`, array items by index: `services.0.title`. A `.` inside a key is `~1`, `~` is `~0`.
Values are always strings. Only existing, editable STRING leaves can be overridden.

## API for consumers

```ts
import { getCopy } from "@/lib/copy-store";

// server component / server function:
const C = await getCopy("home.hero", locale, getHomeCopy(locale).heroCopy);   // same shape as the defaults (typed Dict<T>)
```

`getCopy<T>(key, locale, defaults: T): Promise<Dict<T>>`

* Reads the published overrides through a `"use cache"` function tagged `content` and `content:<key>`, `cacheLife("max")`; the page stays static.
  The cache key is only `(key, locale)`: the defaults (which may contain functions) are merged OUTSIDE the cache.
* `mergeOverrides` guarantees: shape never changes (array lengths, object keys, non-strings, functions are untouched, same references); unknown paths ignored;
  override must be a string, <= 20 000 chars, with **exactly the default's `{token}` set**; with no usable override it returns the very same `defaults` object.
* Never throws (DB error -> defaults, cache shortened to ~1 minute).
* `getCopyPreview(key, locale, defaults)`: draft (else published) merged; calls `requireAdmin()` so it works only in dynamic admin scopes, never in `"use cache"`.
* `enableCopyPreview(admin, key, locale, flatOverrides)`: used by the preview page only. It stores the draft in a per-request React `cache()` holder; from then on
  every `getCopy(key, locale, …)` of that request returns the draft. Public prerenders never see it set, so reading it does not make pages dynamic.
  It cannot be turned on from the URL, a cookie or a header.

Publishing: `publishAction` calls `updateTag(contentTag(key))` (Server Action). From a route handler use `revalidateTag(tag, { expire: 0 })` (or `"max"`).

## Registry format (`src/lib/content-registry.ts`)

```ts
{
  key: "home.hero",                 // stable DB id, /^[a-z0-9][a-z0-9._-]{0,79}$/, NEVER rename after it was published
  titleKo: "홈 · 첫 화면(히어로)",
  group: "홈",                       // one of CONTENT_GROUPS
  description: "…",                 // where the text appears
  defaults: { ko: async () => …, en: async () => … },   // MUST be exactly what the consumer passes to getCopy
  render: async (locale) => createElement((await import("@/components/pages/home")).HomePage, { locale }),   // the REAL public component
  publicPath: (l) => (l === "en" ? "/en/" : "/"),
  skip?: (path, value) => boolean,  // extra leaves to hide
  labels?: { "ctaPrimary": "주요 버튼", "items.*.body": "내용" },   // Korean field labels; `*` = one segment
}
```

Every editable copy file is registered and wired end to end (the converter TODO list is finished and removed).

Automatic hiding: strings whose last key is `href|src|url|slug|id|path|icon|image|class|color|theme|lang|locale|tone|variant|anchor|rel|target|htmlFor|…`
or whose value looks like a URL / site path / anchor are never editable (`isEditableLeaf`). Numbers, booleans and functions are never editable either.

## Registered documents

| Group (admin page) | Keys | Registry file |
| --- | --- | --- |
| 사이트 공통 (`/admin/content`) | `site.info` (name, slogans, description, reply time, founder/business labels), `site.nav`, `chrome.header`, `chrome.footer`, `chrome.skip`, `chrome.cookieBanner`, `chrome.legalDoc`, `chrome.notFound` | `content-registry-site.ts`, `-chrome.ts`, `content-registry.ts` |
| 홈 (`/admin/content`) | `home.hero`, `home.trust`, `home.praise`, `home.services`, `home.projects`, `home.process`, `home.founder`, `home.insights`, `home.contact` | `content-registry.ts`, `-pages.ts` |
| 서비스 / 소개 (`/admin/content`) | `divisions.data` (per division: role, headline, summary, description, services, process, facts, status), `divisions.copy`, `about.copy` | `-site.ts`, `-pages.ts` |
| 프로젝트 (`/admin/projects`) | `projects.data` (title, summary, highlights per project), `projects.page` | `-site.ts`, `-pages.ts` |
| Praise Tool (`/admin/praise-tool`) | `praise-tool.page` (whole product page; price and launch strings are hidden because search data depends on them) | `-site.ts` |
| FAQ (`/admin/faq`) | `faq.home`, `faq.dev`, `faq.ai`, `faq.faith`, `faq.praise-tool` | `-site.ts` |
| 인사이트 화면 / 문의·개인정보 화면 (`/admin/content`) | `insights.page`, `privacy-request.form`, `unsubscribe.form` | `-pages.ts`, `-chrome.ts` |
| 법적 문서 (`/admin/legal`) | `legal.privacy`, `legal.terms`, `legal.cookies` (publish needs a change note; the editor shows a legal warning) | `-legal.ts` |
| SEO·메타 (`/admin/content`) | `seo.root`, `seo.home`, `seo.about`, `seo.services`, `seo.projects`, `seo.insights`, `seo.praise-tool`, `seo.og` (preview is a search-result snippet, not the page) | `-chrome.ts` |

Not editable here, by design: blog posts (own editor, `posts` table), emails, admin UI text, URLs, prices, dates, image paths, and anything that is not a string.
Content that is part of the legal package (privacy policy, terms, cookies) is text only; the retention table values are editable text but the real
deletion schedule lives in the database function `purge_expired_personal_data()`.

## Converting a copy file (recipe)

1. **Pick the unit.** One registry doc = one subtree you pass to `getCopy` in one place (e.g. `getHomeCopy(locale).trustCopy`). Keep docs small enough that a page
   needs 1-4 of them. Name: `<area>.<part>` (`home.trust`, `about.copy`).
2. **Find the consumers**: `grep -rn "getXCopy\|xCopy" src`. Server components: go to 4. Client components (`"use client"`): see Pitfalls, they need props.
3. **Defaults accessor**: the existing `getXCopy(locale)` (already `Dict<typeof koCopy>`) or a subtree of it. Do not create a second copy of the text.
4. **Switch the consumer** (make it `async` if needed; a server component can be async, sync callers just need `await`):
   ```tsx
   const C = await getCopy("home.trust", locale, getHomeCopy(locale).trustCopy);
   ```
   Use the same expression in the registry `defaults` (ko and en), so the editor and the site agree on the paths.
5. **Add the registry entry** with `render` = the page component that shows it (so the preview is the real page) and `publicPath`. Add `labels` for non-obvious keys.
6. **Placeholders**: if a default is a function (`(n) => \`${n}개 기관\``) it is NOT editable. If you want it editable, change the default to a template string with a token
   (`"{n}개 기관과 함께했어요"`) and fill it in the component with a tiny `fill(template, { n })` helper. The editor enforces the same `{token}` set.
7. **Verify**: `npx tsc --noEmit`; open `/admin/content/<key>?locale=ko`, edit a field, save draft, open the preview, publish; check the public page; discard/restore.
8. Do NOT change unrelated copy files or the key of an existing doc.

## Pitfalls

* **`getCopy` is server-only.** Client components cannot import it (`server-only` fails the build). The server parent calls `getCopy` and passes the merged object
  (or just the needed strings) as props. Example: `Hero` -> `HeroMotion copy={heroCopy}` -> `MotionToggle` via context; `HeroBlock copy={heroCopy}`.
  Props must be serializable: strip functions before passing to a client component.
* **Do not call `getCopy` inside another `"use cache"` function** (or a component marked `"use cache"`) if you want admin preview to work there: the preview switch is
  per request and is not visible inside a cache scope. Prefer calling it in the uncached component and passing the result down. Published reads work everywhere,
  and the cache entry of the outer function inherits the `content:<key>` tag.
* **`generateMetadata` / static `metadata` / JSON-LD / sitemap / OG images** also render without the preview switch: SEO text edited here shows in the published page only
  after publishing; the preview iframe cannot show `<title>`. When converting SEO copy, call `getCopy` inside the (async) `xMetadata(locale)` function.
* **A copy file that is typed `as const` and used in type positions** (`typeof heroCopy`) keeps working: `getCopy` returns `Dict<T>` (strings widened).
* **Tokens**: `{name}`-style tokens (`/\{[A-Za-z_][\w.]*\}/`) must appear in the override exactly as many times as in the default. The save action returns a Korean error
  naming the token, and `mergeOverrides` silently falls back to the default if a bad value ever reaches the DB.
* Paths are positional: if you reorder an array in code, saved overrides point at other items. Prefer appending; the editor lists overrides whose path no longer exists
  ("지금 기본 문구에 없는 항목") and drops them on the next save.
* Only strings are editable: no HTML (React renders them as text), no new items, no reordering, no changing numbers/prices/links. Those stay in code.
* A build with the DB unreachable shortens the cache life of every `getCopy` read (same behaviour as `site_settings`/`posts`); `next build` can then fail on
  `/_not-found`. Retry when the network/DB is back.
* Never read `cookies()`/`draftMode()` from a public page to decide on preview: it would turn the static page dynamic. Preview only exists under `/admin/**`.

## Editor behaviour (what the owner sees)

Form generated from the defaults tree (objects = sections, arrays = ordered "N번째" groups labelled with the item's title-like field), input vs textarea by length,
character counter and limit (`max(300, 5 x default)`, hard cap 20 000), code default shown under every field, "수정됨" / "공개 중과 다름" badges, per-field
"기본값으로 되돌리기", "전체 기본값으로", search box, "다른 언어 같이 보기", sticky save bar, unsaved-change guard (reload/close and in-app link clicks),
iframe preview (saved draft) or new tab, version history with diff vs the live text and restore, publish note (200 chars), discard draft.
Empty values are refused (use "기본값으로 되돌리기").
