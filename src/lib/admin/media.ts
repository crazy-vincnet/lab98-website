import "server-only";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { docImages, normalizeDoc } from "@/lib/post-doc";

export const MEDIA_BUCKET = "media";

export type MediaItem = {
  id: string;
  key: string;
  url: string;
  alt_ko: string;
  alt_en: string;
  width: number | null;
  height: number | null;
  mime: string | null;
  size: number | null;
  created_at: string;
};
export type MediaUse = { postId: string; title: string; locale: string; as: "cover" | "body" | "seo" };

export const MEDIA_COLUMNS = "id,key,url,alt_ko,alt_en,width,height,mime,size,created_at";

export async function listMedia(limit = 500): Promise<MediaItem[]> {
  const { data, error } = await getInsforgeAdmin().database.from("media").select(MEDIA_COLUMNS).order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as MediaItem[];
}

/** Where each media item is used: post covers, images inside post bodies, SEO share images. Keyed by media id. */
export async function getMediaUsage(media: Pick<MediaItem, "id" | "url">[]): Promise<Map<string, MediaUse[]>> {
  const { data, error } = await getInsforgeAdmin().database.from("posts").select("id,title,locale,cover_media_id,seo,blocks");
  if (error) throw new Error(error.message);
  const byUrl = new Map(media.map((m) => [m.url, m.id]));
  const uses = new Map<string, MediaUse[]>();
  const add = (mediaId: string | null | undefined, u: MediaUse) => {
    if (!mediaId) return;
    const list = uses.get(mediaId) ?? [];
    if (!list.some((x) => x.postId === u.postId && x.as === u.as)) list.push(u);
    uses.set(mediaId, list);
  };
  for (const p of (data ?? []) as { id: string; title: string; locale: string; cover_media_id: string | null; seo: { og_media_id?: string | null } | null; blocks: unknown }[]) {
    const base = { postId: p.id, title: p.title || "(제목 없음)", locale: p.locale };
    add(p.cover_media_id, { ...base, as: "cover" });
    add(p.seo?.og_media_id, { ...base, as: "seo" });
    for (const img of docImages(normalizeDoc(p.blocks))) add(img.mediaId ?? byUrl.get(img.src), { ...base, as: "body" });
  }
  return uses;
}

export const USE_LABEL: Record<MediaUse["as"], string> = { cover: "대표 이미지", body: "본문", seo: "공유 이미지(SEO)" };
