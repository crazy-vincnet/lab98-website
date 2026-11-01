/**
 * Shared SEO helpers: absolute URLs, locales, crawler policy, search-engine verification.
 * Used by app/layout.tsx (root metadata), app/sitemap.ts, app/robots.ts and the insights RSS feed.
 */
import type { Metadata } from "next";
import { site } from "@/lib/content";
import { INSIGHTS_PATH } from "@/components/experiments/paths";

/** Absolute URL on the canonical host (https://lab98.io). `absoluteUrl("/")` → "https://lab98.io/". */
export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

/**
 * Locales the site is published in. Korean is the default and lives at the root (no prefix).
 * TODO(i18n /en): add `{ code: "en", hreflang: "en", prefix: "/en", ogLocale: "en_US" }` once English
 * pages ship — sitemap.ts emits `alternates.languages` automatically when this has more than one entry.
 */
export const locales = [{ code: "ko", hreflang: "ko", prefix: "", ogLocale: "ko_KR" }] as const satisfies readonly {
  code: string;
  hreflang: string;
  prefix: string;
  ogLocale: string;
}[];
export const defaultLocale = locales[0];

/** Absolute URL of `path` in a given locale. */
export function localizedUrl(path: string, locale: (typeof locales)[number] = defaultLocale): string {
  return absoluteUrl(`${locale.prefix}${path === "/" && locale.prefix ? "" : path}`);
}

/** `alternates.languages` map for a path (hreflang → absolute URL), or undefined while only one locale exists. */
export function languageAlternates(path: string): Record<string, string> | undefined {
  if (locales.length < 2) return undefined;
  const map: Record<string, string> = {};
  for (const l of locales) map[l.hreflang] = localizedUrl(path, l);
  map["x-default"] = localizedUrl(path, defaultLocale);
  return map;
}

/** Insights RSS feed. */
export const RSS_PATH = `${INSIGHTS_PATH}/rss.xml`;
export const RSS_TITLE = `${site.name} 인사이트`;

/** Never indexed: forms with personal data, one-click unsubscribe, admin, API. */
export const NOINDEX_PATHS = ["/admin", "/api", "/privacy/request", "/unsubscribe"] as const;

/**
 * Search and AI crawlers we explicitly welcome (GEO: we want AI answer engines to read and cite Lab98).
 * Yeti = Naver, Daum = Kakao/Daum search.
 */
export const WELCOMED_CRAWLERS = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Yeti",
  "Daum",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Applebot-Extended",
] as const;

/**
 * Search-console verification from server env (optional; set in Vercel/InsForge env, then redeploy —
 * the root layout's metadata is prerendered, so values are read at build time).
 */
export function siteVerification(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const naver = process.env.NAVER_SITE_VERIFICATION?.trim();
  if (!google && !naver) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(naver ? { other: { "naver-site-verification": naver } } : {}),
  };
}
