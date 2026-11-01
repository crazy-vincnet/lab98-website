import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkButton } from "@/components/admin/button";
import { Badge } from "@/components/admin/badge";
import { InsightArticle } from "@/components/pages/insight-detail";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { getPostRecord, isLiveNow, toInsightItem } from "@/lib/admin/posts";

export const metadata: Metadata = { title: "미리보기" };

/** Renders the saved post with the very same <InsightArticle> the public page uses. Never cached, never indexed. */
export default async function PreviewPage({ params }: PageProps<"/admin/blog/[id]/preview">) {
  await requireAdmin();
  const { id } = await params;
  const post = await getPostRecord(id);
  if (!post) notFound();
  const item = await toInsightItem(post);
  const live = isLiveNow(post);
  return (
    <div lang={post.locale}>
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b-2 border-ink bg-[#fdf1cf] px-4 py-3 text-[15px]" lang="ko">
        <Badge tone={live ? "ok" : "warn"}>{live ? "공개 중" : post.status === "scheduled" ? `예약됨 · ${formatKst(post.published_at)}` : "초안"}</Badge>
        <p className="min-w-0 flex-1">저장된 내용으로 보여주는 미리보기예요. 공개 페이지와 같은 화면이지만 머리글·바닥글은 빠져 있어요.</p>
        <LinkButton href={`/admin/blog/${post.id}`}>편집으로 돌아가기</LinkButton>
      </div>
      <InsightArticle note={item} locale={post.locale} />
    </div>
  );
}
