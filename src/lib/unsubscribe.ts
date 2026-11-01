/**
 * 이메일 수신거부 rules, shared by the browser (live errors) and the Server Action (source of truth).
 * Keep this file free of server-only imports; the DB lookup `isOptedOut` lives in `unsubscribe-server.ts`.
 * Table: public.email_optouts (server-only, admin key; emails stored lowercased).
 */

import { site } from "@/lib/content";
import { UNSUBSCRIBE_PATH } from "@/components/experiments/paths";

export const UNSUBSCRIBE_LIMITS = { email: 254 } as const;

/** Form field names. `website` is a honeypot (hidden from people, filled by bots). */
export const UNSUBSCRIBE_FIELDS = {
  email: "email",
  cancelLaunch: "cancelLaunch",
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
 * Absolute unsubscribe link with the address prefilled. Put it in the body of every bulk / launch mail
 * (InsForge also adds its own List-Unsubscribe header; this link covers our own opt-out list).
 */
export const unsubscribeUrl = (email: string) => `${site.url}${UNSUBSCRIBE_PATH}?email=${encodeURIComponent(email)}`;

/**
 * What the Server Action returns. Always `ok: true` for a valid address, whether or not it was known,
 * so the page never reveals which addresses exist.
 */
export type UnsubscribeResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; fieldErrors: UnsubscribeFieldErrors }
  | { ok: false; reason: "rateLimited" | "server" };
