import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/admin/badge";
import { LinkButton } from "@/components/admin/button";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/admin/table";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { isLiveNow, type PostRecord } from "@/lib/admin/posts";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { Alert } from "@/components/admin/alert";

export const metadata: Metadata = { title: "블로그" };

type Row = Pick<PostRecord, "id" | "slug" | "locale" | "status" | "title" | "published_at" | "updated_at" | "translation_key">;
const FILTERS = [
  { key: "all", label: "전체" },
  { key: "draft", label: "초안" },
  { key: "scheduled", label: "예약" },
  { key: "published", label: "발행" },
] as const;

export default async function BlogListPage({ searchParams }: PageProps<"/admin/blog">) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.key === sp.status)?.key ?? "all";
  let q = getInsforgeAdmin().database.from("posts").select("id,slug,locale,status,title,published_at,updated_at,translation_key").order("updated_at", { ascending: false }).limit(300);
  if (filter !== "all") q = q.eq("status", filter);
  const { data, error } = await q;
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PageHeader
        title="블로그"
        description="글을 쓰고, 예약하고, 발행해요. 발행하면 다시 배포하지 않아도 인사이트에 나와요."
        actions={<LinkButton href="/admin/blog/new" variant="primary">새 글 쓰기</LinkButton>}
      />
      {error && <Alert kind="error" className="mb-4">글 목록을 불러오지 못했어요. 새로고침해 주세요.</Alert>}
      <nav aria-label="상태로 거르기" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/blog" : `/admin/blog?status=${f.key}`}
            aria-current={filter === f.key ? "page" : undefined}
            className={`inline-flex min-h-11 items-center border px-4 text-[15px] font-bold ${filter === f.key ? "border-ink bg-ink text-paper" : "border-line hover:bg-concrete"}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      <Table caption="블로그 글 목록">
        <THead>
          <Tr>
            <Th>제목</Th>
            <Th>언어</Th>
            <Th>상태</Th>
            <Th>공개 시각</Th>
            <Th>고친 시각</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.length === 0 && <EmptyRow cols={5}>아직 글이 없어요. &quot;새 글 쓰기&quot;로 시작해 보세요.</EmptyRow>}
          {rows.map((r) => {
            const live = isLiveNow(r);
            return (
              <Tr key={r.id}>
                <Td className="min-w-[220px]">
                  <Link href={`/admin/blog/${r.id}`} className="font-bold underline underline-offset-4">
                    {r.title || "(제목 없음)"}
                  </Link>
                  <p className="font-mono text-[13px] text-gray">/{r.slug}</p>
                </Td>
                <Td className="whitespace-nowrap">
                  {r.locale === "en" ? "English" : "한국어"}
                  {r.translation_key && <span className="block text-[13px] text-gray">번역 연결됨</span>}
                </Td>
                <Td className="whitespace-nowrap">
                  {r.status === "published" && <Badge tone="ok">발행</Badge>}
                  {r.status === "draft" && <Badge>초안</Badge>}
                  {r.status === "scheduled" && <Badge tone={live ? "ok" : "warn"}>{live ? "예약 → 공개 중" : "예약됨"}</Badge>}
                </Td>
                <Td className="whitespace-nowrap">{r.status === "draft" ? "-" : formatKst(r.published_at)}</Td>
                <Td className="whitespace-nowrap">{formatKst(r.updated_at)}</Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
    </>
  );
}
