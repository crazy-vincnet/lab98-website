import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/admin/alert";
import { Badge, type BadgeTone } from "@/components/admin/badge";
import { Button, buttonClass } from "@/components/admin/button";
import { Card, Stat } from "@/components/admin/card";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader } from "@/components/admin/page-header";
import { LaunchCompose } from "@/components/admin/requests/launch-compose";
import { LaunchRunner } from "@/components/admin/requests/launch-runner";
import { MailPreview } from "@/components/admin/requests/mail-preview";
import { SelectAll } from "@/components/admin/requests/select-all";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/admin/table";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { getRecipients, type Failure } from "@/lib/admin/requests/launch";
import { UUID_RE } from "@/lib/admin/requests/mail";
import { LAUNCH_DEFAULT } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { LAUNCH_PRODUCT } from "@/lib/launch-signup";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import { deleteSignups, discardCampaign, resendCampaignTest, retryCampaignFailures } from "./actions";

export const metadata: Metadata = { title: "Praise Tool 알림" };

const PAGE_SIZE = 100;
type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
type Signup = { id: string; email: string; org: string | null; created_at: string; consent_at: string; notified_at: string | null };
type Campaign = {
  id: string;
  subject: string;
  body: string;
  status: string;
  test_sent_at: string | null;
  recipients_count: number;
  skipped_optout: number;
  sent_count: number;
  failures: Failure[] | null;
  last_error: string | null;
  created_at: string;
  sent_at: string | null;
  sent_by: string | null;
};
const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "초안(미발송)", tone: "neutral" },
  sending: { label: "발송 중·멈춤", tone: "warn" },
  sent: { label: "발송 완료", tone: "ok" },
  failed: { label: "실패", tone: "danger" },
};

export default async function LaunchPage({ searchParams }: { searchParams: SP }) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(sp.page), 10) || 1));
  const campaignId = UUID_RE.test(one(sp.campaign)) ? one(sp.campaign) : "";
  const db = getInsforgeAdmin().database;

  const [list, total, notified, campaigns, selected] = await Promise.all([
    db
      .from("launch_signups")
      .select("id,email,org,created_at,consent_at,notified_at")
      .eq("product", LAUNCH_PRODUCT)
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
    db.from("launch_signups").select("id", { count: "exact", head: true }).eq("product", LAUNCH_PRODUCT),
    db.from("launch_signups").select("id", { count: "exact", head: true }).eq("product", LAUNCH_PRODUCT).not("notified_at", "is", null),
    db
      .from("mail_campaigns")
      .select("id,subject,status,recipients_count,sent_count,skipped_optout,created_at")
      .eq("kind", "launch-praise-tool")
      .order("created_at", { ascending: false })
      .limit(8),
    campaignId
      ? db
          .from("mail_campaigns")
          .select("id,subject,body,status,test_sent_at,recipients_count,skipped_optout,sent_count,failures,last_error,created_at,sent_at,sent_by")
          .eq("id", campaignId)
          .eq("kind", "launch-praise-tool")
          .limit(1)
      : Promise.resolve({ data: [] as unknown[] }),
  ]);
  const signups = (list.data ?? []) as Signup[];
  const totalN = total.count ?? 0;
  const notifiedN = notified.count ?? 0;
  const pages = Math.max(1, Math.ceil(totalN / PAGE_SIZE));
  const camp = (selected.data?.[0] ?? null) as Campaign | null;
  const failures = Array.isArray(camp?.failures) ? (camp?.failures as Failure[]) : [];

  let recipients: Awaited<ReturnType<typeof getRecipients>> | null = null;
  let recipientsError = false;
  try {
    recipients = await getRecipients(failures.map((f) => f.email));
  } catch {
    recipientsError = true;
  }
  const sampleUnsub = unsubscribeUrl(admin.email);
  const campList = (campaigns.data ?? []) as Array<{ id: string; subject: string; status: string; recipients_count: number; sent_count: number; skipped_optout: number; created_at: string }>;
  const inProgress = campList.find((c) => c.status === "sending");

  return (
    <>
      <PageHeader
        title="Praise Tool 출시 알림"
        description="출시 알림을 신청한 분들이에요. 출시일에 안내 메일을 보내고, 보낸 뒤에는 개인정보 처리방침대로 지워요."
        actions={
          <a href="/api/admin/launch/export" className={buttonClass("secondary")} download>
            CSV 내려받기
          </a>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="전체 신청자" value={totalN.toLocaleString("ko-KR")} />
        <Stat label="발송 완료" value={notifiedN.toLocaleString("ko-KR")} note="notified_at이 찍힌 분" />
        <Stat
          label="발송 대상"
          value={recipients ? recipients.eligible.length.toLocaleString("ko-KR") : "-"}
          note={recipients ? `수신거부로 제외 ${recipients.skippedOptout}명` : "계산하지 못했어요"}
        />
      </div>

      <Alert kind="info" className="mt-4">
        <strong>자동 삭제 안내:</strong> 발송 완료(notified_at)로 표시된 신청은 1일 뒤에 자동으로 지워져요. 출시일(2026-11-11)로부터 30일이 지나면 남은 신청도 모두 지워져요. CSV가 필요하면 발송 전에 내려받으세요.
      </Alert>

      {inProgress && camp?.id !== inProgress.id && (
        <Alert kind="info" className="mt-4">
          멈춘 발송이 있어요: {inProgress.subject} ·{" "}
          <Link className="font-bold underline underline-offset-4" href={`/admin/launch?campaign=${inProgress.id}`}>
            이어서 보내러 가기
          </Link>
        </Alert>
      )}

      <Card title={camp ? "발송" : "출시 메일 쓰기"} className="mt-6" actions={camp ? <Link className="text-[15px] underline underline-offset-4" href="/admin/launch">새 메일 쓰기</Link> : undefined}>
        {recipientsError && <Alert kind="error" className="mb-4">받는 사람 목록을 확인하지 못했어요(수신거부 목록 포함). 잠시 뒤에 새로고침해 주세요. 확인되기 전에는 보낼 수 없어요.</Alert>}
        {!camp ? (
          <LaunchCompose defaults={LAUNCH_DEFAULT} sampleUnsubscribeUrl={sampleUnsub} adminEmail={admin.email} />
        ) : (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STATUS[camp.status]?.tone ?? "neutral"}>{STATUS[camp.status]?.label ?? camp.status}</Badge>
              <span className="font-bold">{camp.subject}</span>
              <span className="text-[14px] text-gray">만든 때 {formatKst(camp.created_at)}</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="whitespace-pre-wrap break-words border border-line p-3 text-[15px]">{camp.body}</div>
              <MailPreview body={camp.body} sampleUnsubscribeUrl={sampleUnsub} />
            </div>
            <ul className="grid gap-1 text-[15px]">
              <li>테스트 메일: {camp.test_sent_at ? `${formatKst(camp.test_sent_at)}에 ${admin.email} 로 보냈어요` : "아직 안 보냈어요 (보내야 발송할 수 있어요)"}</li>
              <li>
                보냄 {camp.sent_count}명 · 실패 {failures.length}명 · 수신거부로 제외 {camp.status === "draft" ? (recipients?.skippedOptout ?? "-") : camp.skipped_optout}명
                {camp.status !== "draft" && ` · 시작 때 대상 ${camp.recipients_count}명`}
              </li>
              {camp.last_error && <li className="font-bold text-[#7a5500]">멈춘 이유: {camp.last_error}</li>}
            </ul>

            {camp.status === "draft" && (
              <div className="flex flex-wrap items-center gap-3">
                <form action={resendCampaignTest}>
                  <input type="hidden" name="id" value={camp.id} />
                  <Button type="submit" variant="secondary">테스트 메일 다시 보내기</Button>
                </form>
                <form action={discardCampaign}>
                  <input type="hidden" name="id" value={camp.id} />
                  <ConfirmButton question="이 초안을 지울까요?" confirmLabel="네, 지워요">초안 지우기</ConfirmButton>
                </form>
              </div>
            )}

            {camp.test_sent_at && recipients && (camp.status === "draft" || camp.status === "sending") && (
              <LaunchRunner
                campaignId={camp.id}
                status={camp.status}
                eligible={recipients.eligible.length}
                skippedOptout={recipients.skippedOptout}
                sentCount={camp.sent_count}
                failedCount={failures.length}
              />
            )}
            <p className="text-[14px] text-gray">
              InsForge는 한 시간에 보낼 수 있는 메일 수가 정해져 있어요(요금제에 따라 10~50통). 한도에 걸리면 자동으로 멈추고, 보낸 분은 기록돼서 나중에 &apos;이어서 보내기&apos;로 남은 분께만 보내요. 메일 하단에는 InsForge가 붙이는 수신거부 안내와 우리 수신거부 링크가 함께 들어가요.
            </p>

            {failures.length > 0 && (
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[16px] font-bold">실패 목록 ({failures.length})</h3>
                  <form action={retryCampaignFailures}>
                    <input type="hidden" name="id" value={camp.id} />
                    <Button type="submit" variant="secondary">실패한 분께 다시 보내기 준비</Button>
                  </form>
                </div>
                <Table caption="발송 실패 목록">
                  <THead>
                    <Tr>
                      <Th>이메일</Th>
                      <Th>오류</Th>
                      <Th>때</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {failures.map((f) => (
                      <Tr key={f.email}>
                        <Td className="break-all">{f.email}</Td>
                        <Td className="break-all">{f.error}</Td>
                        <Td className="whitespace-nowrap">{formatKst(f.at)}</Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </Card>

      {campList.length > 0 && (
        <Card title="최근 발송 기록" className="mt-6">
          <Table caption="발송 기록">
            <THead>
              <Tr>
                <Th>만든 때</Th>
                <Th>제목</Th>
                <Th>상태</Th>
                <Th>보냄 / 대상</Th>
              </Tr>
            </THead>
            <TBody>
              {campList.map((c) => (
                <Tr key={c.id}>
                  <Td className="whitespace-nowrap">
                    <Link className="underline underline-offset-4" href={`/admin/launch?campaign=${c.id}`}>
                      {formatKst(c.created_at)}
                    </Link>
                  </Td>
                  <Td>{c.subject}</Td>
                  <Td>
                    <Badge tone={STATUS[c.status]?.tone ?? "neutral"}>{STATUS[c.status]?.label ?? c.status}</Badge>
                  </Td>
                  <Td>
                    {c.sent_count} / {c.recipients_count} {c.skipped_optout > 0 && <span className="text-gray">(제외 {c.skipped_optout})</span>}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      <Card title="신청자 목록" className="mt-6">
        <form action={deleteSignups} className="grid gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <SelectAll name="ids" label="이 쪽 전체 선택" />
            <ConfirmButton question="선택한 신청자를 삭제할까요? 되돌릴 수 없어요." confirmLabel="네, 삭제해요">
              선택 삭제
            </ConfirmButton>
          </div>
          <Table caption="출시 알림 신청자">
            <THead>
              <Tr>
                <Th>
                  <span className="sr-only">선택</span>
                </Th>
                <Th>이메일</Th>
                <Th>단체</Th>
                <Th>신청</Th>
                <Th>동의</Th>
                <Th>발송</Th>
              </Tr>
            </THead>
            <TBody>
              {signups.length === 0 ? (
                <EmptyRow cols={6}>신청자가 없어요.</EmptyRow>
              ) : (
                signups.map((s) => (
                  <Tr key={s.id}>
                    <Td>
                      <input type="checkbox" name="ids" value={s.id} className="size-5" aria-label={`${s.email} 선택`} />
                    </Td>
                    <Td className="break-all">{s.email}</Td>
                    <Td>{s.org ?? "-"}</Td>
                    <Td className="whitespace-nowrap">{formatKst(s.created_at)}</Td>
                    <Td className="whitespace-nowrap">{formatKst(s.consent_at)}</Td>
                    <Td className="whitespace-nowrap">{s.notified_at ? <Badge tone="ok">{formatKst(s.notified_at)}</Badge> : <Badge>전</Badge>}</Td>
                  </Tr>
                ))
              )}
            </TBody>
          </Table>
        </form>
        {pages > 1 && (
          <nav className="mt-4 flex items-center gap-3" aria-label="쪽 이동">
            {page > 1 && <Link className={buttonClass("secondary")} href={`/admin/launch?page=${page - 1}`}>이전</Link>}
            <span>
              {page} / {pages}
            </span>
            {page < pages && <Link className={buttonClass("secondary")} href={`/admin/launch?page=${page + 1}`}>다음</Link>}
          </nav>
        )}
      </Card>
    </>
  );
}
