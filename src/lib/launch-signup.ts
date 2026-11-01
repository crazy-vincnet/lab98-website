/**
 * Praise Tool launch-notification signup rules, shared by the browser (live errors) and the
 * Server Action (source of truth). Keep this file free of server-only imports.
 * Table: public.launch_signups (server-only, admin key).
 */

export const LAUNCH_PRODUCT = "praise-tool" as const;

export const LAUNCH_LIMITS = { email: 254, org: 100 } as const;

/** Form field names. `website` is a honeypot (hidden from people, filled by bots). */
export const LAUNCH_FIELDS = {
  email: "email",
  org: "org",
  consent: "consent",
  startedAt: "startedAt",
  honeypot: "website",
} as const;

export type LaunchFieldError = "emailRequired" | "emailInvalid" | "orgTooLong" | "consentRequired";
export type LaunchFieldErrors = Partial<Record<"email" | "org" | "consent", LaunchFieldError>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LaunchSignupInput = { email: string; org: string; consent: boolean };

export function validateLaunchSignup(v: LaunchSignupInput): LaunchFieldErrors {
  const e: LaunchFieldErrors = {};
  const email = v.email.trim();
  if (!email) e.email = "emailRequired";
  else if (email.length < 3 || email.length > LAUNCH_LIMITS.email || !EMAIL_RE.test(email)) e.email = "emailInvalid";
  if (v.org.trim().length > LAUNCH_LIMITS.org) e.org = "orgTooLong";
  if (!v.consent) e.consent = "consentRequired";
  return e;
}

/** What the Server Action returns to the form. `already` = this email was signed up before. Never includes stored data. */
export type LaunchSignupResult =
  | { ok: true; already?: boolean }
  | { ok: false; reason: "invalid"; fieldErrors: LaunchFieldErrors }
  | { ok: false; reason: "rateLimited" | "server" };
