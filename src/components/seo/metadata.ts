import type { Metadata } from "next";
import { site } from "@/lib/content";
import { OG_LOCALE, localePath, type Locale } from "@/lib/i18n";
import { languageAlternates } from "@/lib/seo";

/**
 * Per-page Metadata with canonical, hreflang alternates, Open Graph and Twitter filled in consistently.
 * `path` is always the locale-less (Korean-style) path, e.g. "/about"; `locale` decides the canonical, og:locale and
 * which hreflang alternate is "self". Pass `noindex` for pages that must not be indexed (no alternates are emitted then).
 * A page-level `openGraph` replaces the layout's (shallow merge), so siteName/locale are repeated here.
 * OG/Twitter images default to the opengraph-image / twitter-image routes for the page (see `cardBase` below); pass `images` only as an explicit override.
 */
export function pageMetadata({
  title,
  absoluteTitle = false,
  ogTitle,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  images,
  noindex = false,
  locale = "ko",
}: {
  /** Shown before the "| Lab98" template unless `absoluteTitle`. */
  title: string;
  absoluteTitle?: boolean;
  /** Social title; defaults to `title`. */
  ogTitle?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  noindex?: boolean;
  locale?: Locale;
}): Metadata {
  const localized = localePath(locale, path);
  const languages = noindex ? undefined : languageAlternates(path);
  // Cards live at un-grouped routes (app/<path>/opengraph-image.tsx, app/en/opengraph-image.tsx) so their URLs stay
  // stable: files inside a route group get a hash suffix and are not attached to pages automatically.
  // Korean pages use their own card; English pages use the generic English card until per-page ones exist (TODO(en)).
  const cardBase = locale === "ko" ? (path === "/" ? "" : path) : "/en";
  const defaultImages = noindex ? undefined : [{ url: `${cardBase}/opengraph-image`, width: 1200, height: 630, alt: ogTitle ?? title }];
  const shownImages = images ?? defaultImages;
  const twitterImages = images ? images.map((i) => i.url) : defaultImages && [`${cardBase}/twitter-image`];
  const social = ogTitle ?? title;
  const common = { siteName: site.name, locale: OG_LOCALE[locale], title: social, description, url: localized, ...(shownImages && { images: shownImages }) };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localized,
      ...(languages && { languages }),
    },
    openGraph: type === "article" ? { ...common, type: "article", publishedTime, modifiedTime, authors } : { ...common, type: "website" },
    twitter: { card: "summary_large_image", title: social, description, ...(twitterImages && { images: twitterImages }) },
    // Noindex pages carry personal data or signed links in the URL (e.g. /unsubscribe?email=…&t=…): send no Referer.
    ...(noindex && { robots: { index: false, follow: true }, referrer: "no-referrer" as const }),
  };
}
