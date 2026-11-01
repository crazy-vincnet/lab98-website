"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotStartAction,
  resetPasswordAction,
  setupStartAction,
  setupVerifyAction,
  signInAction,
} from "@/app/(admin)/admin/(auth)/actions";
import { MIN_PASSWORD, type AuthFormState } from "@/lib/admin/auth-state";
import { Alert } from "./alert";
import { Field, TextInput } from "./field";
import { SubmitButton } from "./submit-button";

const empty: AuthFormState = {};

function Errors({ state }: { state: AuthFormState }) {
  return (
    <>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.notice && <Alert kind="ok">{state.notice}</Alert>}
    </>
  );
}

const pwHint = `${MIN_PASSWORD}자 이상`;

export function LoginForm() {
  const [state, action] = useActionState(signInAction, empty);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <Errors state={state} />
      <Field id="email" label="이메일" error={state.fieldErrors?.email}>
        {(p) => <TextInput {...p} name="email" type="email" autoComplete="username" defaultValue={state.email} required />}
      </Field>
      <Field id="password" label="비밀번호">
        {(p) => <TextInput {...p} name="password" type="password" autoComplete="current-password" required />}
      </Field>
      <SubmitButton pendingLabel="로그인 중…">로그인</SubmitButton>
      <p className="grid gap-1 text-[15px]">
        <Link href="/admin/forgot-password" className="underline underline-offset-4">비밀번호를 잊었어요</Link>
        <Link href="/admin/setup" className="underline underline-offset-4">처음 사용해요 (최초 설정)</Link>
      </p>
    </form>
  );
}

export function SetupForm() {
  const [start, startAction] = useActionState(setupStartAction, empty);
  const [verify, verifyAction] = useActionState(setupVerifyAction, empty);

  if (start.step === "code") {
    const email = verify.email ?? start.email ?? "";
    return (
      <form action={verifyAction} className="grid gap-4" noValidate>
        <Alert kind="ok">{start.notice}</Alert>
        {verify.error && <Alert kind="error">{verify.error}</Alert>}
        <input type="hidden" name="email" value={email} />
        <p className="text-[15px] text-gray">{email}</p>
        <Field id="code" label="인증 코드" hint="메일로 받은 숫자 코드를 입력해 주세요." error={verify.fieldErrors?.code}>
          {(p) => <TextInput {...p} name="code" inputMode="numeric" autoComplete="one-time-code" required />}
        </Field>
        <SubmitButton pendingLabel="확인 중…">인증하고 시작하기</SubmitButton>
        <p className="text-[15px]">
          <Link href="/admin/login" className="underline underline-offset-4">이미 설정했다면 로그인</Link>
        </p>
      </form>
    );
  }
  return (
    <form action={startAction} className="grid gap-4" noValidate>
      <Errors state={start} />
      <p className="text-[15px] text-gray">관리자 이메일로 계정을 만들어요. 허용된 이메일만 설정할 수 있어요.</p>
      <Field id="email" label="이메일" error={start.fieldErrors?.email}>
        {(p) => <TextInput {...p} name="email" type="email" autoComplete="username" defaultValue={start.email} required />}
      </Field>
      <Field id="password" label="새 비밀번호" hint={pwHint} error={start.fieldErrors?.password}>
        {(p) => <TextInput {...p} name="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} required />}
      </Field>
      <Field id="confirm" label="비밀번호 확인" error={start.fieldErrors?.confirm}>
        {(p) => <TextInput {...p} name="confirm" type="password" autoComplete="new-password" required />}
      </Field>
      <SubmitButton pendingLabel="코드 보내는 중…">인증 코드 받기</SubmitButton>
      <p className="text-[15px]">
        <Link href="/admin/login" className="underline underline-offset-4">로그인으로 돌아가기</Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [start, startAction] = useActionState(forgotStartAction, empty);
  const [reset, resetAction] = useActionState(resetPasswordAction, empty);

  if (start.step === "code") {
    const email = reset.email ?? start.email ?? "";
    return (
      <form action={resetAction} className="grid gap-4" noValidate>
        <Alert kind="ok">{start.notice}</Alert>
        {reset.error && <Alert kind="error">{reset.error}</Alert>}
        <input type="hidden" name="email" value={email} />
        <p className="text-[15px] text-gray">{email}</p>
        <Field id="code" label="재설정 코드" error={reset.fieldErrors?.code}>
          {(p) => <TextInput {...p} name="code" inputMode="numeric" autoComplete="one-time-code" required />}
        </Field>
        <Field id="password" label="새 비밀번호" hint={pwHint} error={reset.fieldErrors?.password}>
          {(p) => <TextInput {...p} name="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} required />}
        </Field>
        <Field id="confirm" label="비밀번호 확인" error={reset.fieldErrors?.confirm}>
          {(p) => <TextInput {...p} name="confirm" type="password" autoComplete="new-password" required />}
        </Field>
        <SubmitButton pendingLabel="바꾸는 중…">비밀번호 바꾸기</SubmitButton>
      </form>
    );
  }
  return (
    <form action={startAction} className="grid gap-4" noValidate>
      <Errors state={start} />
      <p className="text-[15px] text-gray">관리자 이메일을 입력하면 재설정 코드를 보내 드려요.</p>
      <Field id="email" label="이메일" error={start.fieldErrors?.email}>
        {(p) => <TextInput {...p} name="email" type="email" autoComplete="username" defaultValue={start.email} required />}
      </Field>
      <SubmitButton pendingLabel="보내는 중…">코드 받기</SubmitButton>
      <p className="text-[15px]">
        <Link href="/admin/login" className="underline underline-offset-4">로그인으로 돌아가기</Link>
      </p>
    </form>
  );
}
