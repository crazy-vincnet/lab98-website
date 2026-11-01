import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

type Kind = "login" | "setup" | "reset";

const WINDOW_MIN = 10;
const MAX_PER_IP_EMAIL = 5; // failed attempts per ip+email per window
const MAX_PER_IP = 20; // failed attempts per ip per window (any email)

const sha = (s: string) => createHash("sha256").update(`${process.env.INQUIRY_IP_SALT ?? ""}:${s}`).digest("hex");

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Fixed windowing: counts failures in the last 10 minutes. Fails closed on DB errors. */
export async function checkThrottle(kind: Kind, email: string) {
  const ipHash = sha(await clientIp());
  const emailHash = sha(email.trim().toLowerCase());
  const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString();
  try {
    const db = getInsforgeAdmin().database;
    const [a, b] = await Promise.all([
      db.from("login_attempts").select("id", { count: "exact", head: true }).eq("kind", kind).eq("success", false).eq("ip_hash", ipHash).eq("email_hash", emailHash).gte("created_at", since),
      db.from("login_attempts").select("id", { count: "exact", head: true }).eq("kind", kind).eq("success", false).eq("ip_hash", ipHash).gte("created_at", since),
    ]);
    if (a.error || b.error) return { blocked: true as const, ipHash, emailHash };
    return { blocked: (a.count ?? 0) >= MAX_PER_IP_EMAIL || (b.count ?? 0) >= MAX_PER_IP, ipHash, emailHash };
  } catch {
    return { blocked: true as const, ipHash, emailHash };
  }
}

/** Record one attempt. Also prunes rows older than a day. */
export async function recordAttempt(kind: Kind, t: { ipHash: string; emailHash: string }, success: boolean) {
  try {
    const db = getInsforgeAdmin().database;
    await db.from("login_attempts").insert([{ kind, ip_hash: t.ipHash, email_hash: t.emailHash, success }]);
    if (Math.random() < 0.05) {
      await db.from("login_attempts").delete().lt("created_at", new Date(Date.now() - 24 * 3600_000).toISOString());
    }
  } catch {
    /* throttle bookkeeping must not break sign-in */
  }
}

export const THROTTLE_MESSAGE = "시도가 너무 많아요. 10분 뒤에 다시 해 주세요.";
