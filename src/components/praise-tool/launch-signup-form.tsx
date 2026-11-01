"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { Button, cx } from "@/components/ui";
import { PrivacyNotice } from "@/components/consent/privacy-notice";
import { LAUNCH_FIELDS, LAUNCH_LIMITS, validateLaunchSignup, type LaunchFieldErrors } from "@/lib/launch-signup";
import { signupLaunch } from "@/app/actions/launch";
import { PRIVACY_PATH } from "@/components/experiments/paths";
import type { getPraiseTool } from "@/lib/praise-tool.en";
import { localePath, type Locale } from "@/lib/i18n";

/** Merged (admin-editable, key "praise-tool.page") form copy; the server page passes it as a prop. */
export type LaunchFormCopy = ReturnType<typeof getPraiseTool>["form"];

const inputBase =
  "block w-full border-2 bg-paper px-[18px] text-body-sm text-ink placeholder:text-placeholder transition-colors duration-150 hover:bg-concrete/40 focus:bg-paper";

/**
 * Praise Tool launch-notification signup. Submits to the `signupLaunch` Server Action
 * (stored in InsForge `launch_signups`, team gets an email; nothing is sent to the visitor).
 * `to` is only shown as a fallback address when signing up fails and on the success screen.
 */
export function LaunchSignupForm({ to, locale = "ko", copy }: { to: string; locale?: Locale; copy: LaunchFormCopy }) {
  const t = copy;
  const uid = useId();
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false); // a submit was attempted → show live errors
  const [serverErrors, setServerErrors] = useState<LaunchFieldErrors>({});
  const [failure, setFailure] = useState<"rateLimited" | "server" | null>(null);
  const [done, setDone] = useState<"new" | "already" | null>(null);
  const [pending, startTransition] = useTransition();
  // Time the form was first shown; the server rejects submissions that come back too fast (bots).
  const startedAt = useRef(0);
  const successRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const orgRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const live = submitted ? validateLaunchSignup({ email, org, consent }) : {};
  const errors: Partial<Record<keyof LaunchFieldErrors, string>> = {};
  for (const k of ["email", "org", "consent"] as const) {
    const code = live[k] ?? serverErrors[k];
    if (code) errors[k] = t.errors[code];
  }

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (failure) failureRef.current?.focus();
  }, [failure]);

  function focusFirst(e: LaunchFieldErrors) {
    const ref = e.email ? emailRef : e.org ? orgRef : e.consent ? consentRef : null;
    ref?.current?.focus();
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setServerErrors({});
    setFailure(null);
    const e = validateLaunchSignup({ email, org, consent });
    if (Object.keys(e).length) {
      focusFirst(e);
      return;
    }
    const fd = new FormData(ev.currentTarget);
    fd.set(LAUNCH_FIELDS.startedAt, String(startedAt.current));
    startTransition(async () => {
      try {
        const res = await signupLaunch(fd);
        if (res.ok) setDone(res.already ? "already" : "new");
        else if (res.reason === "invalid") {
          setServerErrors(res.fieldErrors);
          focusFirst(res.fieldErrors);
        } else setFailure(res.reason);
      } catch {
        setFailure("server");
      }
    });
  }

  function reset() {
    setEmail("");
    setOrg("");
    setConsent(false);
    setSubmitted(false);
    setServerErrors({});
    setFailure(null);
    setDone(null);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-5 border-2 border-ink bg-paper p-6 md:p-10" role="status">
        <p className="label ko-tight flex items-center gap-2 text-ink">
          <i className="size-2.5 rounded-full bg-faith" aria-hidden />
          {t.success.eyebrow}
        </p>
        <h3 ref={successRef} tabIndex={-1} className="text-h3 text-balance outline-none">
          {done === "already" ? t.success.already : t.success.title}
        </h3>
        <p className="text-body-sm text-gray">
          {t.success.fallbackBefore}{" "}
          <a href={`mailto:${to}`} className="break-all font-bold text-ink underline underline-offset-4 hover:text-red-text">
            {to}
          </a>
          {t.success.fallbackAfter}
        </p>
        <div>
          <Button type="button" variant="secondary" size="sm" onClick={reset}>
            {t.success.reset}
          </Button>
        </div>
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
          <input type="text" name={LAUNCH_FIELDS.honeypot} tabIndex={-1} autoComplete="off" defaultValue="" />
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
          name={LAUNCH_FIELDS.email}
          required
          autoComplete="email"
          inputMode="email"
          maxLength={LAUNCH_LIMITS.email}
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${uid}-email-error` : undefined}
          className={cx(inputBase, "h-14", errors.email ? "border-red" : "border-ink")}
        />
        {errors.email && (
          <p id={`${uid}-email-error`} className="mt-2 text-body-sm text-red-text">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-org`} className="mb-2 block text-body-sm font-bold">
          {t.orgLabel}
        </label>
        <input
          ref={orgRef}
          id={`${uid}-org`}
          type="text"
          name={LAUNCH_FIELDS.org}
          autoComplete="organization"
          maxLength={LAUNCH_LIMITS.org}
          placeholder={t.orgPlaceholder}
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          aria-invalid={!!errors.org}
          aria-describedby={errors.org ? `${uid}-org-error` : undefined}
          className={cx(inputBase, "h-14", errors.org ? "border-red" : "border-ink")}
        />
        {errors.org && (
          <p id={`${uid}-org-error`} className="mt-2 text-body-sm text-red-text">
            {errors.org}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <PrivacyNotice id={`${uid}-notice`} copy={t.notice} />
        <div>
          <label htmlFor={`${uid}-consent`} className="flex min-h-11 cursor-pointer items-start gap-3 text-body-sm font-bold">
            <input
              ref={consentRef}
              id={`${uid}-consent`}
              type="checkbox"
              name={LAUNCH_FIELDS.consent}
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={[`${uid}-notice`, errors.consent ? `${uid}-consent-error` : ""].filter(Boolean).join(" ")}
              className="mt-[0.2em] size-5 shrink-0 cursor-pointer accent-ink"
            />
            <span>{t.consentLabel}</span>
          </label>
          {errors.consent && (
            <p id={`${uid}-consent-error`} className="mt-2 pl-8 text-body-sm text-red-text">
              {errors.consent}
            </p>
          )}
          <p className="mt-1 pl-8 text-body-sm text-gray text-pretty">
            {t.policyBefore}{" "}
            {/* New tab, so a half-filled form isn't lost. */}
            <Link href={localePath(locale, PRIVACY_PATH)} target="_blank" className="font-bold text-ink underline underline-offset-4 hover:text-red-text">
              {t.policyLink}
              <span className="sr-only"> ({t.policyNewTab})</span>
            </Link>
            {t.policyAfter}
          </p>
        </div>
      </div>

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
