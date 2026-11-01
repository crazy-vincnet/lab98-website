import "server-only";
import { getContent } from "@/lib/get-content";
import { insightHref } from "@/components/experiments/paths";
import type { Note } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { PostDoc } from "@/lib/post-doc";
import { getLivePost, getLivePosts, type LivePost, type LivePostSummary, type PostImage } from "@/lib/posts";
import { localizedUrl, locales } from "@/lib/seo";

/**
 * Insights = the static notes in content.ts / content.en.ts MERGED with the published posts from the DB.
 * Same slug in the same language -> the DB post wins (the static `starting-lab98` stays as the fallback).
 * Everything returned is a plain `Note` plus a few optional fields, so the existing list/card components keep working.
 */
export type InsightItem = Note & {
  source: "static" | "db";
  translationKey?: string | null;
  /** ISO timestamp; DB posts only. */
  published?: string;
  updated?: string;
  cover?: PostImage | null;
  /** Rich body (DB posts). When absent, `body` holds the static blocks. */
  doc?: PostDoc;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: PostImage | null;
};

/** KST calendar day of an instant ("2026-11-01"). Pure arithmetic: no clock, safe while prerendering. */
export const kstDate = (iso: string) => new Date(Date.parse(iso) + 9 * 3600_000).toISOString().slice(0, 10);

const AUTHOR: Record<Locale, string> = { ko: "전영재(Vincent Jeon)", en: "Vincent Jeon" };

function fromPost(p: LivePostSummary | LivePost): InsightItem {
  const full = "doc" in p ? p : null;
  return {
    source: "db",
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: kstDate(p.publishedAt),
    division: p.division,
    readingMinutes: p.readingMinutes,
    author: p.author?.trim() || AUTHOR[p.locale],
    body: [],
    translationKey: p.translationKey,
    published: p.publishedAt,
    updated: p.updatedAt,
    cover: p.cover,
    ...(full ? { doc: full.doc, metaTitle: full.metaTitle, metaDescription: full.metaDescription, ogImage: full.ogImage } : {}),
  };
}

const newestFirst = (a: InsightItem, b: InsightItem) => (b.published ?? `${b.date}T00:00:00+09:00`).localeCompare(a.published ?? `${a.date}T00:00:00+09:00`);

/** All public insights of a language, newest first. */
export async function getInsights(locale: Locale): Promise<InsightItem[]> {
  const live = await getLivePosts(locale);
  const dbSlugs = new Set(live.map((p) => p.slug));
  const statics: InsightItem[] = getContent(locale).notes.filter((n) => !dbSlugs.has(n.slug)).map((n) => ({ ...n, source: "static" as const }));
  return [...statics, ...live.map(fromPost)].sort((a, b) => b.date.localeCompare(a.date) || newestFirst(a, b));
}

/** One insight with its body, or null (draft, scheduled in the future, unknown). */
export async function getInsight(locale: Locale, slug: string): Promise<InsightItem | null> {
  const live = await getLivePosts(locale);
  if (live.some((p) => p.slug === slug)) {
    const post = await getLivePost(locale, slug);
    if (post) return fromPost(post);
  }
  const note = getContent(locale).getNote(slug);
  return note ? { ...note, source: "static" } : null;
}

/** Slugs for generateStaticParams (static notes + posts live at build time). */
export async function getInsightSlugs(locale: Locale): Promise<{ slug: string }[]> {
  return (await getInsights(locale)).map((n) => ({ slug: n.slug }));
}

/**
 * The same article in the other language, or null. DB posts pair by translation key; posts without a key (and static
 * notes) pair by identical slug, which is how the static ko/en notes already relate.
 */
export function findTranslation(item: InsightItem, others: readonly InsightItem[]): InsightItem | null {
  if (item.translationKey) {
    const byKey = others.find((o) => o.translationKey === item.translationKey);
    if (byKey) return byKey;
    return null;
  }
  return others.find((o) => o.slug === item.slug && !o.translationKey) ?? null;
}

/** hreflang map for a post page, or undefined when there is no translation (then no `en`/`ko` alternate is emitted). */
export async function getInsightLanguages(item: InsightItem, locale: Locale): Promise<Record<string, string> | undefined> {
  const other: Locale = locale === "ko" ? "en" : "ko";
  const twin = findTranslation(item, await getInsights(other));
  if (!twin) return undefined;
  const ko = locale === "ko" ? item : twin;
  const en = locale === "en" ? item : twin;
  const url = (slug: string, l: Locale) => localizedUrl(insightHref(slug), locales.find((x) => x.code === l));
  return { ko: url(ko.slug, "ko"), en: url(en.slug, "en"), "x-default": url(ko.slug, "ko") };
}
