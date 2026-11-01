import type { MetadataRoute } from "next";
import { divisions, projects } from "@/lib/content";
import { findTranslation, getInsights } from "@/lib/insights";
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [koNotes, enNotes] = await Promise.all([getInsights("ko"), getInsights("en")]);
  const latestNote = koNotes.map((n) => n.date).sort().at(-1);
  // Posts: one URL per language that has the post; hreflang alternates only when the other language has a translation.
  const noteEntries = (list: typeof koNotes, others: typeof koNotes, l: (typeof locales)[number]): Entry[] =>
    list.map((n) => {
      const twin = findTranslation(n, others);
      const other = locales.find((x) => x.code !== l.code)!;
      const url = localizedUrl(insightHref(n.slug), l);
      const twinUrl = twin && localizedUrl(insightHref(twin.slug), other);
      const ko = l.code === "ko" ? url : twinUrl;
      const en = l.code === "en" ? url : twinUrl;
      return {
        url,
        lastModified: n.updated ?? n.date,
        changeFrequency: "yearly",
        priority: 0.7,
        ...(twinUrl && ko && en ? { alternates: { languages: { ko, en, "x-default": ko } } } : {}),
        ...(n.cover?.url ? { images: [absoluteUrl(n.cover.url)] } : {}),
      };
    });

  // Each page yields its Korean URL followed by its English twin.
  return [
    ...entries("/", "weekly", 1.0, latestNote),
    ...entries("/about", "monthly", 0.8),
    ...divisions.flatMap((d) => entries(divisionHref(d.slug), "monthly", 0.9)),
    ...entries(PRAISE_TOOL_PATH, "weekly", 0.9),
    ...entries(PROJECTS_PATH, "monthly", 0.8),
    ...projects.flatMap((p) => entries(projectHref(p.slug), "monthly", 0.8, undefined, [absoluteUrl(p.images.desktop), absoluteUrl(p.images.mobile)])),
    ...entries(INSIGHTS_PATH, "weekly", 0.7, latestNote),
    ...noteEntries(koNotes, enNotes, locales[0]),
    ...noteEntries(enNotes, koNotes, locales[1]),
    ...entries(PRIVACY_PATH, "yearly", 0.3),
    ...entries(TERMS_PATH, "yearly", 0.3),
    ...entries(COOKIES_PATH, "yearly", 0.3),
  ];
}
