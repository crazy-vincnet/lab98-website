import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/admin/badge";
import { Button, LinkButton } from "@/components/admin/button";
import { Field, SelectInput } from "@/components/admin/field";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/admin/table";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { currentMs, dueInfo, PRIVACY_STATUS_LABEL, PRIVACY_STATUS_TONE, PRIVACY_STATUSES, type PrivacyStatus } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { REQUEST_TYPE_LABELS, type RequestType } from "@/lib/privacy-request";

export const metadata: Metadata = { title: "개인정보 요청" };
const PAGE_SIZE = 30;
type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
type Row = { id: string; created_at: string; email: string; request_type: RequestType; status: PrivacyStatus; resolved_at: string | null };

export default async function PrivacyPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = one(sp.status) || "open";
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(sp.page), 10) || 1));
  const nowMs = currentMs(); // admin page (dynamic, after requireAdmin): never prerendered

  let q = getInsforgeAdmin()
    .database.from("privacy_requests")
    .select("id,created_at,email,request_type,status,resolved_at", { count: "exact" })
    .order("created_at", { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (filter === "open") q = q.in("status", ["new", "verifying"]);
  else if ((PRIVACY_STATUSES as readonly string[]).includes(filter)) q = q.eq("status", filter);
  const { data, count, error } = await q;
  const rows = (data ?? []) as Row[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const overdueN = rows.filter((r) => dueInfo(r.created_at, r.status, nowMs).overdue).length;

  return (
    <>
      <PageHeader
        title="개인정보 요청"
        description="열람·정정·삭제·처리정지·동의 철회 요청이에요. 요청자가 본인 확인 메일에 답장한 뒤에 처리하고, 접수일로부터 10일 안에 결과를 알려야 해요."
        actions={<LinkButton href="/admin/privacy/erase">이메일 데이터 삭제 도구</LinkButton>}
      />
      <form method="get" className="mb-4 flex flex-wrap items-end gap-3 border border-line p-4">
        <Field id="status" label="상태" className="min-w-[200px]">
          {(p) => (
            <SelectInput {...p} name="status" defaultValue={filter}>
              <option value="open">처리 전 (접수 + 본인 확인 중)</option>
              <option value="all">전체</option>
              {PRIVACY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PRIVACY_STATUS_LABEL[s]}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>
        <Button type="submit">보기</Button>
      </form>
      {error && <p className="mb-3 font-bold text-[#b42318]" role="alert">목록을 불러오지 못했어요.</p>}
      {overdueN > 0 && (
        <p className="mb-3 border-l-4 border-[#b42318] bg-[#fff1ef] px-4 py-3 font-bold text-[#8f1c13]" role="alert">
          기한(10일)이 지난 요청이 {overdueN}건 있어요. 서둘러 처리해 주세요.
        </p>
      )}
      <Table caption="개인정보 요청 목록">
        <THead>
          <Tr>
            <Th>접수</Th>
            <Th>종류</Th>
            <Th>이메일</Th>
            <Th>상태</Th>
            <Th>처리 기한</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyRow cols={5}>요청이 없어요.</EmptyRow>
          ) : (
            rows.map((r) => {
              const d = dueInfo(r.created_at, r.status, nowMs);
              return (
                <Tr key={r.id} className={d.overdue ? "bg-[#fff6f5]" : undefined}>
                  <Td className="whitespace-nowrap">
                    <Link className="underline underline-offset-4" href={`/admin/privacy/${r.id}`}>
                      {formatKst(r.created_at)}
                    </Link>
                  </Td>
                  <Td>{REQUEST_TYPE_LABELS[r.request_type] ?? r.request_type}</Td>
                  <Td className="break-all">{r.email}</Td>
                  <Td>
                    <Badge tone={PRIVACY_STATUS_TONE[r.status] ?? "neutral"}>{PRIVACY_STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {formatKst(d.dueIso)}{" "}
                    {d.open && (d.overdue ? <Badge tone="danger">{-d.daysLeft}일 지남</Badge> : <Badge tone={d.daysLeft <= 3 ? "warn" : "neutral"}>{d.daysLeft}일 남음</Badge>)}
                  </Td>
                </Tr>
              );
            })
          )}
        </TBody>
      </Table>
      {pages > 1 && (
        <nav className="mt-4 flex items-center gap-3" aria-label="쪽 이동">
          {page > 1 && <LinkButton href={`/admin/privacy?status=${filter}&page=${page - 1}`}>이전</LinkButton>}
          <span>
            {page} / {pages}
          </span>
          {page < pages && <LinkButton href={`/admin/privacy?status=${filter}&page=${page + 1}`}>다음</LinkButton>}
        </nav>
      )}
    </>
  );
}
