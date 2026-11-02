/**
 * 이메일 수신거부 rules, shared by the browser (live errors) and the Server Action (source of truth).
 * Keep this file free of server-only imports; the DB lookup `isOptedOut` lives in `unsubscribe-server.ts`.
 * Table: public.email_optouts (server-only, admin key; emails stored lowercased).
 */

export const UNSUBSCRIBE_LIMITS = { email: 254 } as const;

/** Form field names. `website` is a honeypot (hidden from people, filled by bots). */
export const UNSUBSCRIBE_FIELDS = {
  email: "email",
  cancelLaunch: "cancelLaunch",
  /** Signed token from the link in our mail (hidden field). Without a valid one the action sends a confirmation mail instead. */
  token: "t",
  /** Page language, so the confirmation mail matches it. */
  locale: "locale",
  startedAt: "startedAt",
  honeypot: "website",
} as const;

export type UnsubscribeFieldError = "emailRequired" | "emailInvalid";
export type UnsubscribeFieldErrors = Partial<Record<"email", UnsubscribeFieldError>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUnsubscribe(v: { email: string }): UnsubscribeFieldErrors {
  const e: UnsubscribeFieldErrors = {};
  const email = v.email.trim();
  if (!email) e.email = "emailRequired";
  else if (email.length < 3 || email.length > UNSUBSCRIBE_LIMITS.email || !EMAIL_RE.test(email)) e.email = "emailInvalid";
  return e;
}

/** Canonical form stored in email_optouts and compared in `isOptedOut`. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * What the Server Action returns. `unsubscribed`: a valid signed link opted the address out. `confirmationSent`: no valid
 * token, so we (maybe) mailed a signed link; the answer is identical whether or not the address is known, so the page
 * never reveals which addresses exist. `mail`: confirmation mails are paused site-wide (same for every address).
 */
export type UnsubscribeResult =
  | { ok: true; kind: "unsubscribed" | "confirmationSent" }
  | { ok: false; reason: "invalid"; fieldErrors: UnsubscribeFieldErrors }
  | { ok: false; reason: "rateLimited" | "server" | "mail" };
