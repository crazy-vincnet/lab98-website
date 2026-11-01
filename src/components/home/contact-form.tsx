"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { Button, cx } from "@/components/ui";
import { PrivacyNotice } from "@/components/consent/privacy-notice";
import type { Division } from "@/lib/content";
import { FIELDS, LIMITS, validateInquiry, type FieldErrors } from "@/lib/inquiry";
import { submitInquiry } from "@/app/actions/contact";
import { PRIVACY_PATH } from "@/components/experiments/paths";
import { localePath, type Locale } from "@/lib/i18n";
import type { homeCopy } from "./copy";
import type { Dict } from "@/lib/i18n";

type Interest = { value: Division; label: string };

const dotBg: Record<Division, string> = { master: "bg-red", dev: "bg-dev", ai: "bg-ai", faith: "bg-faith" };

const inputBase =
  "block w-full border-2 bg-paper px-[18px] text-body-sm text-ink placeholder:text-placeholder transition-colors duration-150 hover:bg-concrete/40 focus:bg-paper";

/**
 * Contact form. Submits to the `submitInquiry` Server Action (stored in InsForge, team gets an email).
 * `to` is only shown as a fallback address when sending fails and on the success screen.
 */
export function ContactForm({ to, interests, copy: t, locale = "ko" }: { to: string; interests: Interest[]; copy: Dict<typeof homeCopy>["contactCopy"]["form"]; locale?: Locale }) {
  const uid = useId();
  const [interest, setInterest] = useState<Division>(interests[0].value);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false); // a submit was attempted → show live errors
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<"rateLimited" | "server" | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  // Time the form was first shown; the server rejects submissions that come back too fast (bots).
  const startedAt = useRef(0);
  const successRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const live = submitted ? validateInquiry({ interest, name, email, message, consent }) : {};
  const errors: Partial<Record<keyof FieldErrors, string>> = {};
  for (const k of ["name", "email", "message", "consent"] as const) {
    const code = live[k] ?? serverErrors[k];
    if (code) errors[k] = t.errors[code];
  }

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (failure) failureRef.current?.focus();
  }, [failure]);

  function focusFirst(e: FieldErrors) {
    const ref = e.name ? nameRef : e.email ? emailRef : e.message ? messageRef : e.consent ? consentRef : null;
    ref?.current?.focus();
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setServerErrors({});
    setFailure(null);
    const e = validateInquiry({ interest, name, email, message, consent });
    if (Object.keys(e).length) {
      focusFirst(e);
      return;
    }
    const fd = new FormData(ev.currentTarget);
    fd.set(FIELDS.startedAt, String(startedAt.current));
    startTransition(async () => {
      try {
        const res = await submitInquiry(fd);
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
    setName("");
    setEmail("");
    setMessage("");
    setConsent(false);
    setInterest(interests[0].value);
    setSubmitted(false);
    setServerErrors({});
    setFailure(null);
    setSent(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5 border-2 border-ink bg-paper p-6 md:p-10" role="status">
        {/* Success is not an AI-division meaning: ink label + brand red dot. */}
        <p className="label ko-tight flex items-center gap-2 text-ink">
          <i className="size-2.5 rounded-full bg-red" aria-hidden />
          {t.success.eyebrow}
        </p>
        <h3 ref={successRef} tabIndex={-1} className="text-h3 text-balance outline-none">
          {t.success.title}
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
          <input type="text" name={FIELDS.honeypot} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <fieldset>
        <legend className="mb-3 text-body-sm font-bold">{t.interestLegend}</legend>
        {/* Stacked on phones so no chip is left alone on a second line; wraps from sm. */}
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          {interests.map((i) => {
            const on = interest === i.value;
            return (
              <label
                key={i.value}
                className={cx(
                  "flex min-h-11 cursor-pointer items-center gap-2 border-2 border-ink px-4 py-2 text-body-sm font-bold leading-snug transition-colors duration-150 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-red",
                  on ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-concrete",
                )}
              >
                <input
                  type="radio"
                  name={FIELDS.interest}
                  value={i.value}
                  checked={on}
                  onChange={() => setInterest(i.value)}
                  className="sr-only"
                />
                <i
                  className={cx(
                    "size-2.5 rounded-full transition-[background-color,box-shadow] duration-150",
                    on ? dotBg[i.value] : "bg-transparent ring-[1.5px] ring-current ring-inset",
                  )}
                  aria-hidden
                />
                {i.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-name`} className="mb-2 block text-body-sm font-bold">
          {t.nameLabel}
        </label>
        <input
          ref={nameRef}
          id={`${uid}-name`}
          type="text"
          name={FIELDS.name}
          autoComplete="organization"
          maxLength={LIMITS.name}
          placeholder={t.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          className={cx(inputBase, "h-14", errors.name ? "border-red" : "border-ink")}
        />
        {errors.name && (
          <p id={`${uid}-name-error`} className="mt-2 text-body-sm text-red-text">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-email`} className="mb-2 block text-body-sm font-bold">
          {t.emailLabel}
        </label>
        <input
          ref={emailRef}
          id={`${uid}-email`}
          type="email"
          name={FIELDS.email}
          required
          autoComplete="email"
          inputMode="email"
          maxLength={LIMITS.email}
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
        <label htmlFor={`${uid}-message`} className="mb-2 block text-body-sm font-bold">
          {t.messageLabel}
        </label>
        <textarea
          ref={messageRef}
          id={`${uid}-message`}
          name={FIELDS.message}
          required
          autoComplete="off"
          rows={5}
          placeholder={t.messagePlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${uid}-message-error` : undefined}
          className={cx(inputBase, "min-h-32 resize-y py-4", errors.message ? "border-red" : "border-ink")}
        />
        {errors.message && (
          <p id={`${uid}-message-error`} className="mt-2 text-body-sm text-red-text">
            {errors.message}
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
              name={FIELDS.consent}
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
