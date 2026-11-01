import "server-only";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

/** Cache tag invalidated by /admin/search on save (updateTag). */
export const SITE_SETTINGS_TAG = "site-settings";

/** Row key in `site_settings` holding the search-console verification codes. */
export const SEARCH_SETTINGS_KEY = "search";

export type SearchSettings = { google: string; naver: string };

/** Codes only: letters, digits, `_` and `-`. */
export const VERIFICATION_RE = /^[A-Za-z0-9_-]+$/;

/**
 * Site settings from the DB, cached under the `site-settings` tag until /admin/search saves.
 * Never throws (a throw inside a cache function fails the prerender). On a DB error it returns `null`
 * and shortens its own cache life to ~1 minute, so a hiccup is not remembered; callers then use the env fallback.
 */
export async function getSiteSettings(): Promise<SearchSettings | null> {
  "use cache";
  cacheTag(SITE_SETTINGS_TAG);
  cacheLife("max");
  try {
    const { data, error } = await getInsforgeAdmin().database.from("site_settings").select("value").eq("key", SEARCH_SETTINGS_KEY).limit(1);
    if (error) throw new Error(error.message);
    const v = (Array.isArray(data) ? data[0]?.value : null) as Partial<SearchSettings> | null | undefined;
    return {
      google: typeof v?.google === "string" ? v.google : "",
      naver: typeof v?.naver === "string" ? v.naver : "",
    };
  } catch (e) {
    console.error("site_settings read failed:", e instanceof Error ? e.message : e);
    cacheLife({ stale: 0, revalidate: 60, expire: 120 });
    return null;
  }
}

/** DB value wins; the env var is the fallback (also used if the DB is unreachable). */
export async function getSearchVerification(): Promise<SearchSettings> {
  const db = (await getSiteSettings()) ?? { google: "", naver: "" };
  return {
    google: db.google || process.env.GOOGLE_SITE_VERIFICATION?.trim() || "",
    naver: db.naver || process.env.NAVER_SITE_VERIFICATION?.trim() || "",
  };
}

/** `metadata.verification` for the root layouts (<meta name="google-site-verification"> / "naver-site-verification"). */
export async function siteVerificationMetadata(): Promise<Metadata["verification"]> {
  const { google, naver } = await getSearchVerification();
  if (!google && !naver) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(naver ? { other: { "naver-site-verification": naver } } : {}),
  };
}
