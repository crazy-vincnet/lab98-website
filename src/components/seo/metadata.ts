import type { Metadata } from "next";
import { site } from "@/lib/content";

/**
 * Per-page Metadata with canonical, Open Graph and Twitter filled in consistently.
 * A page-level `openGraph` replaces the layout's (shallow merge), so siteName/locale are repeated here.
 * OG images come from the file-based opengraph-image routes; pass `images` only as an explicit override.
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
}): Metadata {
  const social = ogTitle ?? title;
  const common = { siteName: site.name, locale: "ko_KR", title: social, description, url: path, ...(images && { images }) };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
      // languages: { "ko-KR": path, en: `/en${path}` } — add when the English site ships.
    },
    openGraph: type === "article" ? { ...common, type: "article", publishedTime, modifiedTime, authors } : { ...common, type: "website" },
    twitter: { card: "summary_large_image", title: social, description, ...(images && { images: images.map((i) => i.url) }) },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}
