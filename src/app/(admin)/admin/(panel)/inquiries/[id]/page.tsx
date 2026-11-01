import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/admin/badge";
import { LinkButton } from "@/components/admin/button";
import { Card } from "@/components/admin/card";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Field, SelectInput, TextArea } from "@/components/admin/field";
import { PageHeader } from "@/components/admin/page-header";
import { ReplyForm } from "@/components/admin/requests/reply-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { UUID_RE } from "@/lib/admin/requests/mail";
import { INQUIRY_STATUS_LABEL, INQUIRY_STATUS_TONE, INQUIRY_STATUSES, INTEREST_LABEL, type InquiryStatus } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { deleteInquiry, markInquirySpam, saveInquiry } from "../actions";

export const metadata: Metadata = { title: "문의 상세" };

type Inquiry = {
  id: string;
  created_at: string;
  interest: string;
  name: string | null;
  email: string;
  message: string;
  status: InquiryStatus;
  admin_note: string | null;
  replied_at: string | null;
};
type Reply = { id: string; created_at: string; to_email: string; subject: string; body: string; sent_at: string | null; sent_by: string | null; error: string | null };

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const db = getInsforgeAdmin().database;
  const [inq, replies] = await Promise.all([
    db.from("inquiries").select("id,created_at,interest,name,email,message,status,admin_note,replied_at").eq("id", id).limit(1),
    db.from("inquiry_replies").select("id,created_at,to_email,subject,body,sent_at,sent_by,error").eq("inquiry_id", id).order("created_at", { ascending: true }),
  ]);
  const i = (inq.data?.[0] ?? null) as Inquiry | null;
  if (!i) notFound();
  const thread = (replies.data ?? []) as Reply[];

  return (
    <>
      <PageHeader
        title={i.name ? `${i.name} 님의 문의` : "문의"}
        description={
          <>
            {formatKst(i.created_at)} · {INTEREST_LABEL[i.interest] ?? i.interest} · <span className="break-all">{i.email}</span>
          </>
        }
        actions={<LinkButton href="/admin/inquiries">목록으로</LinkButton>}
      />

      <div className="grid gap-6">
        <Card title="받은 내용" actions={<Badge tone={INQUIRY_STATUS_TONE[i.status] ?? "neutral"}>{INQUIRY_STATUS_LABEL[i.status] ?? i.status}</Badge>}>
          <div className="whitespace-pre-wrap break-words border-2 border-ink p-4 text-[16px] leading-relaxed">{i.message}</div>
        </Card>

        <Card title={`주고받은 메일 (${thread.length})`}>
          {thread.length === 0 ? (
            <p className="text-gray">아직 보낸 답장이 없어요.</p>
          ) : (
            <ol className="grid gap-3">
              {thread.map((r) => (
                <li key={r.id} className="border border-line p-3">
                  <p className="text-[14px] text-gray">
                    {formatKst(r.sent_at ?? r.created_at)} · {r.sent_by ?? "-"} → <span className="break-all">{r.to_email}</span>{" "}
                    {r.sent_at ? <Badge tone="ok">보냄</Badge> : <Badge tone="danger">실패</Badge>}
                  </p>
                  <p className="mt-1 font-bold">{r.subject}</p>
                  <div className="mt-1 whitespace-pre-wrap break-words text-[15px]">{r.body}</div>
                  {r.error && <p className="mt-1 text-[14px] font-bold text-[#b42318]">오류: {r.error}</p>}
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="답장 쓰기">
          {i.status === "spam" && <p className="mb-3 text-[15px] font-bold text-[#8f1c13]">스팸으로 표시된 문의예요. 답장하면 상태가 &apos;답장함&apos;으로 바뀌어요.</p>}
          <ReplyForm inquiryId={i.id} to={i.email} />
        </Card>

        <Card title="상태와 메모">
          <form action={saveInquiry} className="grid gap-4">
            <input type="hidden" name="id" value={i.id} />
            <Field id="status" label="상태">
              {(p) => (
                <SelectInput {...p} name="status" defaultValue={i.status} className="sm:max-w-[240px]">
                  {INQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {INQUIRY_STATUS_LABEL[s]}
                    </option>
                  ))}
                </SelectInput>
              )}
            </Field>
            <Field id="admin_note" label="내부 메모" hint="문의자에게는 보이지 않아요. 2,000자까지.">
              {(p) => <TextArea {...p} name="admin_note" rows={4} maxLength={2000} defaultValue={i.admin_note ?? ""} />}
            </Field>
            <div>
              <SubmitButton pendingLabel="저장 중…">저장</SubmitButton>
            </div>
          </form>
        </Card>

        <Card title="정리">
          <div className="flex flex-wrap items-center gap-6">
            {i.status !== "spam" && (
              <form action={markInquirySpam}>
                <input type="hidden" name="id" value={i.id} />
                <ConfirmButton question="스팸으로 표시할까요?" confirmLabel="네, 스팸이에요" variant="danger">
                  스팸으로 표시
                </ConfirmButton>
              </form>
            )}
            <form action={deleteInquiry}>
              <input type="hidden" name="id" value={i.id} />
              <ConfirmButton question="문의와 답장 기록을 완전히 삭제할까요? 되돌릴 수 없어요." confirmLabel="네, 삭제해요">
                문의 삭제
              </ConfirmButton>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
