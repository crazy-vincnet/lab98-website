import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/admin/badge";
import { LinkButton } from "@/components/admin/button";
import { Card } from "@/components/admin/card";
import { Field, SelectInput, TextArea } from "@/components/admin/field";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { UUID_RE } from "@/lib/admin/requests/mail";
import { currentMs, dueInfo, PRIVACY_STATUS_LABEL, PRIVACY_STATUS_TONE, PRIVACY_STATUSES, type PrivacyStatus } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { REQUEST_TYPE_LABELS, type RequestType } from "@/lib/privacy-request";
import { savePrivacyRequest } from "../actions";

export const metadata: Metadata = { title: "개인정보 요청 상세" };
type Row = { id: string; created_at: string; email: string; request_type: RequestType; details: string | null; status: PrivacyStatus; resolved_at: string | null; admin_note: string | null };

const guide: Record<RequestType, string> = {
  access: "열람: 이 이메일로 보관 중인 정보를 정리해서 알려 주세요. (삭제 도구의 '조회하기'로 목록을 볼 수 있어요.)",
  correct: "정정: 잘못된 정보를 바로잡고 결과를 알려 주세요.",
  delete: "삭제: 본인 확인 후 '이메일 데이터 삭제 도구'로 지우고 결과를 알려 주세요.",
  suspend: "처리정지: 해당 정보의 이용을 멈추고(필요하면 수신거부에 추가) 결과를 알려 주세요.",
  withdraw: "동의 철회: 동의에 기댄 처리를 멈추고(출시 알림 삭제, 수신거부 추가 등) 결과를 알려 주세요.",
};

export default async function PrivacyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { data } = await getInsforgeAdmin().database.from("privacy_requests").select("id,created_at,email,request_type,details,status,resolved_at,admin_note").eq("id", id).limit(1);
  const r = (data?.[0] ?? null) as Row | null;
  if (!r) notFound();
  const nowMs = currentMs(); // dynamic admin page, after requireAdmin
  const d = dueInfo(r.created_at, r.status, nowMs);

  return (
    <>
      <PageHeader
        title={`${REQUEST_TYPE_LABELS[r.request_type] ?? r.request_type} 요청`}
        description={
          <>
            {formatKst(r.created_at)} 접수 · <span className="break-all">{r.email}</span>
          </>
        }
        actions={<LinkButton href="/admin/privacy">목록으로</LinkButton>}
      />
      <div className="grid gap-6">
        <Card title="요청" actions={<Badge tone={PRIVACY_STATUS_TONE[r.status] ?? "neutral"}>{PRIVACY_STATUS_LABEL[r.status] ?? r.status}</Badge>}>
          <dl className="grid gap-2 text-[15px] sm:grid-cols-[120px_1fr]">
            <dt className="text-gray">처리 기한</dt>
            <dd>
              {formatKst(d.dueIso)}{" "}
              {d.open && (d.overdue ? <Badge tone="danger">{-d.daysLeft}일 지남</Badge> : <Badge tone={d.daysLeft <= 3 ? "warn" : "neutral"}>{d.daysLeft}일 남음</Badge>)}
              {r.resolved_at && <span className="text-gray"> · 처리 {formatKst(r.resolved_at)}</span>}
            </dd>
            <dt className="text-gray">안내</dt>
            <dd>{guide[r.request_type]}</dd>
            <dt className="text-gray">요청 내용</dt>
            <dd className="whitespace-pre-wrap break-words">{r.details || "(없음)"}</dd>
          </dl>
          <p className="mt-3 border-l-4 border-[#2f55ff] bg-[#eef1ff] px-4 py-3 text-[15px]">
            웹 양식의 이메일은 본인 확인 전이에요. 요청자가 접수 확인 메일에 답장한 것을 확인한 뒤에 처리하세요.
          </p>
        </Card>

        <Card title="처리 상태">
          <form action={savePrivacyRequest} className="grid gap-4">
            <input type="hidden" name="id" value={r.id} />
            <Field id="status" label="상태" hint="접수 → 본인 확인 중 → 처리 완료 또는 거절. 완료·거절로 바꾸면 처리 시각이 기록돼요.">
              {(p) => (
                <SelectInput {...p} name="status" defaultValue={r.status} className="sm:max-w-[260px]">
                  {PRIVACY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {PRIVACY_STATUS_LABEL[s]}
                    </option>
                  ))}
                </SelectInput>
              )}
            </Field>
            <Field id="admin_note" label="처리 메모" hint="무엇을 했는지, 거절이라면 이유를 적어 두세요. 2,000자까지.">
              {(p) => <TextArea {...p} name="admin_note" rows={4} maxLength={2000} defaultValue={r.admin_note ?? ""} />}
            </Field>
            <div>
              <SubmitButton pendingLabel="저장 중…">저장</SubmitButton>
            </div>
          </form>
        </Card>

        <Card title="이 이메일의 데이터">
          <p className="mb-3 text-[15px]">무엇이 남아 있는지 보고, 필요하면 지워요. 삭제는 한 번 더 확인을 거쳐요.</p>
          <LinkButton href={`/admin/privacy/erase?email=${encodeURIComponent(r.email)}&request=${r.id}`}>조회·삭제 도구 열기</LinkButton>
        </Card>
      </div>
    </>
  );
}
