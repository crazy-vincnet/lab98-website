/**
 * 개인정보 열람·정정·삭제·처리정지·동의 철회 요청 rules, shared by the browser (live errors) and the
 * Server Action (source of truth). Keep this file free of server-only imports.
 * Table: public.privacy_requests (server-only, admin key).
 *
 * The web form never changes or deletes data by itself: the address is unverified. The requester gets a
 * confirmation email and the team acts only after they reply from that address (then sets status/resolved_at).
 */

export const REQUEST_TYPES = ["access", "correct", "delete", "suspend", "withdraw"] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  access: "열람",
  correct: "정정",
  delete: "삭제",
  suspend: "처리정지",
  withdraw: "동의 철회",
};

export const PRIVACY_REQUEST_LIMITS = { email: 254, details: 2000 } as const;

/** Days within which a request is handled (개인정보 보호법 시행령: 10일 이내). */
export const PRIVACY_REQUEST_DAYS = 10;

/** Form field names. `website` is a honeypot (hidden from people, filled by bots). */
export const PRIVACY_REQUEST_FIELDS = {
  email: "email",
  type: "requestType",
  details: "details",
  consent: "consent",
  startedAt: "startedAt",
  honeypot: "website",
} as const;

export type PrivacyRequestFieldError =
  | "emailRequired"
  | "emailInvalid"
  | "typeRequired"
  | "detailsRequired"
  | "detailsTooLong"
  | "consentRequired";
export type PrivacyRequestFieldErrors = Partial<Record<"email" | "type" | "details" | "consent", PrivacyRequestFieldError>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PrivacyRequestInput = { email: string; type: string; details: string; consent: boolean };

export function isRequestType(v: string): v is RequestType {
  return (REQUEST_TYPES as readonly string[]).includes(v);
}

export function validatePrivacyRequest(v: PrivacyRequestInput): PrivacyRequestFieldErrors {
  const e: PrivacyRequestFieldErrors = {};
  const email = v.email.trim();
  const details = v.details.trim();
  if (!email) e.email = "emailRequired";
  else if (email.length < 3 || email.length > PRIVACY_REQUEST_LIMITS.email || !EMAIL_RE.test(email)) e.email = "emailInvalid";
  if (!isRequestType(v.type)) e.type = "typeRequired";
  if (details.length > PRIVACY_REQUEST_LIMITS.details) e.details = "detailsTooLong";
  else if (v.type === "correct" && !details) e.details = "detailsRequired";
  if (!v.consent) e.consent = "consentRequired";
  return e;
}

/** What the Server Action returns to the form. Never includes stored data. */
export type PrivacyRequestResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; fieldErrors: PrivacyRequestFieldErrors }
  | { ok: false; reason: "rateLimited" | "server" };
