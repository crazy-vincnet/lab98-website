"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button, cx } from "@/components/ui";
import type { Division } from "@/lib/content";
import { contactCopy } from "./copy";

const t = contactCopy.form;

type Interest = { value: Division; label: string };
type Errors = { email?: string; message?: string };

const dotBg: Record<Division, string> = { master: "bg-red", web: "bg-web", ai: "bg-ai", faith: "bg-faith" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, message: string): Errors {
  const e: Errors = {};
  if (!email.trim()) e.email = t.errors.emailRequired;
  else if (!EMAIL_RE.test(email.trim())) e.email = t.errors.emailInvalid;
  if (!message.trim()) e.message = t.errors.messageRequired;
  else if (message.trim().length > t.messageMax) e.message = t.errors.messageTooLong;
  return e;
}

const inputBase =
  "block w-full border-2 bg-paper px-[18px] text-body-sm text-ink placeholder:text-placeholder transition-colors duration-150 hover:bg-concrete/40 focus:bg-paper";

/**
 * Contact form. No backend yet: submitting opens the visitor's mail app with a
 * prefilled message to `to`, then shows a success state.
 */
export function ContactForm({ to, interests }: { to: string; interests: Interest[] }) {
  const uid = useId();
  const [interest, setInterest] = useState<Division>(interests[0].value);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false); // a submit was attempted → show live errors
  const [sent, setSent] = useState(false);
  const successRef = useRef<HTMLHeadingElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const errors = submitted ? validate(email, message) : {};

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSubmitted(true);
    const e = validate(email, message);
    if (e.email || e.message) {
      (e.email ? emailRef : messageRef).current?.focus();
      return;
    }

    const label = interests.find((i) => i.value === interest)?.label ?? "";
    const subject = t.mail.subject(label, email.trim());
    const body = t.mail.body(label, name.trim(), email.trim(), message.trim());
    // TODO(backend): replace mailto with an API route / form service
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  function reset() {
    setName("");
    setEmail("");
    setMessage("");
    setInterest(interests[0].value);
    setSubmitted(false);
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
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6 border-2 border-ink bg-paper p-6 md:p-10" aria-label={t.ariaLabel}>
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
                  name="interest"
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
          id={`${uid}-name`}
          type="text"
          name="name"
          autoComplete="organization"
          placeholder={t.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cx(inputBase, "h-14 border-ink")}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-email`} className="mb-2 block text-body-sm font-bold">
          {t.emailLabel}
        </label>
        <input
          ref={emailRef}
          id={`${uid}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
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
          name="message"
          required
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

      <Button type="submit" className="mt-1 w-full">
        {t.submit} <span aria-hidden>→</span>
      </Button>
      <p className="-mt-2 text-center text-body-sm text-gray text-pretty">
        <span className="block">{t.submitHint}</span>
        <span className="block">{t.privacy}</span>
      </p>
    </form>
  );
}
