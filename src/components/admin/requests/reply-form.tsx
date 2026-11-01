"use client";

import { useActionState } from "react";
import { sendInquiryReply, type ReplyState } from "@/app/(admin)/admin/(panel)/inquiries/actions";
import { REPLY_TEMPLATES } from "@/lib/admin/requests/pure";
import { Alert } from "../alert";
import { Button } from "../button";
import { Field, TextArea, TextInput } from "../field";
import { SubmitButton } from "../submit-button";

/** Reply composer with 3 insertable templates. Plain text; the server escapes it and adds the reply-to footer. */
export function ReplyForm({ inquiryId, to }: { inquiryId: string; to: string }) {
  const [state, action] = useActionState<ReplyState, FormData>(sendInquiryReply, {});

  const insert = (id: string) => {
    const t = REPLY_TEMPLATES.find((x) => x.id === id);
    const subject = document.getElementById("subject") as HTMLInputElement | null;
    const body = document.getElementById("body") as HTMLTextAreaElement | null;
    if (!t || !subject || !body) return;
    if (body.value.trim() && body.value !== t.body && !window.confirm("지금 쓰던 내용을 템플릿으로 바꿀까요?")) return;
    subject.value = t.subject;
    body.value = t.body;
  };

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="id" value={inquiryId} />
      <div>
        <p className="mb-1.5 text-[15px] font-bold">템플릿 넣기</p>
        <div className="flex flex-wrap gap-2">
          {REPLY_TEMPLATES.map((t) => (
            <Button key={t.id} variant="secondary" onClick={() => insert(t.id)}>
              {t.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-[15px]">
        받는 사람: <strong className="break-all">{to}</strong>
      </p>
      <Field id="subject" label="제목">
        {(p) => <TextInput {...p} name="subject" maxLength={150} defaultValue={state.values?.subject ?? ""} />}
      </Field>
      <Field
        id="body"
        label="내용"
        hint="글자 그대로 보내요(HTML은 먹지 않아요). 빈 줄은 문단 구분이에요. 아래에 '이 메일에 답장하면 hello@lab98.io 로 전달돼요' 안내가 자동으로 붙어요."
      >
        {(p) => <TextArea {...p} name="body" rows={10} maxLength={5000} defaultValue={state.values?.body ?? ""} />}
      </Field>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div>
        <SubmitButton pendingLabel="보내는 중…">답장 보내기</SubmitButton>
      </div>
    </form>
  );
}
