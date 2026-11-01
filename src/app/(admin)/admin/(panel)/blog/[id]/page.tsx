import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor, PostSidePanels, type EditorPost } from "@/components/admin/blog/post-editor";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/admin/button";
import { requireAdmin } from "@/lib/admin/auth";
import { getMediaByIds, getPostRecord, getSibling, listVersions } from "@/lib/admin/posts";
import { normalizeDoc } from "@/lib/post-doc";

export const metadata: Metadata = { title: "글 쓰기" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { r } = await searchParams; // set by restore/translate redirects so the editor remounts with the new content
  const post = await getPostRecord(id);
  if (!post) notFound();
  const [media, sibling, versions] = await Promise.all([getMediaByIds([post.cover_media_id, post.seo?.og_media_id]), getSibling(post), listVersions(post.id)]);
  const pick = (mid?: string | null) => {
    const m = mid ? media.get(mid) : undefined;
    return m ? { id: m.id, url: m.url, alt_ko: m.alt_ko, alt_en: m.alt_en, width: m.width, height: m.height } : null;
  };
  const editorPost: EditorPost = {
    id: post.id,
    locale: post.locale,
    slug: post.slug,
    status: post.status,
    title: post.title,
    excerpt: post.excerpt,
    doc: normalizeDoc(post.blocks),
    cover: pick(post.cover_media_id),
    seo: { meta_title: post.seo?.meta_title ?? "", meta_description: post.seo?.meta_description ?? "" },
    og: pick(post.seo?.og_media_id),
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    division: post.division,
    author: post.author ?? "",
  };

  return (
    <>
      <PageHeader
        title={post.title || "제목 없는 글"}
        description={post.locale === "en" ? "영어 글" : "한국어 글"}
        actions={<LinkButton href="/admin/blog">← 글 목록</LinkButton>}
      />
      <div className="grid gap-6">
        {/* Not keyed on updated_at: saving re-renders this page and must not remount (and reset) the editor. */}
        <PostEditor key={`${post.id}-${typeof r === "string" ? r : ""}`} post={editorPost} />
        <PostSidePanels postId={post.id} locale={post.locale} sibling={sibling} versions={versions} status={post.status} />
      </div>
    </>
  );
}
