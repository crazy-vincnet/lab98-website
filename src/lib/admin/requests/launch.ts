import "server-only";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { LAUNCH_PRODUCT } from "@/lib/launch-signup";
import { normalizeEmail } from "@/lib/unsubscribe";
import { filterOptedOut } from "@/lib/unsubscribe-server";

export type Failure = { email: string; error: string; at: string };
export type Signup = { id: string; email: string };

/** Hard cap so one request never loads an unbounded list. The signup list is small (purged after launch). */
const MAX_PENDING = 5000;

/**
 * Who would get the launch mail right now: signups of the product with notified_at NULL, minus opted-out
 * addresses (checked fresh each time, fail-closed: throws if the opt-out lookup fails) and minus `exclude`
 * (addresses that already failed in this campaign).
 */
export async function getRecipients(exclude: string[] = []): Promise<{ eligible: Signup[]; pending: number; skippedOptout: number }> {
  const { data, error } = await getInsforgeAdmin()
    .database.from("launch_signups")
    .select("id,email")
    .eq("product", LAUNCH_PRODUCT)
    .is("notified_at", null)
    .order("created_at", { ascending: true })
    .limit(MAX_PENDING);
  if (error) throw new Error(`launch_signups lookup failed: ${error.message}`);
  const rows = (data ?? []) as Signup[];
  const allowed = new Set(await filterOptedOut(rows.map((r) => r.email)));
  const skip = new Set(exclude.map(normalizeEmail));
  const optedOutCount = rows.filter((r) => !allowed.has(normalizeEmail(r.email))).length;
  const eligible = rows.filter((r) => allowed.has(normalizeEmail(r.email)) && !skip.has(normalizeEmail(r.email)));
  return { eligible, pending: rows.length, skippedOptout: optedOutCount };
}
