import type { Metadata } from "next";
import { DocList } from "@/components/admin/content/doc-list";
import { requireAdmin } from "@/lib/admin/auth";
import { CONTENT_GROUPS, GROUPS_BY_PAGE } from "@/lib/content-registry";

export const metadata: Metadata = { title: "사이트 문구" };

export default async function Page({ searchParams }: PageProps<"/admin/content">) {
  await requireAdmin();
  const sp = await searchParams;
  const g = CONTENT_GROUPS.find((x) => x === sp.group);
  return (
    <DocList
      title={g ? `${g} 문구` : "사이트·홈·서비스·소개 문구"}
      description="공통 문구와 홈, 서비스, 소개 페이지 글을 고쳐요. 고친 문구는 ‘공개하기’를 눌러야 사이트에 나와요."
      groups={g ? [g] : GROUPS_BY_PAGE["/admin/content"]}
    />
  );
}
