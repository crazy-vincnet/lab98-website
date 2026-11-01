"use client";

import { useActionState } from "react";
import { createPost, type CreateState } from "@/app/(admin)/admin/(panel)/blog/actions";
import { Alert } from "../alert";
import { Field, SelectInput, TextInput } from "../field";
import { SubmitButton } from "../submit-button";

export function NewPostForm({ defaultLocale = "ko" }: { defaultLocale?: "ko" | "en" }) {
  const [state, action] = useActionState<CreateState, FormData>(createPost, {});
  return (
    <form action={action} className="grid max-w-[560px] gap-4" noValidate>
      <Field id="locale" label="언어" hint="나중에 &quot;다른 언어 버전 만들기&quot;로 번역본을 이어서 만들 수 있어요.">
        {(p) => (
          <SelectInput {...p} name="locale" defaultValue={state.values?.locale ?? defaultLocale}>
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </SelectInput>
        )}
      </Field>
      <Field id="title" label="제목" error={state.error}>
        {(p) => <TextInput {...p} name="title" defaultValue={state.values?.title ?? ""} maxLength={200} autoFocus />}
      </Field>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div>
        <SubmitButton pendingLabel="만드는 중…">초안 만들고 쓰기</SubmitButton>
      </div>
    </form>
  );
}
