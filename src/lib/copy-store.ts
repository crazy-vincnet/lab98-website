import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import type { AdminUser } from "@/lib/admin/auth";
import { requireAdmin } from "@/lib/admin/auth";
import type { Dict, Locale } from "@/lib/i18n";
import { mergeOverrides, toFlatOverrides, type FlatOverrides } from "@/lib/copy-merge";

export { flattenStrings, mergeOverrides, pruneOverrides, type FlatOverrides } from "@/lib/copy-merge";

/**
 * PUBLIC API OF THE CONTENT OVERRIDE ENGINE (docs/admin-content.md).
 *
 *   const C = await getCopy("home.hero", locale, getHomeCopy(locale).heroCopy);
 *
 * Defaults stay in code. The DB (`content_entries.data`) holds a sparse flat map of edited string leaves, published from /admin/content.
 * Server components only (this file is `server-only`): client components must receive the merged object as a prop.
 */

/** Tag shared by every copy document; `content:<key>` is the per-document tag. Admin actions call updateTag() on both. */
export const CONTENT_TAG = "content";
export const contentTag = (key: string) => `content:${key}`;
export const CONTENT_KEY_RE = /^[a-z0-9][a-z0-9._-]{0,79}$/;

/**
 * Published overrides of one document. `"use cache"` + tags `content` / `content:<key>`, lives until the admin publishes.
 * Takes only (key, locale) so the cache key stays tiny and serializable: the (possibly function-bearing) defaults are merged OUTSIDE.
 * Never throws (a throw in a cache function fails the prerender): on a DB error it returns {} and caches for only ~1 minute.
 */
async function readPublished(key: string, locale: Locale): Promise<FlatOverrides> {
  "use cache";
  cacheTag(CONTENT_TAG, contentTag(key));
  cacheLife("max");
  try {
    const { data, error } = await getInsforgeAdmin().database.from("content_entries").select("data").eq("key", key).eq("locale", locale).limit(1);
    if (error) throw new Error(error.message);
    return toFlatOverrides(Array.isArray(data) ? data[0]?.data : null);
  } catch (e) {
    console.error("content_entries read failed:", e instanceof Error ? e.message : e);
    cacheLife({ stale: 0, revalidate: 60, expire: 120 });
    return {};
  }
}

/** Per-request preview switch. React `cache` gives one object per request, so the public prerender never sees it set. */
type PreviewState = { key: string; locale: Locale; overrides: FlatOverrides } | null;
const previewHolder = cache(() => ({ current: null as PreviewState }));

/**
 * Admin preview only: makes every getCopy(key, locale, …) of THIS request return the draft instead of the published text.
 * Call it at the top of the admin preview page, after requireAdmin() (the AdminUser argument is the proof).
 * It can never be switched on by a URL parameter, cookie or header of a public page: nothing public calls this.
 */
export function enableCopyPreview(admin: AdminUser, key: string, locale: Locale, overrides: FlatOverrides) {
  if (!admin?.email) throw new Error("enableCopyPreview needs an admin");
  previewHolder().current = { key, locale, overrides };
}

/**
 * THE accessor. Published overrides merged over `defaults` (same shape back, only existing string leaves change).
 * Static pages stay static: the read is cached and tagged, an admin publish calls updateTag and the next request re-renders.
 * Inside the admin preview (enableCopyPreview) the matching document returns the draft instead.
 */
export async function getCopy<T>(key: string, locale: Locale, defaults: T): Promise<Dict<T>> {
  const p = previewHolder().current;
  if (p && p.key === key && p.locale === locale) return mergeOverrides(defaults, p.overrides) as Dict<T>;
  return mergeOverrides(defaults, await readPublished(key, locale)) as Dict<T>;
}

/** Draft (falls back to published) merged over defaults. Reads cookies via requireAdmin(): dynamic scopes only, never in "use cache". */
export async function getCopyPreview<T>(key: string, locale: Locale, defaults: T): Promise<Dict<T>> {
  await requireAdmin();
  const { data } = await getInsforgeAdmin().database.from("content_entries").select("data, draft").eq("key", key).eq("locale", locale).limit(1);
  const row = Array.isArray(data) ? data[0] : null;
  const flat = toFlatOverrides(row?.draft ?? row?.data);
  return mergeOverrides(defaults, flat) as Dict<T>;
}
