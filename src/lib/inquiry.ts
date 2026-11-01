/**
 * Contact-form rules shared by the browser (live errors) and the Server Action (source of truth).
 * Keep this file free of server-only imports.
 */

export const INTERESTS = ["master", "web", "ai", "faith"] as const;
export type Interest = (typeof INTERESTS)[number];

export const LIMITS = { name: 100, email: 254, message: 2000 } as const;

/** Form field names. `website` is a honeypot (hidden from people, filled by bots). */
export const FIELDS = {
  interest: "interest",
  name: "name",
  email: "email",
  message: "message",
  consent: "consent",
  startedAt: "startedAt",
  honeypot: "website",
} as const;

export type FieldError = "emailRequired" | "emailInvalid" | "messageRequired" | "messageTooLong" | "nameTooLong" | "consentRequired";
export type FieldErrors = Partial<Record<"name" | "email" | "message" | "consent", FieldError>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InquiryInput = { interest: string; name: string; email: string; message: string; consent: boolean };

export function validateInquiry(v: InquiryInput): FieldErrors {
  const e: FieldErrors = {};
  const email = v.email.trim();
  const message = v.message.trim();
  if (v.name.trim().length > LIMITS.name) e.name = "nameTooLong";
  if (!email) e.email = "emailRequired";
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) e.email = "emailInvalid";
  if (!message) e.message = "messageRequired";
  else if (message.length > LIMITS.message) e.message = "messageTooLong";
  if (!v.consent) e.consent = "consentRequired";
  return e;
}

export function isInterest(v: string): v is Interest {
  return (INTERESTS as readonly string[]).includes(v);
}

/** What the Server Action returns to the form. Never includes stored data. */
export type SubmitResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; fieldErrors: FieldErrors }
  | { ok: false; reason: "rateLimited" | "server" };
