import "server-only";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { normalizeEmail } from "@/lib/unsubscribe";

/**
 * True when the address is on the opt-out list (public.email_optouts, filled by /unsubscribe).
 *
 * RULE for any bulk or launch-notice mail (e.g. the Praise Tool launch email to launch_signups):
 *   1. skip every recipient for which `isOptedOut(email)` is true (or use `filterOptedOut` for a batch), and
 *   2. include an unsubscribe link in the body: `unsubscribeUrl(email)` from `@/lib/unsubscribe-token`
 *      → `${site.url}/unsubscribe?email=…&t=<signed token>` (one token per recipient; never reuse another address's link).
 * Transactional replies to someone's own inquiry / privacy request are not affected.
 *
 * Throws if the lookup fails, so a sender fails closed instead of mailing someone who opted out.
 */
export async function isOptedOut(email: string): Promise<boolean> {
  const { data, error } = await getInsforgeAdmin().database.from("email_optouts").select("email").eq("email", normalizeEmail(email)).limit(1);
  if (error) throw new Error(`email_optouts lookup failed: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/** Batch variant for bulk sends: returns only the addresses that have NOT opted out (lowercased). */
export async function filterOptedOut(emails: string[]): Promise<string[]> {
  const list = [...new Set(emails.map(normalizeEmail))];
  if (!list.length) return [];
  const { data, error } = await getInsforgeAdmin().database.from("email_optouts").select("email").in("email", list);
  if (error) throw new Error(`email_optouts lookup failed: ${error.message}`);
  const out = new Set((data ?? []).map((r: { email: string }) => r.email));
  return list.filter((e) => !out.has(e));
}
