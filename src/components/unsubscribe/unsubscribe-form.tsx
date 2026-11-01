"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { Button, cx } from "@/components/ui";
import { UNSUBSCRIBE_FIELDS, UNSUBSCRIBE_LIMITS, validateUnsubscribe, type UnsubscribeFieldErrors } from "@/lib/unsubscribe";
import { unsubscribeEmail } from "@/app/actions/unsubscribe";
import type { Locale } from "@/lib/i18n";
import type { UnsubscribeFormCopy } from "./copy.en";


const inputBase =
  "block w-full border-2 bg-paper px-[18px] text-body-sm text-ink placeholder:text-placeholder transition-colors duration-150 hover:bg-concrete/40 focus:bg-paper";

/**
 * 이메일 수신거부 form. Submits to the `unsubscribeEmail` Server Action (adds to `email_optouts`, optionally
 * deletes launch_signups). `?email=` prefills the address (links in our mails), read with useSearchParams,
 * so render this inside <Suspense> (see UnsubscribeFormFallback) to keep the page prerendered.
 */
export function UnsubscribeForm({ to, copy }: { to: string; locale?: Locale; copy: UnsubscribeFormCopy }) {
  const t = copy;
  const params = useSearchParams();
  const uid = useId();
  const [email, setEmail] = useState(() => (params.get("email") ?? "").trim().slice(0, UNSUBSCRIBE_LIMITS.email));
  const [cancelLaunch, setCancelLaunch] = useState(true);
  const [submitted, setSubmitted] = useState(false); // a submit was attempted → show live errors
  const [serverErrors, setServerErrors] = useState<UnsubscribeFieldErrors>({});
  const [failure, setFailure] = useState<"rateLimited" | "server" | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  // Time the form was first shown; the server rejects submissions that come back too fast (bots).
  const startedAt = useRef(0);
  const successRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const live = submitted ? validateUnsubscribe({ email }) : {};
  const code = live.email ?? serverErrors.email;
  const emailError = code ? t.errors[code] : undefined;

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (failure) failureRef.current?.focus();
  }, [failure]);

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setServerErrors({});
    setFailure(null);
    if (validateUnsubscribe({ email }).email) {
      emailRef.current?.focus();
      return;
    }
    const fd = new FormData(ev.currentTarget);
    fd.set(UNSUBSCRIBE_FIELDS.startedAt, String(startedAt.current));
    startTransition(async () => {
      try {
        const res = await unsubscribeEmail(fd);
        if (res.ok) setDone(true);
        else if (res.reason === "invalid") {
          setServerErrors(res.fieldErrors);
          emailRef.current?.focus();
        } else setFailure(res.reason);
      } catch {
        setFailure("server");
      }
    });
  }

  if (done) {
    return (
      <div className="flex flex-col gap-5 border-2 border-ink bg-paper p-6 md:p-10" role="status">
        <p className="label ko-tight flex items-center gap-2 text-ink">
          <i className="size-2.5 rounded-full bg-red" aria-hidden />
          {t.success.eyebrow}
        </p>
        <h2 ref={successRef} tabIndex={-1} className="text-h3 text-balance outline-none">
          {t.success.title}
        </h2>
        <p className="text-body-sm text-gray">
          {t.success.fallbackBefore}{" "}
          <a href={`mailto:${to}`} className="break-all font-bold text-ink underline underline-offset-4 hover:text-red-text">
            {to}
          </a>
          {t.success.fallbackAfter}
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-6 border-2 border-ink bg-paper p-6 md:p-10" aria-label={t.ariaLabel}>
      {failure && (
        <div ref={failureRef} tabIndex={-1} role="alert" className="border-2 border-red bg-paper p-4 text-body-sm text-ink outline-none">
          {t.failure[failure]}{" "}
          <a href={`mailto:${to}`} className="break-all font-bold underline underline-offset-4 hover:text-red-text">
            {to}
          </a>
          {t.failure.fallbackAfter}
        </div>
      )}
      {/* Honeypot: hidden from people and assistive tech; bots that fill every field get dropped. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name={UNSUBSCRIBE_FIELDS.honeypot} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div>
        <label htmlFor={`${uid}-email`} className="mb-2 block text-body-sm font-bold">
          {t.emailLabel}
        </label>
        <input
          ref={emailRef}
          id={`${uid}-email`}
          type="email"
          name={UNSUBSCRIBE_FIELDS.email}
          required
          autoComplete="email"
          inputMode="email"
          maxLength={UNSUBSCRIBE_LIMITS.email}
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!emailError}
          aria-describedby={[`${uid}-notice`, emailError ? `${uid}-email-error` : ""].filter(Boolean).join(" ")}
          className={cx(inputBase, "h-14", emailError ? "border-red" : "border-ink")}
        />
        {emailError && (
          <p id={`${uid}-email-error`} className="mt-2 text-body-sm text-red-text">
            {emailError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-launch`} className="flex min-h-11 cursor-pointer items-start gap-3 text-body-sm font-bold">
          <input
            id={`${uid}-launch`}
            type="checkbox"
            name={UNSUBSCRIBE_FIELDS.cancelLaunch}
            checked={cancelLaunch}
            onChange={(e) => setCancelLaunch(e.target.checked)}
            aria-describedby={`${uid}-launch-hint`}
            className="mt-[0.2em] size-5 shrink-0 cursor-pointer accent-ink"
          />
          <span>{t.cancelLaunchLabel}</span>
        </label>
        <p id={`${uid}-launch-hint`} className="mt-1 pl-8 text-body-sm text-gray text-pretty">
          {t.cancelLaunchHint}
        </p>
      </div>

      <p id={`${uid}-notice`} className="border-l-2 border-ink pl-4 text-body-sm text-gray text-pretty">
        {t.notice}
      </p>

      <Button type="submit" className="mt-1 w-full" disabled={pending}>
        {pending ? (
          t.submitting
        ) : (
          <>
            {t.submit} <span aria-hidden>→</span>
          </>
        )}
      </Button>
    </form>
  );
}

/** Static placeholder with the same footprint, shown while search params resolve on the client. */
export function UnsubscribeFormFallback() {
  return <div className="min-h-[360px] border-2 border-ink bg-paper" aria-hidden />;
}
