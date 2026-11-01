"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { LAUNCH_FIELDS, LAUNCH_LIMITS, LAUNCH_PRODUCT, validateLaunchSignup, type LaunchSignupResult } from "@/lib/launch-signup";
import { site } from "@/lib/content";

/** Per-visitor limit: at most this many signups per window. */
const PER_IP = { max: 3, windowMin: 10 };
/** Site-wide limit, keeps bots from exhausting the project's hourly email quota. */
const GLOBAL = { max: 60, windowMin: 60 };
/** Humans need at least this long to fill the form. */
const MIN_FILL_MS = 3000;

const TABLE = "launch_signups";

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/** Postgres unique violation, as passed through by InsForge's PostgREST endpoint. */
function isUniqueViolation(error: unknown, status?: number) {
  if (status === 409) return true;
  if (!error || typeof error !== "object") return false;
  const { code, message } = error as { code?: unknown; message?: unknown };
  return code === "23505" || (typeof message === "string" && /duplicate key|23505/i.test(message));
}

/**
 * Praise Tool launch-notification signup: validate → spam checks → rate limit → store in `launch_signups`
 * → email the team. Storing is what counts; a failed notification email never fails the signup.
 * A repeat signup (same email) returns `already: true` and sends nothing. No email goes to the visitor.
 */
export async function signupLaunch(formData: FormData): Promise<LaunchSignupResult> {
  const input = {
    email: str(formData, LAUNCH_FIELDS.email).trim(),
    org: str(formData, LAUNCH_FIELDS.org).trim(),
    consent: str(formData, LAUNCH_FIELDS.consent) === "on",
  };

  const fieldErrors = validateLaunchSignup(input);
  if (Object.keys(fieldErrors).length) return { ok: false, reason: "invalid", fieldErrors };
  // Case-insensitive duplicates: store the address lowercased so unique(product, email) catches them.
  const email = input.email.toLowerCase();
  const org = input.org.slice(0, LAUNCH_LIMITS.org) || null;

  // Bots: honeypot filled or submitted impossibly fast → pretend success, store nothing.
  const startedAt = Number(str(formData, LAUNCH_FIELDS.startedAt));
  if (str(formData, LAUNCH_FIELDS.honeypot) || !startedAt || Date.now() - startedAt < MIN_FILL_MS) return { ok: true };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.INQUIRY_IP_SALT ?? ""}:${ip}`).digest("hex");

  let db;
  try {
    db = getInsforgeAdmin();
  } catch (e) {
    console.error("[launch] InsForge not configured", e);
    return { ok: false, reason: "server" };
  }

  const [perIp, global] = await Promise.all([
    db.database.from(TABLE).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", minutesAgo(PER_IP.windowMin)),
    db.database.from(TABLE).select("id", { count: "exact", head: true }).gte("created_at", minutesAgo(GLOBAL.windowMin)),
  ]);
  if (perIp.error || global.error) {
    console.error("[launch] rate-limit query failed", perIp.error ?? global.error);
    return { ok: false, reason: "server" };
  }
  if ((perIp.count ?? 0) >= PER_IP.max || (global.count ?? 0) >= GLOBAL.max) return { ok: false, reason: "rateLimited" };

  const { data: rows, error: insertError, status } = await db.database
    .from(TABLE)
    .insert([{ product: LAUNCH_PRODUCT, email, org, consent_at: new Date().toISOString(), ip_hash: ipHash }])
    .select("id");
  if (insertError && isUniqueViolation(insertError, status)) return { ok: true, already: true };
  if (insertError || !rows?.[0]) {
    console.error("[launch] insert failed", insertError);
    return { ok: false, reason: "server" };
  }
  const id: string = rows[0].id;

  try {
    const { error: mailError } = await db.emails.send({
      to: process.env.CONTACT_NOTIFY_EMAIL || site.email,
      replyTo: email,
      from: "Lab98 웹사이트",
      subject: `[Praise Tool] 출시 알림 신청 · ${org || email}`.slice(0, 200),
      html: `
      <div style="font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;font-size:15px;line-height:1.7;color:#111">
        <p style="margin:0 0 16px;font-weight:700">Praise Tool 출시 알림 신청이 들어왔어요.</p>
        <table style="border-collapse:collapse;margin:0 0 16px">
          <tr><td style="padding:2px 16px 2px 0;color:#5e5e5a">이메일</td><td>${esc(email)}</td></tr>
          <tr><td style="padding:2px 16px 2px 0;color:#5e5e5a">교회·단체명</td><td>${esc(org || "-")}</td></tr>
        </table>
        <p style="margin:16px 0 0;color:#5e5e5a;font-size:13px">출시 안내를 보낸 뒤에는 개인정보처리방침에 따라 지체 없이 삭제해 주세요. · 신청 ID ${id}</p>
      </div>`,
    });
    if (mailError) console.error("[launch] notification email failed", mailError);
  } catch (e) {
    console.error("[launch] notification email failed", e);
  }
  return { ok: true };
}
