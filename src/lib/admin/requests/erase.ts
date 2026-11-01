import "server-only";
import { createHash } from "node:crypto";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { ilikeExact, normEmail } from "./pure";

export type EmailData = {
  inquiries: number;
  replies: number;
  launchSignups: number;
  requestsOpen: number;
  requestsResolved: number;
  optouts: number;
};

/** Short non-reversible id for audit logs, so the address itself never lands in audit_log. */
export const emailRef = (email: string) => createHash("sha256").update(normEmail(email)).digest("hex").slice(0, 12);

async function n(q: PromiseLike<{ count: number | null; error: { message: string } | null }>, what: string): Promise<number> {
  const { count, error } = await q;
  if (error) throw new Error(`${what}: ${error.message}`);
  return count ?? 0;
}

/** What is stored for this address (case-insensitive). Throws on any lookup error so nothing is decided on partial data. */
export async function inspectEmail(emailRaw: string): Promise<EmailData> {
  const email = normEmail(emailRaw);
  const pat = ilikeExact(email);
  const db = getInsforgeAdmin().database;
  const head = { count: "exact" as const, head: true as const };
  const [inquiries, replies, launchSignups, requestsOpen, requestsResolved, optouts] = await Promise.all([
    n(db.from("inquiries").select("id", head).ilike("email", pat), "inquiries"),
    n(db.from("inquiry_replies").select("id", head).ilike("to_email", pat), "inquiry_replies"),
    n(db.from("launch_signups").select("id", head).ilike("email", pat), "launch_signups"),
    n(db.from("privacy_requests").select("id", head).ilike("email", pat).in("status", ["new", "verifying"]), "privacy_requests"),
    n(db.from("privacy_requests").select("id", head).ilike("email", pat).in("status", ["done", "rejected"]), "privacy_requests"),
    n(db.from("email_optouts").select("email", head).eq("email", email), "email_optouts"),
  ]);
  return { inquiries, replies, launchSignups, requestsOpen, requestsResolved, optouts };
}
