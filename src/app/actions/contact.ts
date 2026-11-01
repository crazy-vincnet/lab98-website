"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { FIELDS, LIMITS, isInterest, validateInquiry, type SubmitResult } from "@/lib/inquiry";
import { site } from "@/lib/content";

/** Per-visitor limit: at most this many inquiries per window. */
const PER_IP = { max: 3, windowMin: 10 };
/** Site-wide limit, keeps bots from exhausting the project's hourly email quota. */
const GLOBAL = { max: 30, windowMin: 60 };
/** Humans need at least this long to fill the form. */
const MIN_FILL_MS = 3000;

const interestLabel: Record<string, string> = {
  master: "아직 정하지 않았어요",
  dev: "Dev · 웹·프로그램 제작",
  ai: "AI · 교육 문의",
  faith: "Faith · 교회·선교단체 프로그램",
};

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/**
 * Contact form submission: validate → spam checks → rate limit → store in `inquiries` → email the team.
 * Storing is what counts; if only the notification email fails, the visitor still sees success
 * and the row keeps `notified = false` so it can be found in the InsForge dashboard.
 */
export async function submitInquiry(formData: FormData): Promise<SubmitResult> {
  const input = {
    interest: str(formData, FIELDS.interest),
    name: str(formData, FIELDS.name).trim(),
    email: str(formData, FIELDS.email).trim(),
    message: str(formData, FIELDS.message).trim(),
    consent: str(formData, FIELDS.consent) === "on",
  };

  const fieldErrors = validateInquiry(input);
  if (Object.keys(fieldErrors).length) return { ok: false, reason: "invalid", fieldErrors };
  const interest = isInterest(input.interest) ? input.interest : "master";

  // Bots: honeypot filled or submitted impossibly fast → pretend success, store nothing.
  const startedAt = Number(str(formData, FIELDS.startedAt));
  if (str(formData, FIELDS.honeypot) || !startedAt || Date.now() - startedAt < MIN_FILL_MS) return { ok: true };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.INQUIRY_IP_SALT ?? ""}:${ip}`).digest("hex");

  let db;
  try {
    db = getInsforgeAdmin();
  } catch (e) {
    console.error("[contact] InsForge not configured", e);
    return { ok: false, reason: "server" };
  }

  const [perIp, global] = await Promise.all([
    db.database.from("inquiries").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", minutesAgo(PER_IP.windowMin)),
    db.database.from("inquiries").select("id", { count: "exact", head: true }).gte("created_at", minutesAgo(GLOBAL.windowMin)),
  ]);
  if (perIp.error || global.error) {
    console.error("[contact] rate-limit query failed", perIp.error ?? global.error);
    return { ok: false, reason: "server" };
  }
  if ((perIp.count ?? 0) >= PER_IP.max || (global.count ?? 0) >= GLOBAL.max) return { ok: false, reason: "rateLimited" };

  const { data: rows, error: insertError } = await db.database
    .from("inquiries")
    .insert([
      {
        interest,
        name: input.name.slice(0, LIMITS.name) || null,
        email: input.email.slice(0, LIMITS.email),
        message: input.message.slice(0, LIMITS.message),
        consent_at: new Date().toISOString(),
        // Salted hash only — used for per-visitor rate limiting, never shown or emailed.
        ip_hash: ipHash,
      },
    ])
    .select("id");
  if (insertError || !rows?.[0]) {
    console.error("[contact] insert failed", insertError);
    return { ok: false, reason: "server" };
  }
  const id: string = rows[0].id;

  const to = process.env.CONTACT_NOTIFY_EMAIL || site.email;
  const label = interestLabel[interest];
  const { error: mailError } = await db.emails.send({
    to,
    replyTo: input.email,
    from: "Lab98 웹사이트",
    subject: `[Lab98 문의] ${label} · ${input.name || input.email}`.slice(0, 200),
    html: `
      <div style="font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;font-size:15px;line-height:1.7;color:#111">
        <p style="margin:0 0 16px;font-weight:700">새 프로젝트 문의가 들어왔어요.</p>
        <table style="border-collapse:collapse;margin:0 0 16px">
          <tr><td style="padding:2px 16px 2px 0;color:#5e5e5a">문의 분야</td><td>${esc(label)}</td></tr>
          <tr><td style="padding:2px 16px 2px 0;color:#5e5e5a">이름/회사</td><td>${esc(input.name || "-")}</td></tr>
          <tr><td style="padding:2px 16px 2px 0;color:#5e5e5a">이메일</td><td>${esc(input.email)}</td></tr>
        </table>
        <div style="border:2px solid #111;padding:16px;white-space:pre-wrap">${esc(input.message)}</div>
        <p style="margin:16px 0 0;color:#5e5e5a;font-size:13px">이 메일에 답장하면 문의자에게 바로 전달돼요. · 문의 ID ${id}</p>
      </div>`,
  });

  if (mailError) {
    console.error("[contact] notification email failed", mailError);
  } else {
    await db.database.from("inquiries").update({ notified: true }).eq("id", id);
  }
  return { ok: true };
}
