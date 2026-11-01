import type { Metadata } from "next";
import { LinkButton } from "@/components/admin/button";
import { Card } from "@/components/admin/card";
import { PageHeader } from "@/components/admin/page-header";
import { EraseTool } from "@/components/admin/requests/erase-tool";
import { requireAdmin } from "@/lib/admin/auth";
import { UUID_RE } from "@/lib/admin/requests/mail";

export const metadata: Metadata = { title: "이메일 데이터 삭제" };
type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ErasePage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const request = UUID_RE.test(one(sp.request)) ? one(sp.request) : undefined;
  return (
    <>
      <PageHeader
        title="이 이메일의 모든 데이터 삭제"
        description="삭제 요청을 처리할 때 써요. 먼저 무엇이 있는지 보고, 확인한 뒤에 지워요. 모든 단계는 감사 로그에 남아요."
        actions={<LinkButton href="/admin/privacy">목록으로</LinkButton>}
      />
      <Card>
        <EraseTool initialEmail={one(sp.email).slice(0, 254)} requestId={request} />
      </Card>
    </>
  );
}
