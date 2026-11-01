import type { Metadata } from "next";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/admin/table";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

export const metadata: Metadata = { title: "감사 로그" };

type Row = { id: number; actor_email: string; action: string; target_type: string | null; target_id: string | null; meta: Record<string, unknown>; created_at: string };

export default async function AuditPage() {
  await requireAdmin();
  const { data } = await getInsforgeAdmin().database.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as Row[];
  return (
    <>
      <PageHeader title="감사 로그" description="관리자가 한 일의 기록이에요. 최근 200건만 보여요." />
      <Table caption="감사 로그">
        <THead>
          <Tr>
            <Th>시각</Th>
            <Th>누가</Th>
            <Th>무엇을</Th>
            <Th>대상</Th>
            <Th>내용</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyRow cols={5}>아직 기록이 없어요.</EmptyRow>
          ) : (
            rows.map((r) => (
              <Tr key={r.id}>
                <Td className="whitespace-nowrap">{formatKst(r.created_at)}</Td>
                <Td>{r.actor_email}</Td>
                <Td>
                  <Badge>{r.action}</Badge>
                </Td>
                <Td className="break-all">{r.target_id ? `${r.target_type ? `${r.target_type}:` : ""}${r.target_id}` : "-"}</Td>
                <Td className="break-all font-mono text-[13px] text-gray">{Object.keys(r.meta ?? {}).length ? JSON.stringify(r.meta) : ""}</Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>
    </>
  );
}
