import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/admin/badge";
import { Button, LinkButton } from "@/components/admin/button";
import { Field, SelectInput, TextInput } from "@/components/admin/field";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/admin/table";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { INQUIRY_STATUS_LABEL, INQUIRY_STATUS_TONE, INQUIRY_STATUSES, INTEREST_LABEL, type InquiryStatus } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

export const metadata: Metadata = { title: "문의" };

const PAGE_SIZE = 30;
type Row = { id: string; created_at: string; interest: string; name: string | null; email: string; message: string; status: InquiryStatus };
type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Keep PostgREST `or()` syntax intact: drop separators/quotes, escape LIKE wildcards. */
const likeTerm = (q: string) => q.replace(/[,()"\\*]/g, " ").trim().replace(/[%_]/g, (c) => `\\${c}`);

export default async function InquiriesPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = one(sp.status);
  const interest = one(sp.interest);
  const q = one(sp.q).trim().slice(0, 100);
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(sp.page), 10) || 1));

  let query = getInsforgeAdmin()
    .database.from("inquiries")
    .select("id,created_at,interest,name,email,message,status", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if ((INQUIRY_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  if (interest in INTEREST_LABEL) query = query.eq("interest", interest);
  const term = likeTerm(q);
  if (term) query = query.or(`email.ilike.*${term}*,name.ilike.*${term}*`);
  const { data, count, error } = await query;
  const rows = (data ?? []) as Row[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (status) u.set("status", status);
    if (interest) u.set("interest", interest);
    if (q) u.set("q", q);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return `/admin/inquiries${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="문의" description="홈페이지 문의 양식으로 들어온 문의예요. 눌러서 읽고 답장하거나 상태를 바꿔요." />
      <form method="get" className="mb-4 grid gap-3 border border-line p-4 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
        <Field id="status" label="상태">
          {(p) => (
            <SelectInput {...p} name="status" defaultValue={status}>
              <option value="">전체</option>
              {INQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {INQUIRY_STATUS_LABEL[s]}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>
        <Field id="interest" label="분야">
          {(p) => (
            <SelectInput {...p} name="interest" defaultValue={interest}>
              <option value="">전체</option>
              {Object.entries(INTEREST_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>
        <Field id="q" label="이메일·이름 검색">
          {(p) => <TextInput {...p} name="q" defaultValue={q} maxLength={100} placeholder="예: hong@example.com" />}
        </Field>
        <div className="flex gap-2">
          <Button type="submit">찾기</Button>
          {(status || interest || q) && <LinkButton href="/admin/inquiries">초기화</LinkButton>}
        </div>
      </form>

      {error && <p className="mb-3 font-bold text-[#b42318]" role="alert">목록을 불러오지 못했어요. 잠시 뒤에 다시 해 주세요.</p>}
      <p className="mb-2 text-[14px] text-gray">모두 {total.toLocaleString("ko-KR")}건</p>
      <Table caption="문의 목록">
        <THead>
          <Tr>
            <Th>받은 때</Th>
            <Th>상태</Th>
            <Th>분야</Th>
            <Th>보낸 사람</Th>
            <Th>내용</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyRow cols={5}>조건에 맞는 문의가 없어요.</EmptyRow>
          ) : (
            rows.map((r) => (
              <Tr key={r.id}>
                <Td className="whitespace-nowrap">
                  <Link href={`/admin/inquiries/${r.id}`} className="underline underline-offset-4">
                    {formatKst(r.created_at)}
                  </Link>
                </Td>
                <Td>
                  <Badge tone={INQUIRY_STATUS_TONE[r.status] ?? "neutral"}>{INQUIRY_STATUS_LABEL[r.status] ?? r.status}</Badge>
                </Td>
                <Td className="whitespace-nowrap">{INTEREST_LABEL[r.interest] ?? r.interest}</Td>
                <Td className="break-all">
                  {r.name && <span className="font-bold">{r.name} </span>}
                  <span className="text-gray">{r.email}</span>
                </Td>
                <Td className="max-w-[360px] truncate">{r.message.slice(0, 80)}</Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>
      {pages > 1 && (
        <nav className="mt-4 flex items-center gap-3" aria-label="쪽 이동">
          {page > 1 && <LinkButton href={href(page - 1)}>이전</LinkButton>}
          <span className="text-[15px]">
            {page} / {pages}
          </span>
          {page < pages && <LinkButton href={href(page + 1)}>다음</LinkButton>}
        </nav>
      )}
    </>
  );
}
