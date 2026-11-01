import "server-only";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { MEDIA_COLUMNS, type MediaItem } from "@/lib/admin/media";
import { kstDate, type InsightItem } from "@/lib/insights";
import { normalizeDoc, readingMinutes, type PostDoc } from "@/lib/post-doc";
import type { PostSeo } from "@/lib/posts";
import type { Locale } from "@/lib/i18n";

export type PostStatus = "draft" | "scheduled" | "published";
export type Division = "master" | "dev" | "ai" | "faith";

export type PostRecord = {
  id: string;
  slug: string;
  locale: Locale;
  status: PostStatus;
  title: string;
  excerpt: string;
  cover_media_id: string | null;
  blocks: unknown;
  seo: PostSeo | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  translation_key: string | null;
  division: Division;
  author: string | null;
};

export const POST_COLUMNS = "id,slug,locale,status,title,excerpt,cover_media_id,blocks,seo,published_at,created_at,updated_at,translation_key,division,author";
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const db = () => getInsforgeAdmin().database;

export async function getPostRecord(id: string): Promise<PostRecord | null> {
  if (!UUID_RE.test(id)) return null;
  const { data, error } = await db().from("posts").select(POST_COLUMNS).eq("id", id).limit(1);
  if (error) throw new Error(error.message);
  return ((data ?? [])[0] as PostRecord | undefined) ?? null;
}

export async function getMediaByIds(ids: (string | null | undefined)[]): Promise<Map<string, MediaItem>> {
  const unique = [...new Set(ids.filter((x): x is string => !!x && UUID_RE.test(x)))];
  const map = new Map<string, MediaItem>();
  if (!unique.length) return map;
  const { data, error } = await db().from("media").select(MEDIA_COLUMNS).in("id", unique);
  if (error) throw new Error(error.message);
  for (const m of (data ?? []) as MediaItem[]) map.set(m.id, m);
  return map;
}

/** The other-language post sharing the translation key, if any. */
export async function getSibling(post: Pick<PostRecord, "id" | "translation_key" | "locale">): Promise<Pick<PostRecord, "id" | "title" | "locale" | "status" | "slug"> | null> {
  if (!post.translation_key) return null;
  const { data } = await db().from("posts").select("id,title,locale,status,slug").eq("translation_key", post.translation_key).neq("id", post.id).limit(1);
  return ((data ?? [])[0] as Pick<PostRecord, "id" | "title" | "locale" | "status" | "slug"> | undefined) ?? null;
}

export async function slugTaken(locale: Locale, slug: string, exceptId?: string): Promise<boolean> {
  const { data } = await db().from("posts").select("id").eq("locale", locale).eq("slug", slug).limit(2);
  return ((data ?? []) as { id: string }[]).some((r) => r.id !== exceptId);
}

/** First free slug starting from `base` ("x", "x-2", "x-3" …) in that language. */
export async function freeSlug(locale: Locale, base: string, exceptId?: string): Promise<string> {
  let candidate = base;
  for (let i = 2; i < 50 && (await slugTaken(locale, candidate, exceptId)); i++) candidate = `${base.slice(0, 74)}-${i}`;
  return candidate;
}

export const isLiveNow = (p: Pick<PostRecord, "status" | "published_at">, now = Date.now()) =>
  p.status === "published" || (p.status === "scheduled" && !!p.published_at && Date.parse(p.published_at) <= now);

/** Build the same shape the public page uses, from a DB row (any status), for /admin/blog/[id]/preview. */
export async function toInsightItem(p: PostRecord): Promise<InsightItem> {
  const media = await getMediaByIds([p.cover_media_id, p.seo?.og_media_id]);
  const img = (m: MediaItem | undefined) => (m ? { url: m.url, alt: (p.locale === "en" ? m.alt_en || m.alt_ko : m.alt_ko) || "", width: m.width, height: m.height } : null);
  const doc: PostDoc = normalizeDoc(p.blocks);
  const when = p.published_at ?? new Date().toISOString();
  return {
    source: "db",
    slug: p.slug,
    title: p.title || "(제목 없음)",
    excerpt: p.excerpt,
    date: kstDate(when),
    division: p.division,
    readingMinutes: readingMinutes(doc, p.locale),
    author: p.author?.trim() || (p.locale === "en" ? "Vincent Jeon" : "전영재(Vincent Jeon)"),
    body: [],
    translationKey: p.translation_key,
    published: when,
    updated: p.updated_at,
    cover: img(p.cover_media_id ? media.get(p.cover_media_id) : undefined),
    doc,
    metaTitle: p.seo?.meta_title ?? "",
    metaDescription: p.seo?.meta_description ?? "",
    ogImage: img(p.seo?.og_media_id ? media.get(p.seo.og_media_id) : undefined),
  };
}

/** Version history helpers ------------------------------------------------ */
export type VersionRow = { id: number; version: number; title: string; created_at: string; created_by: string | null; note: string | null };

export async function listVersions(postId: string): Promise<VersionRow[]> {
  const { data } = await db().from("post_versions").select("id,version,title,created_at,created_by,note").eq("post_id", postId).order("version", { ascending: false }).limit(50);
  return (data ?? []) as VersionRow[];
}

const KEEP_VERSIONS = 50;

/** Snapshot of what the post looks like now. Retries once on a version-number race. */
export async function snapshotVersion(p: Pick<PostRecord, "id" | "title" | "excerpt" | "blocks" | "seo" | "cover_media_id">, actor: string, note: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: last } = await db().from("post_versions").select("version").eq("post_id", p.id).order("version", { ascending: false }).limit(1);
    const next = ((last ?? [])[0] as { version: number } | undefined)?.version ?? 0;
    const { error } = await db()
      .from("post_versions")
      .insert([{ post_id: p.id, version: next + 1, title: p.title, excerpt: p.excerpt, blocks: p.blocks, seo: p.seo ?? {}, cover_media_id: p.cover_media_id, created_by: actor, note }]);
    if (!error) {
      if (next + 1 > KEEP_VERSIONS) await db().from("post_versions").delete().eq("post_id", p.id).lte("version", next + 1 - KEEP_VERSIONS);
      return next + 1;
    }
  }
  return null;
}
