"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { Button, cx } from "@/components/ui";
import {
  PRIVACY_REQUEST_FIELDS,
  PRIVACY_REQUEST_LIMITS,
  validatePrivacyRequest,
  type PrivacyRequestFieldErrors,
  type RequestType,
} from "@/lib/privacy-request";
import { submitPrivacyRequest } from "@/app/actions/privacy-request";
import type { Locale } from "@/lib/i18n";
import { getPrivacyRequestCopy } from "./copy.en";


const inputBase =
  "block w-full border-2 bg-paper px-[18px] text-body-sm text-ink placeholder:text-placeholder transition-colors duration-150 hover:bg-concrete/40 focus:bg-paper";

/**
 * 개인정보 요청 form. Submits to the `submitPrivacyRequest` Server Action (stored in `privacy_requests`;
 * the team and the requester each get an email). Nothing is changed until the requester replies.
 * `to` is the fallback address shown when sending fails and on the success screen.
 */
export function PrivacyRequestForm({ to, locale = "ko" }: { to: string; locale?: Locale }) {
  const t = getPrivacyRequestCopy(locale).form;
  const uid = useId();
  const [email, setEmail] = useState("");
  const [type, setType] = useState<RequestType | "">("");
  const [details, setDetails] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false); // a submit was attempted → show live errors
  const [serverErrors, setServerErrors] = useState<PrivacyRequestFieldErrors>({});
  const [failure, setFailure] = useState<"rateLimited" | "server" | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  // Time the form was first shown; the server rejects submissions that come back too fast (bots).
  const startedAt = useRef(0);
  const successRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const input = { email, type, details, consent };
  const live = submitted ? validatePrivacyRequest(input) : {};
  const errors: Partial<Record<keyof PrivacyRequestFieldErrors, string>> = {};
  for (const k of ["email", "type", "details", "consent"] as const) {
    const code = live[k] ?? serverErrors[k];
    if (code) errors[k] = t.errors[code];
  }
  const detailsNeeded = type === "correct";

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  useEffect(() => {
    if (failure) failureRef.current?.focus();
  }, [failure]);

  function focusFirst(e: PrivacyRequestFieldErrors) {
    const ref = e.email ? emailRef : e.type ? typeRef : e.details ? detailsRef : e.consent ? consentRef : null;
    ref?.current?.focus();
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setServerErrors({});
    setFailure(null);
    const e = validatePrivacyRequest(input);
    if (Object.keys(e).length) {
      focusFirst(e);
      return;
    }
    const fd = new FormData(ev.currentTarget);
    fd.set(PRIVACY_REQUEST_FIELDS.startedAt, String(startedAt.current));
    startTransition(async () => {
      try {
        const res = await submitPrivacyRequest(fd);
        if (res.ok) setSent(true);
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
    setType("");
    setDetails("");
    setConsent(false);
    setSubmitted(false);
    setServerErrors({});
    setFailure(null);
    setSent(false);
  }

  if (sent) {
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
          <input type="text" name={PRIVACY_REQUEST_FIELDS.honeypot} tabIndex={-1} autoComplete="off" defaultValue="" />
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
          name={PRIVACY_REQUEST_FIELDS.email}
          required
          autoComplete="email"
          inputMode="email"
          maxLength={PRIVACY_REQUEST_LIMITS.email}
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={[`${uid}-email-hint`, errors.email ? `${uid}-email-error` : ""].filter(Boolean).join(" ")}
          className={cx(inputBase, "h-14", errors.email ? "border-red" : "border-ink")}
        />
        <p id={`${uid}-email-hint`} className="mt-2 text-body-sm text-gray text-pretty">
          {t.emailHint}
        </p>
        {errors.email && (
          <p id={`${uid}-email-error`} className="mt-2 text-body-sm text-red-text">
            {errors.email}
          </p>
        )}
      </div>

      <fieldset aria-describedby={errors.type ? `${uid}-type-error` : undefined}>
        <legend className="mb-3 text-body-sm font-bold">{t.typeLegend}</legend>
        {/* Two columns on phones (5 short labels), one row from sm. */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {t.types.map((o, i) => {
            const on = type === o.value;
            return (
              <label
                key={o.value}
                className={cx(
                  "flex min-h-11 cursor-pointer items-center gap-2 border-2 px-4 py-2 text-body-sm font-bold leading-snug transition-colors duration-150 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-red",
                  errors.type ? "border-red" : "border-ink",
                  on ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-concrete",
                )}
              >
                <input
                  ref={i === 0 ? typeRef : undefined}
                  type="radio"
                  name={PRIVACY_REQUEST_FIELDS.type}
                  value={o.value}
                  checked={on}
                  required
                  onChange={() => setType(o.value as RequestType)}
                  className="sr-only"
                />
                <i
                  className={cx(
                    "size-2.5 rounded-full transition-[background-color,box-shadow] duration-150",
                    on ? "bg-red" : "bg-transparent ring-[1.5px] ring-current ring-inset",
                  )}
                  aria-hidden
                />
                {o.label}
              </label>
            );
          })}
        </div>
        {errors.type && (
          <p id={`${uid}-type-error`} className="mt-2 text-body-sm text-red-text">
            {errors.type}
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor={`${uid}-details`} className="mb-2 block text-body-sm font-bold">
          {t.detailsLabel} <span className="font-normal text-gray">{detailsNeeded ? t.detailsRequired : t.detailsOptional}</span>
        </label>
        <textarea
          ref={detailsRef}
          id={`${uid}-details`}
          name={PRIVACY_REQUEST_FIELDS.details}
          required={detailsNeeded}
          rows={4}
          maxLength={PRIVACY_REQUEST_LIMITS.details}
          placeholder={type ? t.detailsPlaceholder[type] : t.detailsPlaceholder.access}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          aria-invalid={!!errors.details}
          aria-describedby={errors.details ? `${uid}-details-error` : undefined}
          className={cx(inputBase, "min-h-28 resize-y py-4", errors.details ? "border-red" : "border-ink")}
        />
        {errors.details && (
          <p id={`${uid}-details-error`} className="mt-2 text-body-sm text-red-text">
            {errors.details}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-consent`} className="flex min-h-11 cursor-pointer items-start gap-3 text-body-sm font-bold">
          <input
            ref={consentRef}
            id={`${uid}-consent`}
            type="checkbox"
            name={PRIVACY_REQUEST_FIELDS.consent}
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={[`${uid}-ip`, errors.consent ? `${uid}-consent-error` : ""].filter(Boolean).join(" ")}
            className="mt-[0.2em] size-5 shrink-0 cursor-pointer accent-ink"
          />
          <span>{t.consentLabel}</span>
        </label>
        <p id={`${uid}-ip`} className="mt-1 pl-8 text-body-sm text-gray text-pretty">
          {t.ipNote}
        </p>
        {errors.consent && (
          <p id={`${uid}-consent-error`} className="mt-2 pl-8 text-body-sm text-red-text">
            {errors.consent}
          </p>
        )}
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
