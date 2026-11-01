import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/admin/badge";
import { Card, Stat } from "@/components/admin/card";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/admin/table";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

export const metadata: Metadata = { title: "대시보드" };

async function count(table: string, filter?: [string, string | string[]], column = "id") {
  let q = getInsforgeAdmin().database.from(table).select(column, { count: "exact", head: true });
  if (filter) q = Array.isArray(filter[1]) ? q.in(filter[0], filter[1]) : q.eq(filter[0], filter[1]);
  const { count: n, error } = await q;
  return error ? null : (n ?? 0);
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const db = getInsforgeAdmin().database;
  const [inquiries, signups, privacy, optouts, recent] = await Promise.all([
    count("inquiries", ["status", "new"]),
    count("launch_signups"),
    count("privacy_requests", ["status", ["new", "verifying"]]),
    count("email_optouts", undefined, "email"),
    db.from("audit_log").select("id,actor_email,action,target_type,target_id,created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  const rows = (recent.data ?? []) as Array<{ id: number; actor_email: string; action: string; target_type: string | null; target_id: string | null; created_at: string }>;
  const show = (n: number | null) => (n === null ? "-" : n.toLocaleString("ko-KR"));

  return (
    <>
      <PageHeader title="대시보드" description={`${admin.email} 님, 안녕하세요.`} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/inquiries" className="block">
          <Stat label="새 문의" value={show(inquiries)} note="아직 답하지 않은 문의" />
        </Link>
        <Link href="/admin/launch" className="block">
          <Stat label="Praise Tool 알림 신청" value={show(signups)} note="전체 신청자 수" />
        </Link>
        <Link href="/admin/privacy" className="block">
          <Stat label="처리 전 개인정보 요청" value={show(privacy)} note="접수·본인 확인 중인 요청" />
        </Link>
        <Link href="/admin/optouts" className="block">
          <Stat label="수신거부" value={show(optouts)} note="안내 메일을 보내지 않는 주소" />
        </Link>
      </div>

      <Card
        className="mt-6"
        title="최근 활동"
        actions={
          <Link href="/admin/audit" className="text-[15px] underline underline-offset-4">
            전체 보기
          </Link>
        }
      >
        <Table caption="최근 감사 로그">
          <THead>
            <Tr>
              <Th>시각</Th>
              <Th>누가</Th>
              <Th>무엇을</Th>
            </Tr>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyRow cols={3}>아직 기록이 없어요.</EmptyRow>
            ) : (
              rows.map((r) => (
                <Tr key={r.id}>
                  <Td className="whitespace-nowrap">{formatKst(r.created_at)}</Td>
                  <Td>{r.actor_email}</Td>
                  <Td>
                    <Badge>{r.action}</Badge> {r.target_id && <span className="text-gray">{r.target_type ? `${r.target_type}:` : ""}{r.target_id}</span>}
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
