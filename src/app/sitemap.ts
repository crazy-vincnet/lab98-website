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
import { absoluteUrl, languageAlternates } from "@/lib/seo";

/**
 * /sitemap.xml — every public, indexable route.
 * Excluded on purpose: /privacy/request, /unsubscribe, /admin, /api (see robots.ts).
 * No `new Date()` here: the file is prerendered (Cache Components), and a build-time "now" would be a false lastmod.
 */
type Entry = MetadataRoute.Sitemap[number];

function entry(path: string, changeFrequency: Entry["changeFrequency"], priority: number, lastModified?: string, images?: string[]): Entry {
  const languages = languageAlternates(path); // i18n hook: filled once `locales` in lib/seo.ts has /en
  return {
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
    ...(languages ? { alternates: { languages } } : {}),
    ...(images?.length ? { images } : {}),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const latestNote = notes.map((n) => n.date).sort().at(-1);

  return [
    entry("/", "weekly", 1.0, latestNote),
    entry("/about", "monthly", 0.8),
    ...divisions.map((d) => entry(divisionHref(d.slug), "monthly", 0.9)),
    entry(PRAISE_TOOL_PATH, "weekly", 0.9),
    entry(PROJECTS_PATH, "monthly", 0.8),
    ...projects.map((p) => entry(projectHref(p.slug), "monthly", 0.8, undefined, [absoluteUrl(p.images.desktop), absoluteUrl(p.images.mobile)])),
    entry(INSIGHTS_PATH, "weekly", 0.7, latestNote),
    ...notes.map((n) => entry(insightHref(n.slug), "yearly", 0.7, n.date)),
    entry(PRIVACY_PATH, "yearly", 0.3),
    entry(TERMS_PATH, "yearly", 0.3),
    entry(COOKIES_PATH, "yearly", 0.3),
  ];
}
