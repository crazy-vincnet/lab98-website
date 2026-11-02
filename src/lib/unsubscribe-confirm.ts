import "server-only";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { LAUNCH_PRODUCT } from "@/lib/launch-signup";
import { normalizeEmail } from "@/lib/unsubscribe";
import { confirmationKey, unsubscribeUrl } from "@/lib/unsubscribe-token";
import { sendMail, type SendResult } from "@/lib/admin/requests/mail";
import { SUPPORT_EMAIL, unsubscribeConfirmMail } from "@/lib/admin/requests/pure";

/** One confirmation mail per address per hour; site-wide cap per hour so InsForge's hourly mail quota can't be drained. */
export const CONFIRM_LIMITS = { cooldownMin: 60, globalMax: 20, globalWindowMin: 60 } as const;

const TABLE = "unsubscribe_confirmations";
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

/**
 * Outcome of a tokenless unsubscribe request. The UI must answer `sent`, `skipped` and `failed` identically
 * (it must not reveal whether the address is known); only `paused` (site-wide, same for every address) differs.
 *  - paused:  global cap reached (checked before the address is looked up, so it says nothing about the address)
 *  - skipped: unknown address, or still in its 1-hour cooldown
 *  - sent:    known address, mail accepted
 *  - failed:  known address, mail refused (cooldown released; logged)
 * Known = a row in launch_signups (signed up, or already mailed: notified_at set). Throws on DB errors.
 */
export type ConfirmOutcome = "paused" | "skipped" | "sent" | "failed";

/** True when the site-wide hourly cap is used up. Cheap and independent of the address, so the action can answer it synchronously. */
export async function confirmationsPaused(): Promise<boolean> {
  const recent = await getInsforgeAdmin()
    .database.from(TABLE)
    .select("email_hash", { count: "exact", head: true })
    .gte("last_sent_at", iso(CONFIRM_LIMITS.globalWindowMin * 60_000));
  if (recent.error) throw new Error(`confirmation cap lookup failed: ${recent.error.message}`);
  return (recent.count ?? 0) >= CONFIRM_LIMITS.globalMax;
}

export async function requestUnsubscribeConfirmation(
  rawEmail: string,
  lang: "ko" | "en" = "ko",
  send: (o: Parameters<typeof sendMail>[0]) => Promise<SendResult> = sendMail,
): Promise<ConfirmOutcome> {
  const email = normalizeEmail(rawEmail);
  const db = getInsforgeAdmin().database;

  if (await confirmationsPaused()) return "paused";

  const known = await db.from("launch_signups").select("id").eq("product", LAUNCH_PRODUCT).eq("email", email).limit(1);
  if (known.error) throw new Error(`launch_signups lookup failed: ${known.error.message}`);
  if (!known.data?.length) return "skipped";

  // Claim the cooldown slot atomically: refresh an expired row, else insert; a unique violation means "still cooling down".
  const key = confirmationKey(email);
  const cutoff = iso(CONFIRM_LIMITS.cooldownMin * 60_000);
  const now = new Date().toISOString();
  const refreshed = await db.from(TABLE).update({ last_sent_at: now }).eq("email_hash", key).lt("last_sent_at", cutoff).select("email_hash");
  if (refreshed.error) throw new Error(`cooldown update failed: ${refreshed.error.message}`);
  if (!refreshed.data?.length) {
    const inserted = await db.from(TABLE).insert([{ email_hash: key, last_sent_at: now }]);
    if (inserted.error) return "skipped"; // row exists and is fresh
    // Housekeeping: hashes older than a day serve no purpose.
    await db.from(TABLE).delete().lt("last_sent_at", iso(24 * 3_600_000));
  }

  const mail = unsubscribeConfirmMail(lang, unsubscribeUrl(email, lang));
  const res = await send({ to: email, subject: mail.subject, html: mail.html, replyTo: SUPPORT_EMAIL, from: "Lab98" });
  if (!res.ok) {
    await db.from(TABLE).delete().eq("email_hash", key);
    console.error("[unsubscribe] confirmation mail failed:", res.error);
    return "failed";
  }
  return "sent";
}
