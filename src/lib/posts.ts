import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { normalizeDoc, readingMinutes, type PostDoc } from "@/lib/post-doc";
import type { Locale } from "@/lib/i18n";

/**
 * Public-side reads of blog posts (DB). Everything here is `"use cache"` under the `posts` tag; every admin save,
 * publish and delete calls `updateTag(POSTS_TAG)`, so changes show up without a deploy.
 *
 * "Live" = status 'published', or status 'scheduled' whose published_at has passed. That is decided inside the cached
 * function from the clock at fill time (never in a prerendered component). `cacheLife("minutes")` (revalidate 60s)
 * makes a scheduled post appear within about a minute or two after its time, with no cron.
 */
export const POSTS_TAG = "posts";

export type PostSeo = { meta_title?: string; meta_description?: string; og_media_id?: string | null };
export type PostImage = { url: string; alt: string; width: number | null; height: number | null };

export type LivePostSummary = {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  /** ISO timestamp the post went/goes live. */
  publishedAt: string;
  updatedAt: string;
  translationKey: string | null;
  division: "master" | "dev" | "ai" | "faith";
  author: string | null;
  readingMinutes: number;
  cover: PostImage | null;
};

export type LivePost = LivePostSummary & {
  doc: PostDoc;
  metaTitle: string;
  metaDescription: string;
  ogImage: PostImage | null;
};

type PostRow = {
  id: string;
  slug: string;
  locale: Locale;
  status: string;
  title: string;
  excerpt: string;
  cover_media_id: string | null;
  blocks: unknown;
  seo: PostSeo | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  translation_key: string | null;
  division: LivePostSummary["division"];
  author: string | null;
};
type MediaRow = { id: string; url: string; alt_ko: string; alt_en: string; width: number | null; height: number | null };

const DIVISIONS = ["master", "dev", "ai", "faith"] as const;

/** Whether a row is visible to the public at `now` (ms). */
export const isLive = (r: { status: string; published_at: string | null }, now: number) =>
  r.status === "published" || (r.status === "scheduled" && !!r.published_at && Date.parse(r.published_at) <= now);

async function mediaById(ids: string[]): Promise<Map<string, MediaRow>> {
  const map = new Map<string, MediaRow>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return map;
  const { data, error } = await getInsforgeAdmin().database.from("media").select("id,url,alt_ko,alt_en,width,height").in("id", unique);
  if (error) throw new Error(error.message);
  for (const m of (data ?? []) as MediaRow[]) map.set(m.id, m);
  return map;
}

const toImage = (m: MediaRow | undefined, locale: Locale): PostImage | null =>
  m ? { url: m.url, alt: (locale === "en" ? m.alt_en || m.alt_ko : m.alt_ko) || "", width: m.width, height: m.height } : null;

function summarize(r: PostRow, media: Map<string, MediaRow>): LivePostSummary {
  const doc = normalizeDoc(r.blocks);
  return {
    id: r.id,
    slug: r.slug,
    locale: r.locale,
    title: r.title,
    excerpt: r.excerpt,
    publishedAt: r.published_at ?? r.created_at,
    updatedAt: r.updated_at,
    translationKey: r.translation_key,
    division: (DIVISIONS as readonly string[]).includes(r.division) ? r.division : "master",
    author: r.author,
    readingMinutes: readingMinutes(doc, r.locale),
    cover: toImage(r.cover_media_id ? media.get(r.cover_media_id) : undefined, r.locale),
  };
}

/** Live posts of one language, newest first (no bodies). Never throws: on a DB error it returns [] and retries in ~1 minute. */
export async function getLivePosts(locale: Locale): Promise<LivePostSummary[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("minutes");
  try {
    const { data, error } = await getInsforgeAdmin()
      .database.from("posts")
      .select("*")
      .eq("locale", locale)
      .in("status", ["published", "scheduled"])
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    const now = Date.now();
    const rows = ((data ?? []) as PostRow[]).filter((r) => isLive(r, now));
    const media = await mediaById(rows.map((r) => r.cover_media_id ?? ""));
    return rows.map((r) => summarize(r, media));
  } catch (e) {
    console.error("posts read failed:", e instanceof Error ? e.message : e);
    cacheLife({ stale: 30, revalidate: 60, expire: 600 });
    return [];
  }
}

/**
 * One live post with its body. Only call it for a slug that `getLivePosts(locale)` listed
 * (keeps the number of cache entries bounded by the number of posts, not by whatever URLs bots try).
 */
export async function getLivePost(locale: Locale, slug: string): Promise<LivePost | null> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("minutes");
  try {
    const { data, error } = await getInsforgeAdmin().database.from("posts").select("*").eq("locale", locale).eq("slug", slug).limit(1);
    if (error) throw new Error(error.message);
    const r = ((data ?? []) as PostRow[])[0];
    if (!r || !isLive(r, Date.now())) return null;
    const seo = r.seo ?? {};
    const media = await mediaById([r.cover_media_id ?? "", seo.og_media_id ?? ""]);
    const doc = normalizeDoc(r.blocks);
    return {
      ...summarize(r, media),
      doc,
      metaTitle: (seo.meta_title ?? "").trim(),
      metaDescription: (seo.meta_description ?? "").trim(),
      ogImage: toImage(seo.og_media_id ? media.get(seo.og_media_id) : undefined, locale),
    };
  } catch (e) {
    console.error("post read failed:", e instanceof Error ? e.message : e);
    cacheLife({ stale: 30, revalidate: 60, expire: 600 });
    return null;
  }
}
