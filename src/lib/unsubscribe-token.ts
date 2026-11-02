import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "@/lib/content";
import { UNSUBSCRIBE_PATH } from "@/components/experiments/paths";
import { normalizeEmail } from "@/lib/unsubscribe";

/**
 * Signed unsubscribe links. token = base64url(HMAC-SHA256(UNSUBSCRIBE_SECRET, "unsub:v1:" + normalizedEmail)).
 * A token proves the link came from a mail we sent to that exact address; it authorises opting out THAT address only.
 * Tokens never expire (opting out must always stay possible). Server only: the secret never reaches the browser.
 */

const MIN_SECRET_LEN = 16;

function secret(): string {
  const s = process.env.UNSUBSCRIBE_SECRET;
  if (s && s.length >= MIN_SECRET_LEN) return s;
  // Fail closed in production: no secret means no link can be signed or trusted.
  if (process.env.NODE_ENV === "production") throw new Error("UNSUBSCRIBE_SECRET is not set (see .env.example)");
  return "dev-only-unsubscribe-secret-not-for-production";
}

const sign = (label: string, email: string) => createHmac("sha256", secret()).update(`${label}${normalizeEmail(email)}`).digest();

/** base64url token for an address (case and surrounding whitespace do not matter). */
export const unsubscribeToken = (email: string) => sign("unsub:v1:", email).toString("base64url");

/** Constant-time check that `token` belongs to `email`. Never throws on bad input; false when the secret is missing in production. */
export function verifyUnsubscribeToken(email: string, token: string | null | undefined): boolean {
  if (!token || token.length > 128) return false;
  try {
    const expected = Buffer.from(unsubscribeToken(email));
    const given = Buffer.from(token);
    return given.length === expected.length && timingSafeEqual(given, expected);
  } catch {
    return false;
  }
}

/** Hex digest used as the cooldown key in `unsubscribe_confirmations` (keyed hash, so no raw address is stored). */
export const confirmationKey = (email: string) => sign("unsub-cooldown:v1:", email).toString("hex");

/**
 * Absolute unsubscribe link for one recipient: `${site.url}/unsubscribe?email=…&t=<token>`.
 * Use it in every bulk / launch mail, one token per recipient. `locale: "en"` points at the English page.
 */
export const unsubscribeUrl = (email: string, locale: "ko" | "en" = "ko") =>
  `${site.url}${locale === "en" ? "/en" : ""}${UNSUBSCRIBE_PATH}?email=${encodeURIComponent(normalizeEmail(email))}&t=${unsubscribeToken(email)}`;
