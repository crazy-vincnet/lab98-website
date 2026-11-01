"use client";

import { useActionState } from "react";
import { runChecksAction, saveSearchSettings, type ChecksState, type SearchFormState } from "@/app/(admin)/admin/(panel)/search/actions";
import { Alert } from "./alert";
import { Badge } from "./badge";
import { Field, TextInput } from "./field";
import { SubmitButton } from "./submit-button";
import { Table, TBody, Td, Th, THead, Tr } from "./table";

export function VerificationForm({ google, naver }: { google: string; naver: string }) {
  const [state, action] = useActionState<SearchFormState, FormData>(saveSearchSettings, {});
  return (
    <form action={action} className="grid gap-4" noValidate>
      <Field
        id="google"
        label="구글 인증 코드"
        hint={'Search Console의 HTML 태그 방식에서 content="…" 안의 값이에요. 태그를 통째로 붙여 넣어도 돼요.'}
        error={state.errors?.google}
      >
        {(p) => <TextInput {...p} name="google" defaultValue={state.values?.google ?? google} autoComplete="off" spellCheck={false} className="font-mono" />}
      </Field>
      <Field id="naver" label="네이버 인증 코드" hint="서치어드바이저의 HTML 태그 방식 값이에요. 비워 두면 태그를 빼요." error={state.errors?.naver}>
        {(p) => <TextInput {...p} name="naver" defaultValue={state.values?.naver ?? naver} autoComplete="off" spellCheck={false} className="font-mono" />}
      </Field>
      <div>
        <SubmitButton pendingLabel="저장 중…">저장</SubmitButton>
      </div>
    </form>
  );
}

const tone = { ok: "ok", warn: "warn", fail: "danger" } as const;
const word = { ok: "정상", warn: "확인 필요", fail: "문제" } as const;

export function SearchChecks() {
  const [state, action] = useActionState<ChecksState, FormData>(async (prev) => runChecksAction(prev), {});
  return (
    <div className="grid gap-4">
      <form action={action}>
        <SubmitButton variant="secondary" pendingLabel="점검 중… (10초 정도 걸려요)">
          지금 점검하기
        </SubmitButton>
      </form>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.results && (
        <Table caption="검색 등록 점검 결과">
          <THead>
            <Tr>
              <Th>항목</Th>
              <Th>상태</Th>
              <Th>내용</Th>
            </Tr>
          </THead>
          <TBody>
            {state.results.map((r) => (
              <Tr key={r.id}>
                <Td className="whitespace-nowrap font-bold">{r.label}</Td>
                <Td>
                  <Badge tone={tone[r.status]}>{word[r.status]}</Badge>
                </Td>
                <Td className="break-all">{r.detail}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
