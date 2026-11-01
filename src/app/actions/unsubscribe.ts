"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { LAUNCH_PRODUCT } from "@/lib/launch-signup";
import { UNSUBSCRIBE_FIELDS, normalizeEmail, validateUnsubscribe, type UnsubscribeResult } from "@/lib/unsubscribe";

/** Humans need at least this long to fill the form (shorter than the others: it is one prefilled field). */
const MIN_FILL_MS = 1500;
/** Per-visitor limit, counted in a short-lived in-process window (no IP is stored for opt-outs). */
const PER_IP = { max: 5, windowMin: 10 };
/** Site-wide limit: new opt-out rows per window, counted in the table itself. */
const GLOBAL = { max: 100, windowMin: 60 };

const TABLE = "email_optouts";

/**
 * Opt-outs store no IP hash (the list is kept indefinitely, so it holds only the address), so the per-IP
 * limit uses a small in-memory window. Per server instance only; the global limit below is DB-backed.
 */
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMin: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMin * 60_000);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};

/**
 * 이메일 수신거부: validate → spam checks → rate limit → upsert into `email_optouts` (lowercased)
 * → optionally delete matching `launch_signups`. Returns success whether or not the address was known,
 * so the page never reveals which addresses exist. No email is sent (they just asked us to stop).
 */
export async function unsubscribeEmail(formData: FormData): Promise<UnsubscribeResult> {
  const raw = str(formData, UNSUBSCRIBE_FIELDS.email);
  const fieldErrors = validateUnsubscribe({ email: raw });
  if (Object.keys(fieldErrors).length) return { ok: false, reason: "invalid", fieldErrors };
  const email = normalizeEmail(raw);
  const cancelLaunch = str(formData, UNSUBSCRIBE_FIELDS.cancelLaunch) === "on";

  // Bots: honeypot filled or submitted impossibly fast → pretend success, store nothing.
  const startedAt = Number(str(formData, UNSUBSCRIBE_FIELDS.startedAt));
  if (str(formData, UNSUBSCRIBE_FIELDS.honeypot) || !startedAt || Date.now() - startedAt < MIN_FILL_MS) return { ok: true };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.INQUIRY_IP_SALT ?? ""}:${ip}`).digest("hex");
  if (limited(ipHash, PER_IP.max, PER_IP.windowMin)) return { ok: false, reason: "rateLimited" };

  let db;
  try {
    db = getInsforgeAdmin();
  } catch (e) {
    console.error("[unsubscribe] InsForge not configured", e);
    return { ok: false, reason: "server" };
  }

  const global = await db.database
    .from(TABLE)
    .select("email", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - GLOBAL.windowMin * 60_000).toISOString());
  if (global.error) {
    console.error("[unsubscribe] rate-limit query failed", global.error);
    return { ok: false, reason: "server" };
  }
  if ((global.count ?? 0) >= GLOBAL.max) return { ok: false, reason: "rateLimited" };

  const { error: upsertError } = await db.database
    .from(TABLE)
    .upsert([{ email, source: "web" }], { onConflict: "email", ignoreDuplicates: true });
  if (upsertError) {
    console.error("[unsubscribe] upsert failed", upsertError);
    return { ok: false, reason: "server" };
  }

  if (cancelLaunch) {
    const { error: deleteError } = await db.database.from("launch_signups").delete().eq("product", LAUNCH_PRODUCT).eq("email", email);
    if (deleteError) {
      console.error("[unsubscribe] launch_signups delete failed", deleteError);
      return { ok: false, reason: "server" };
    }
  }
  return { ok: true };
}
