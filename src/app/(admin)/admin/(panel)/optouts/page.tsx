import type { Metadata } from "next";
import { Alert } from "@/components/admin/alert";
import { Button, buttonClass, LinkButton } from "@/components/admin/button";
import { Card } from "@/components/admin/card";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Field, TextInput } from "@/components/admin/field";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/admin/submit-button";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/admin/table";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { addOptout, removeOptout } from "./actions";

export const metadata: Metadata = { title: "수신거부" };
const PAGE_SIZE = 50;
type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const likeTerm = (q: string) => q.replace(/[,()"\\*]/g, " ").trim().replace(/[%_]/g, (c) => `\\${c}`);
const SOURCE: Record<string, string> = { web: "웹 양식", admin: "관리자 추가" };

export default async function OptoutsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 100);
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(sp.page), 10) || 1));
  let query = getInsforgeAdmin()
    .database.from("email_optouts")
    .select("email,created_at,source", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const term = likeTerm(q);
  if (term) query = query.ilike("email", `*${term}*`);
  const { data, count, error } = await query;
  const rows = (data ?? []) as Array<{ email: string; created_at: string; source: string }>;
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="수신거부"
        description="이 목록의 주소로는 출시 안내 같은 안내 메일을 보내지 않아요. 문의에 대한 답장은 이 목록과 상관없이 보낼 수 있어요."
        actions={
          <a href="/api/admin/optouts/export" download className={buttonClass("secondary")}>
            CSV 내려받기
          </a>
        }
      />
      <Card title="직접 추가" className="mb-6">
        <form action={addOptout} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" noValidate>
          <Field id="email" label="이메일" hint="전화나 메일로 수신거부를 요청한 분을 넣어요.">
            {(p) => <TextInput {...p} name="email" type="email" maxLength={254} autoComplete="off" required />}
          </Field>
          <SubmitButton pendingLabel="추가 중…">추가</SubmitButton>
          <label className="flex min-h-11 items-center gap-2 text-[15px] sm:col-span-2">
            <input type="checkbox" name="alsoLaunch" className="size-5" /> 출시 알림 신청도 함께 삭제
          </label>
        </form>
      </Card>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <Field id="q" label="이메일 검색" className="min-w-[240px] flex-1">
          {(p) => <TextInput {...p} name="q" defaultValue={q} maxLength={100} />}
        </Field>
        <Button type="submit">찾기</Button>
        {q && <LinkButton href="/admin/optouts">초기화</LinkButton>}
      </form>
      {error && <p className="mb-3 font-bold text-[#b42318]" role="alert">목록을 불러오지 못했어요.</p>}
      <p className="mb-2 text-[14px] text-gray">모두 {(count ?? 0).toLocaleString("ko-KR")}명</p>
      <Table caption="수신거부 목록">
        <THead>
          <Tr>
            <Th>이메일</Th>
            <Th>등록</Th>
            <Th>경로</Th>
            <Th>
              <span className="sr-only">작업</span>
            </Th>
          </Tr>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyRow cols={4}>수신거부한 분이 없어요.</EmptyRow>
          ) : (
            rows.map((r) => (
              <Tr key={r.email}>
                <Td className="break-all">{r.email}</Td>
                <Td className="whitespace-nowrap">{formatKst(r.created_at)}</Td>
                <Td>{SOURCE[r.source] ?? r.source}</Td>
                <Td>
                  <form action={removeOptout}>
                    <input type="hidden" name="email" value={r.email} />
                    <ConfirmButton question="목록에서 빼면 이 주소로 다시 안내 메일이 갈 수 있어요. 본인이 요청한 경우에만 빼세요." confirmLabel="네, 뺄게요">
                      빼기
                    </ConfirmButton>
                  </form>
                </Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>
      {pages > 1 && (
        <nav className="mt-4 flex items-center gap-3" aria-label="쪽 이동">
          {page > 1 && <LinkButton href={`/admin/optouts?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${page - 1}`}>이전</LinkButton>}
          <span>
            {page} / {pages}
          </span>
          {page < pages && <LinkButton href={`/admin/optouts?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${page + 1}`}>다음</LinkButton>}
        </nav>
      )}
      <Alert className="mt-6">수신거부 목록은 &quot;본인이 삭제를 요청할 때까지&quot; 보관해요(개인정보처리방침). 추가·삭제는 모두 감사 로그에 남아요.</Alert>
    </>
  );
}
