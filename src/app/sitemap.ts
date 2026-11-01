import type { MetadataRoute } from "next";
import { divisions, notes, projects } from "@/lib/content";
import {
  COOKIES_PATH,
  INSIGHTS_PATH,
  PRAISE_TOOL_PATH,
  PRIVACY_PATH,
  PROJECTS_PATH,
  TERMS_PATH,
  divisionHref,
  insightHref,
  projectHref,
} from "@/components/experiments/paths";
import { absoluteUrl, languageAlternates, locales, localizedUrl } from "@/lib/seo";

/**
 * /sitemap.xml — every public, indexable route.
 * Excluded on purpose: /privacy/request, /unsubscribe, /admin, /api (see robots.ts).
 * No `new Date()` here: the file is prerendered (Cache Components), and a build-time "now" would be a false lastmod.
 */
type Entry = MetadataRoute.Sitemap[number];

/** One entry per locale for a locale-less `path`; every entry lists all alternates (hreflang + x-default). */
function entries(path: string, changeFrequency: Entry["changeFrequency"], priority: number, lastModified?: string, images?: string[]): Entry[] {
  const languages = languageAlternates(path);
  return locales.map((l) => ({
    url: localizedUrl(path, l),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
    ...(languages ? { alternates: { languages } } : {}),
    ...(images?.length ? { images } : {}),
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const latestNote = notes.map((n) => n.date).sort().at(-1);

  // Each page yields its Korean URL followed by its English twin.
  return [
    ...entries("/", "weekly", 1.0, latestNote),
    ...entries("/about", "monthly", 0.8),
    ...divisions.flatMap((d) => entries(divisionHref(d.slug), "monthly", 0.9)),
    ...entries(PRAISE_TOOL_PATH, "weekly", 0.9),
    ...entries(PROJECTS_PATH, "monthly", 0.8),
    ...projects.flatMap((p) => entries(projectHref(p.slug), "monthly", 0.8, undefined, [absoluteUrl(p.images.desktop), absoluteUrl(p.images.mobile)])),
    ...entries(INSIGHTS_PATH, "weekly", 0.7, latestNote),
    ...notes.flatMap((n) => entries(insightHref(n.slug), "yearly", 0.7, n.date)),
    ...entries(PRIVACY_PATH, "yearly", 0.3),
    ...entries(TERMS_PATH, "yearly", 0.3),
    ...entries(COOKIES_PATH, "yearly", 0.3),
  ];
}
