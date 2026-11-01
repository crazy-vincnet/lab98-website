"use server";

import { updateTag } from "next/cache";
import { adminAction } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { redirectWithFlash } from "@/lib/admin/flash";
import { freeSlug, getMediaByIds, getPostRecord, isLiveNow, slugTaken, snapshotVersion, UUID_RE, type Division, type PostRecord, type PostStatus } from "@/lib/admin/posts";
import { kstDate } from "@/lib/insights";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { docHasContent, normalizeDoc, SLUG_MAX, SLUG_RE, suggestSlug } from "@/lib/post-doc";
import { POSTS_TAG } from "@/lib/posts";

const db = () => getInsforgeAdmin().database;
const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string).trim() : "");

/* ------------------------------------------------------------------ create */

export type CreateState = { error?: string; values?: { title: string; locale: string } };

export const createPost = adminAction(async ({ admin }, _prev: CreateState, formData: FormData): Promise<CreateState> => {
  const title = str(formData, "title");
  const locale = str(formData, "locale") === "en" ? "en" : "ko";
  if (!title) return { error: "제목을 적어 주세요.", values: { title, locale } };
  if (title.length > 200) return { error: "제목은 200자 이내로 적어 주세요.", values: { title, locale } };
  const rand = crypto.randomUUID().slice(0, 4);
  const slug = await freeSlug(locale, suggestSlug(title, kstDate(new Date().toISOString()), rand));
  const { data, error } = await db().from("posts").insert([{ slug, locale, title, status: "draft" }]).select("id");
  const id = (Array.isArray(data) ? data[0]?.id : null) as string | null;
  if (error || !id) return { error: "만들지 못했어요. 잠시 뒤에 다시 해 주세요.", values: { title, locale } };
  await audit(admin.email, "post.create", { type: "post", id }, { slug, locale });
  redirectWithFlash(`/admin/blog/${id}`, "ok", "초안을 만들었어요. 이어서 써 보세요.");
});

/* -------------------------------------------------------------------- save */

export type SaveInput = {
  id: string;
  /** `updated_at` the editor loaded (or got from the last save); a mismatch means another tab/session saved in between. */
  expectedUpdatedAt: string;
  mode: "autosave" | "save";
  title: string;
  slug: string;
  excerpt: string;
  coverMediaId: string | null;
  doc: unknown;
  seo: { meta_title: string; meta_description: string; og_media_id: string | null };
  status: PostStatus;
  /** ISO instant (UTC) or "" */
  publishedAt: string;
  division: Division;
  author: string;
};
export type SaveResult =
  | { ok: true; updatedAt: string; status: PostStatus; publishedAt: string | null; slug: string; versioned: boolean; warnings: string[]; savedAt: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<"title" | "slug" | "excerpt" | "content" | "cover" | "meta_title" | "meta_description" | "published_at" | "og", string>>; conflict?: boolean };

const STATUSES: PostStatus[] = ["draft", "scheduled", "published"];
const DIVISIONS: Division[] = ["master", "dev", "ai", "faith"];

export const savePost = adminAction(async ({ admin }, input: SaveInput): Promise<SaveResult> => {
  const current = await getPostRecord(String(input?.id ?? ""));
  if (!current) return { ok: false, error: "글을 찾을 수 없어요. 지워졌을 수 있어요." };
  if (input.expectedUpdatedAt !== current.updated_at) {
    return { ok: false, conflict: true, error: "다른 창이나 기기에서 이 글을 먼저 저장했어요. 새로고침해서 최신 내용을 확인해 주세요." };
  }
  // Autosave only ever touches drafts: it must not change what visitors see.
  if (input.mode === "autosave" && current.status !== "draft") return { ok: false, error: "자동 저장은 초안에서만 해요." };

  const status: PostStatus = STATUSES.includes(input.status) ? input.status : "draft";
  const strict = status !== "draft" && input.mode === "save";
  const fieldErrors: Extract<SaveResult, { ok: false }>["fieldErrors"] = {};
  const warnings: string[] = [];

  const title = String(input.title ?? "").trim();
  const excerpt = String(input.excerpt ?? "").trim();
  const slug = String(input.slug ?? "").trim();
  const doc = normalizeDoc(input.doc);
  const author = String(input.author ?? "").trim().slice(0, 80);
  const division: Division = DIVISIONS.includes(input.division) ? input.division : "master";
  const metaTitle = String(input.seo?.meta_title ?? "").trim();
  const metaDesc = String(input.seo?.meta_description ?? "").trim();

  if (title.length > 200) fieldErrors.title = "제목은 200자 이내로 적어 주세요.";
  if (strict && !title) fieldErrors.title = "공개하려면 제목이 필요해요.";
  if (excerpt.length > 300) fieldErrors.excerpt = "요약은 300자 이내로 적어 주세요.";
  if (strict && !excerpt) fieldErrors.excerpt = "공개하려면 요약이 필요해요. 목록과 검색 결과에 보여요.";
  if (!slug) fieldErrors.slug = "주소(슬러그)를 적어 주세요.";
  else if (slug.length > SLUG_MAX || !SLUG_RE.test(slug)) fieldErrors.slug = "영어 소문자, 숫자, 하이픈(-)만 쓸 수 있어요. 예: my-first-post";
  else if (slug !== current.slug && (await slugTaken(current.locale, slug, current.id))) fieldErrors.slug = "같은 언어에 이미 이 주소를 쓰는 글이 있어요.";
  if (strict && !docHasContent(doc)) fieldErrors.content = "공개하려면 본문이 필요해요.";
  if (metaTitle.length > 70) fieldErrors.meta_title = "검색 제목은 70자 이내로 적어 주세요.";
  if (metaDesc.length > 200) fieldErrors.meta_description = "검색 설명은 200자 이내로 적어 주세요.";

  // Cover + share image must exist in the library (and have alt text, which the library enforces).
  const coverId = input.coverMediaId && UUID_RE.test(input.coverMediaId) ? input.coverMediaId : null;
  const ogId = input.seo?.og_media_id && UUID_RE.test(input.seo.og_media_id) ? input.seo.og_media_id : null;
  const media = await getMediaByIds([coverId, ogId]);
  if (coverId && !media.has(coverId)) fieldErrors.cover = "고른 대표 이미지를 찾을 수 없어요. 다시 골라 주세요.";
  if (ogId && !media.has(ogId)) fieldErrors.og = "고른 공유 이미지를 찾을 수 없어요. 다시 골라 주세요.";
  if (current.locale === "en") {
    const noAlt = [coverId, ogId].filter((x): x is string => !!x && media.has(x) && !media.get(x)!.alt_en);
    if (noAlt.length) warnings.push("영어 글인데 영어 대체 텍스트가 없는 이미지가 있어요. 한국어 설명으로 대신 나가요. 미디어에서 채워 주세요.");
  }

  // Publication time. Server clock decides what "future" means.
  const now = Date.now();
  let publishedAt: string | null = null;
  const given = String(input.publishedAt ?? "").trim();
  if (given) {
    const t = Date.parse(given);
    if (Number.isNaN(t)) fieldErrors.published_at = "날짜와 시간을 확인해 주세요.";
    else publishedAt = new Date(t).toISOString();
  }
  if (status === "scheduled") {
    if (!publishedAt) fieldErrors.published_at = "예약하려면 공개할 날짜와 시간을 정해 주세요.";
    else if (Date.parse(publishedAt) <= now) fieldErrors.published_at = "예약 시각이 이미 지났어요. 미래 시각으로 바꾸거나 '발행'을 골라 주세요.";
  } else if (status === "published") {
    if (!publishedAt) publishedAt = current.status === "published" && current.published_at ? current.published_at : new Date(now).toISOString();
    else if (Date.parse(publishedAt) > now + 60_000) fieldErrors.published_at = "발행 시각이 미래예요. '예약'을 고르거나 시각을 지금 이전으로 바꿔 주세요.";
  }
  if (Object.keys(fieldErrors).length) return { ok: false, error: input.mode === "autosave" ? "자동 저장하지 못했어요. 입력을 확인해 주세요." : "입력을 확인해 주세요.", fieldErrors };

  if (slug !== current.slug && isLiveNow(current, now)) warnings.push("공개된 글의 주소를 바꿨어요. 이전 주소로 들어온 링크는 열리지 않아요.");

  const seo = { meta_title: metaTitle, meta_description: metaDesc, og_media_id: ogId };
  const savedAt = new Date(now).toISOString();
  const { data, error } = await db()
    .from("posts")
    .update({ title, slug, excerpt, cover_media_id: coverId, blocks: doc, seo, status, published_at: publishedAt, division, author: author || null, updated_at: savedAt })
    .eq("id", current.id)
    .eq("updated_at", current.updated_at)
    .select("id,updated_at");
  if (error) {
    const dup = /duplicate|unique|23505/i.test(error.message);
    return { ok: false, error: dup ? "같은 언어에 이미 이 주소를 쓰는 글이 있어요." : "저장하지 못했어요. 잠시 뒤에 다시 해 주세요.", ...(dup ? { fieldErrors: { slug: "이미 쓰고 있는 주소예요." } } : {}) };
  }
  const row = (Array.isArray(data) ? data[0] : null) as { id: string; updated_at: string } | null;
  if (!row) return { ok: false, conflict: true, error: "다른 창이나 기기에서 이 글을 먼저 저장했어요. 새로고침해서 최신 내용을 확인해 주세요." };

  let versioned = false;
  if (input.mode === "save") {
    const label = status === "published" ? (current.status === "published" ? "수정 발행" : "발행") : status === "scheduled" ? "예약" : "저장";
    versioned = (await snapshotVersion({ id: current.id, title, excerpt, blocks: doc, seo, cover_media_id: coverId }, admin.email, label)) != null;
    await audit(admin.email, `post.${status === "draft" ? "save" : status === "scheduled" ? "schedule" : "publish"}`, { type: "post", id: current.id }, { slug, locale: current.locale, from: current.status, to: status });
  }
  // A draft autosave changes nothing public. Every other save may (publish, unpublish, edit of a live post).
  if (!(input.mode === "autosave" && current.status === "draft" && status === "draft")) updateTag(POSTS_TAG);

  return { ok: true, updatedAt: row.updated_at, status, publishedAt, slug, versioned, warnings, savedAt };
});

/* ------------------------------------------------------------------ delete */

export const deletePost = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  const post = await getPostRecord(id);
  if (!post) redirectWithFlash("/admin/blog", "error", "이미 지워진 글이에요.");
  const { error } = await db().from("posts").delete().eq("id", post.id);
  if (error) redirectWithFlash(`/admin/blog/${post.id}`, "error", "지우지 못했어요. 잠시 뒤에 다시 해 주세요.");
  await audit(admin.email, "post.delete", { type: "post", id: post.id }, { slug: post.slug, locale: post.locale, status: post.status });
  updateTag(POSTS_TAG);
  redirectWithFlash("/admin/blog", "ok", "글을 지웠어요.");
});

/* ------------------------------------------------------------- translation */

export const createTranslation = adminAction(async ({ admin }, formData: FormData) => {
  const src = await getPostRecord(str(formData, "id"));
  if (!src) redirectWithFlash("/admin/blog", "error", "글을 찾을 수 없어요.");
  const target = src.locale === "ko" ? "en" : "ko";
  const label = target === "en" ? "영어" : "한국어";

  let key = src.translation_key;
  if (key) {
    const { data } = await db().from("posts").select("id").eq("translation_key", key).eq("locale", target).limit(1);
    const existing = (data as { id: string }[] | null)?.[0];
    if (existing) redirectWithFlash(`/admin/blog/${existing.id}`, "ok", `이미 ${label} 버전이 있어서 그 글을 열었어요.`);
  } else {
    key = crypto.randomUUID();
    const { error } = await db().from("posts").update({ translation_key: key }).eq("id", src.id).is("translation_key", null);
    if (error) redirectWithFlash(`/admin/blog/${src.id}`, "error", "번역 글을 만들지 못했어요. 다시 시도해 주세요.");
  }

  // Same slug in the other language when free (so the language switcher lands on the twin), otherwise "-en"/"-ko".
  const slug = (await slugTaken(target, src.slug)) ? await freeSlug(target, `${src.slug.slice(0, 74)}-${target}`) : src.slug;
  const { data, error } = await db()
    .from("posts")
    .insert([{ slug, locale: target, status: "draft", title: src.title, excerpt: src.excerpt, blocks: src.blocks, seo: { ...(src.seo ?? {}), meta_title: "", meta_description: "" }, cover_media_id: src.cover_media_id, translation_key: key, division: src.division, author: null }])
    .select("id");
  const id = (Array.isArray(data) ? data[0]?.id : null) as string | null;
  if (error || !id) redirectWithFlash(`/admin/blog/${src.id}`, "error", "번역 글을 만들지 못했어요. 다시 시도해 주세요.");
  await audit(admin.email, "post.translate", { type: "post", id }, { from: src.id, locale: target });
  redirectWithFlash(`/admin/blog/${id}`, "ok", `${label} 초안을 만들었어요. 제목과 본문을 번역해 주세요.`);
});

/* ---------------------------------------------------------------- versions */

export const restoreVersion = adminAction(async ({ admin }, formData: FormData) => {
  const postId = str(formData, "postId");
  const versionId = Number(str(formData, "versionId"));
  const post = await getPostRecord(postId);
  if (!post || !Number.isInteger(versionId)) redirectWithFlash("/admin/blog", "error", "잘못된 요청이에요.");
  const { data } = await db().from("post_versions").select("*").eq("id", versionId).eq("post_id", post.id).limit(1);
  const v = (Array.isArray(data) ? data[0] : null) as { version: number; title: string; excerpt: string; blocks: unknown; seo: PostRecord["seo"]; cover_media_id: string | null } | null;
  if (!v) redirectWithFlash(`/admin/blog/${post.id}`, "error", "그 버전을 찾을 수 없어요.");

  await snapshotVersion(post, admin.email, `v${v.version} 복원 전`);
  const coverOk = v.cover_media_id ? (await getMediaByIds([v.cover_media_id])).has(v.cover_media_id) : false;
  const { error } = await db()
    .from("posts")
    .update({ title: v.title, excerpt: v.excerpt, blocks: normalizeDoc(v.blocks), seo: v.seo ?? {}, cover_media_id: coverOk ? v.cover_media_id : null, updated_at: new Date().toISOString() })
    .eq("id", post.id);
  if (error) redirectWithFlash(`/admin/blog/${post.id}`, "error", "복원하지 못했어요. 다시 시도해 주세요.");
  await audit(admin.email, "post.restore", { type: "post", id: post.id }, { version: v.version });
  updateTag(POSTS_TAG);
  redirectWithFlash(`/admin/blog/${post.id}?r=${Date.now()}`, "ok", `v${v.version}으로 되돌렸어요.`);
});

