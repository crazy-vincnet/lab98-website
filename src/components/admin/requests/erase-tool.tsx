"use client";

import { useActionState, useState } from "react";
import { eraseEmailData, previewEraseEmail, type EraseState } from "@/app/(admin)/admin/(panel)/privacy/actions";
import { Alert } from "../alert";
import { Field, TextInput } from "../field";
import { SubmitButton } from "../submit-button";

const rows = (d: NonNullable<EraseState["data"]>) => [
  ["문의 (inquiries)", `${d.inquiries}건`, "삭제"],
  ["문의 답장 기록 (inquiry_replies)", `${d.replies}건`, "삭제 (문의와 함께)"],
  ["출시 알림 신청 (launch_signups)", `${d.launchSignups}건`, "삭제"],
  ["개인정보 요청 기록 (처리 완료·거절)", `${d.requestsResolved}건`, "남김: 요청 내용·IP 정보 지우고 이메일은 가려서 3년 보관"],
  ["개인정보 요청 기록 (처리 전)", `${d.requestsOpen}건`, "그대로 둠 (이 요청으로 처리 중인 건만 완료 처리)"],
  ["수신거부 목록 (email_optouts)", d.optouts > 0 ? "있음" : "없음", "남김: 앞으로 메일이 가지 않게 하는 목록이에요"],
];

/** Two steps: preview what exists, then delete after typing the address again. */
export function EraseTool({ initialEmail, requestId }: { initialEmail: string; requestId?: string }) {
  const [preview, previewAction] = useActionState<EraseState, FormData>(previewEraseEmail, {});
  const [run, runAction] = useActionState<EraseState, FormData>(eraseEmailData, {});
  const [typed, setTyped] = useState("");

  if (run.done) {
    const r = run.done.removed;
    return (
      <div className="grid gap-3">
        <Alert kind="ok">
          삭제를 마쳤어요. 문의 {r.inquiries}건, 답장 {r.replies}건, 출시 알림 {r.launchSignups}건을 지웠고 요청 기록 {r.requestRecordsMinimised}건은 최소한만 남겼어요.
          {run.done.mailed === "sent" && " 완료 안내 메일도 보냈어요."}
          {run.done.mailed === "failed" && " 완료 안내 메일은 보내지 못했어요. 직접 알려 주세요."}
        </Alert>
      </div>
    );
  }

  const email = preview.email;
  return (
    <div className="grid gap-5">
      <form action={previewAction} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" noValidate>
        {requestId && <input type="hidden" name="request" value={requestId} />}
        <Field id="email" label="이메일" error={preview.error}>
          {(p) => <TextInput {...p} name="email" type="email" defaultValue={initialEmail} maxLength={254} autoComplete="off" />}
        </Field>
        <SubmitButton variant="secondary" pendingLabel="조회 중…">
          먼저 조회하기
        </SubmitButton>
      </form>

      {email && preview.data && (
        <form action={runAction} className="grid gap-4" noValidate>
          <input type="hidden" name="email" value={email} />
          {preview.requestId && <input type="hidden" name="request" value={preview.requestId} />}
          <p className="text-[15px]">
            <strong className="break-all">{email}</strong> 로 보관 중인 정보예요.
          </p>
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[520px] text-left text-[15px]">
              <caption className="sr-only">이 이메일로 보관 중인 정보와 처리 방법</caption>
              <thead className="bg-concrete">
                <tr>
                  <th className="px-3 py-2 text-[14px]">종류</th>
                  <th className="px-3 py-2 text-[14px]">현재</th>
                  <th className="px-3 py-2 text-[14px]">처리</th>
                </tr>
              </thead>
              <tbody>
                {rows(preview.data).map(([a, b, c]) => (
                  <tr key={a} className="border-t border-line">
                    <td className="px-3 py-2">{a}</td>
                    <td className="px-3 py-2 font-bold">{b}</td>
                    <td className="px-3 py-2">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Alert kind="error">
            삭제하면 되돌릴 수 없어요. 요청자가 <strong>본인 확인 메일에 답장한 뒤</strong>에만 실행하세요.
          </Alert>
          <Field id="confirm" label="확인을 위해 삭제할 이메일을 그대로 입력해 주세요" error={run.error}>
            {(p) => <TextInput {...p} name="confirm" type="text" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />}
          </Field>
          <label className="flex min-h-11 items-center gap-2 text-[15px]">
            <input type="checkbox" name="notify" className="size-5" /> 삭제를 마친 뒤 이 주소로 완료 안내 메일 보내기
          </label>
          <div>
            <SubmitButton variant="danger" pendingLabel="삭제하는 중…" className={typed.trim().toLowerCase() === email ? "" : "pointer-events-none opacity-50"}>
              이 이메일의 모든 데이터 삭제
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
