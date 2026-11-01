"use client";

import { useActionState } from "react";
import { updateMediaAlt, type AltState } from "@/app/(admin)/admin/(panel)/media/actions";
import { Field, TextInput } from "../field";
import { SubmitButton } from "../submit-button";

export function AltForm({ id, altKo, altEn }: { id: string; altKo: string; altEn: string }) {
  const [state, action] = useActionState<AltState, FormData>(updateMediaAlt, {});
  return (
    <form action={action} className="grid gap-3" noValidate>
      <input type="hidden" name="id" value={id} />
      <Field id={`ko-${id}`} label="대체 텍스트 (한국어, 필수)" error={state.error}>
        {(p) => <TextInput {...p} name="alt_ko" defaultValue={state.values?.alt_ko ?? altKo} maxLength={300} required />}
      </Field>
      <Field id={`en-${id}`} label="대체 텍스트 (영어)">
        {(p) => <TextInput {...p} name="alt_en" defaultValue={state.values?.alt_en ?? altEn} maxLength={300} lang="en" />}
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="저장 중…">대체 텍스트 저장</SubmitButton>
        {state.ok && (
          <span role="status" className="text-[15px] font-bold text-[#0a5c42]">
            저장했어요
          </span>
        )}
      </div>
    </form>
  );
}
