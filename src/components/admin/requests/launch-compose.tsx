"use client";

import { useActionState, useState } from "react";
import { createCampaignWithTest, type ComposeState } from "@/app/(admin)/admin/(panel)/launch/actions";
import { Alert } from "../alert";
import { Field, TextArea, TextInput } from "../field";
import { SubmitButton } from "../submit-button";
import { MailPreview } from "./mail-preview";

/** Step 1: write the mail, see the preview, send a test to yourself. Nothing goes to signups from this form. */
export function LaunchCompose({ defaults, sampleUnsubscribeUrl, adminEmail }: { defaults: { subject: string; body: string }; sampleUnsubscribeUrl: string; adminEmail: string }) {
  const [state, action] = useActionState<ComposeState, FormData>(createCampaignWithTest, {});
  const [body, setBody] = useState(state.values?.body ?? defaults.body);
  return (
    <form action={action} className="grid gap-4 lg:grid-cols-2" noValidate>
      <div className="grid content-start gap-4">
        <Field id="subject" label="제목">
          {(p) => <TextInput {...p} name="subject" maxLength={150} defaultValue={state.values?.subject ?? defaults.subject} />}
        </Field>
        <Field id="body" label="내용" hint="글자 그대로 보내요. 빈 줄은 문단 구분이에요. 맨 아래에 수신거부 링크와 안내가 자동으로 붙어요.">
          {(p) => <TextArea {...p} name="body" rows={12} maxLength={5000} value={body} onChange={(e) => setBody(e.target.value)} />}
        </Field>
        {state.error && <Alert kind="error">{state.error}</Alert>}
        <div className="grid gap-2">
          <SubmitButton pendingLabel="테스트 메일 보내는 중…" className="justify-self-start">
            테스트 메일을 나에게 보내기
          </SubmitButton>
          <p className="text-[14px] text-gray">
            {adminEmail} 로 먼저 보내요. 테스트를 보내야 실제 발송 버튼이 열려요. 테스트도 한 시간 발송 한도(10~50통)에 들어가요.
          </p>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[15px] font-bold">미리보기</p>
        <MailPreview body={body} sampleUnsubscribeUrl={sampleUnsubscribeUrl} />
      </div>
    </form>
  );
}
