"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import {
  PRIVACY_REQUEST_DAYS,
  PRIVACY_REQUEST_FIELDS,
  PRIVACY_REQUEST_LIMITS,
  REQUEST_TYPE_LABELS,
  isRequestType,
  validatePrivacyRequest,
  type PrivacyRequestResult,
  type RequestType,
} from "@/lib/privacy-request";
import { site } from "@/lib/content";

/** Per-visitor limit: at most this many requests per window. */
const PER_IP = { max: 3, windowMin: 10 };
/** Site-wide limit, keeps bots from exhausting the project's hourly email quota (2 mails per request). */
const GLOBAL = { max: 30, windowMin: 60 };
/** Humans need at least this long to fill the form. */
const MIN_FILL_MS = 3000;

const TABLE = "privacy_requests";

/** What the team does once the requester has replied from that address. */
const teamAction: Record<RequestType, string> = {
  access: "보관 중인 정보를 정리해 답장으로 보내 주세요.",
  correct: "요청 내용대로 정보를 고쳐 주세요.",
  delete: "해당 이메일의 문의·출시 알림 신청 기록을 삭제해 주세요.",
  suspend: "해당 이메일로의 처리(안내 메일 등)를 멈추고, 필요하면 수신거부 목록에 추가해 주세요.",
  withdraw: "동의를 철회한 항목(출시 알림 신청 등)을 삭제하고 수신거부 목록에 추가해 주세요.",
};

/** Requester-facing explanation of each request type. */
const requesterDesc: Record<RequestType, string> = {
  access: "Lab98이 보관 중인 회원님의 개인정보를 확인해 알려 드려요.",
  correct: "적어 주신 내용대로 잘못된 정보를 고쳐요.",
  delete: "보관 중인 회원님의 개인정보를 삭제해요.",
  suspend: "회원님의 개인정보 처리(안내 메일 발송 등)를 멈춰요.",
  withdraw: "출시 알림 신청 등 동의하신 항목을 철회하고 관련 정보를 삭제해요.",
};

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** LIKE pattern that matches the address literally (case-insensitive via ilike). */
const likeLiteral = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const wrap = (body: string) =>
  `<div style="font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;font-size:15px;line-height:1.7;color:#111">${body}</div>`;
const row = (k: string, v: string) => `<tr><td style="padding:2px 16px 2px 0;color:#5e5e5a">${esc(k)}</td><td>${esc(v)}</td></tr>`;

/**
 * 개인정보 요청: validate → spam checks → rate limit → store in `privacy_requests` → email the team
 * (with how many rows exist for that address) → email the requester asking them to reply to confirm.
 *
 * Nothing is changed or deleted here: the address is unverified. The team acts after the reply.
 * Storing is what counts; failed emails never fail the request (the row is in the dashboard as status 'new').
 */
export async function submitPrivacyRequest(formData: FormData): Promise<PrivacyRequestResult> {
  const input = {
    email: str(formData, PRIVACY_REQUEST_FIELDS.email).trim(),
    type: str(formData, PRIVACY_REQUEST_FIELDS.type),
    details: str(formData, PRIVACY_REQUEST_FIELDS.details).trim(),
    consent: str(formData, PRIVACY_REQUEST_FIELDS.consent) === "on",
  };

  const fieldErrors = validatePrivacyRequest(input);
  if (Object.keys(fieldErrors).length || !isRequestType(input.type)) return { ok: false, reason: "invalid", fieldErrors };
  const type = input.type;
  const email = input.email;
  const details = input.details.slice(0, PRIVACY_REQUEST_LIMITS.details) || null;

  // Bots: honeypot filled or submitted impossibly fast → pretend success, store nothing.
  const startedAt = Number(str(formData, PRIVACY_REQUEST_FIELDS.startedAt));
  if (str(formData, PRIVACY_REQUEST_FIELDS.honeypot) || !startedAt || Date.now() - startedAt < MIN_FILL_MS) return { ok: true };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.INQUIRY_IP_SALT ?? ""}:${ip}`).digest("hex");

  let db;
  try {
    db = getInsforgeAdmin();
  } catch (e) {
    console.error("[privacy-request] InsForge not configured", e);
    return { ok: false, reason: "server" };
  }

  const [perIp, global] = await Promise.all([
    db.database.from(TABLE).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", minutesAgo(PER_IP.windowMin)),
    db.database.from(TABLE).select("id", { count: "exact", head: true }).gte("created_at", minutesAgo(GLOBAL.windowMin)),
  ]);
  if (perIp.error || global.error) {
    console.error("[privacy-request] rate-limit query failed", perIp.error ?? global.error);
    return { ok: false, reason: "server" };
  }
  if ((perIp.count ?? 0) >= PER_IP.max || (global.count ?? 0) >= GLOBAL.max) return { ok: false, reason: "rateLimited" };

  const { data: rows, error: insertError } = await db.database
    .from(TABLE)
    .insert([{ email, request_type: type, details, ip_hash: ipHash }])
    .select("id");
  if (insertError || !rows?.[0]) {
    console.error("[privacy-request] insert failed", insertError);
    return { ok: false, reason: "server" };
  }
  const id: string = rows[0].id;
  const label = REQUEST_TYPE_LABELS[type];

  // What exists for this address (counts only, never contents), so the team knows what to act on.
  // inquiries keep the address as typed → case-insensitive literal match; the other tables are lowercased.
  const lower = email.toLowerCase();
  const [inq, launch, optout] = await Promise.all([
    db.database.from("inquiries").select("id", { count: "exact", head: true }).ilike("email", likeLiteral(email)),
    db.database.from("launch_signups").select("id", { count: "exact", head: true }).eq("email", lower),
    db.database.from("email_optouts").select("email", { count: "exact", head: true }).eq("email", lower),
  ]);
  const count = (r: { count: number | null; error: unknown }) => (r.error ? "확인 실패" : `${r.count ?? 0}건`);
  if (inq.error || launch.error || optout.error) console.error("[privacy-request] data summary failed", inq.error ?? launch.error ?? optout.error);

  try {
    const { error } = await db.emails.send({
      to: process.env.CONTACT_NOTIFY_EMAIL || site.email,
      replyTo: email,
      from: "Lab98 웹사이트",
      subject: `[개인정보 요청] ${label} · ${email}`.slice(0, 200),
      html: wrap(`
        <p style="margin:0 0 16px;font-weight:700">개인정보 ${esc(label)} 요청이 들어왔어요.</p>
        <table style="border-collapse:collapse;margin:0 0 16px">
          ${row("요청 유형", label)}
          ${row("이메일", email)}
          ${row("접수 시각", new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }))}
        </table>
        ${details ? `<div style="border:2px solid #111;padding:16px;white-space:pre-wrap;margin:0 0 16px">${esc(details)}</div>` : ""}
        <p style="margin:0 0 4px;font-weight:700">이 이메일로 보관 중인 정보</p>
        <table style="border-collapse:collapse;margin:0 0 16px">
          ${row("문의(inquiries)", count(inq))}
          ${row("출시 알림 신청(launch_signups)", count(launch))}
          ${row("수신거부 목록(email_optouts)", optout.error ? "확인 실패" : (optout.count ?? 0) > 0 ? "있음" : "없음")}
        </table>
        <p style="margin:0 0 8px">요청자에게 본인 확인 메일을 보냈어요. <strong>요청자가 그 메일에 답장한 뒤에</strong> 처리해 주세요: ${esc(teamAction[type])}</p>
        <p style="margin:0 0 8px">접수일로부터 ${PRIVACY_REQUEST_DAYS}일 안에 처리하고, privacy_requests의 status를 done 또는 rejected로, resolved_at을 처리 시각으로 바꿔 주세요.</p>
        <p style="margin:16px 0 0;color:#5e5e5a;font-size:13px">이 메일에 답장하면 요청자에게 바로 전달돼요. · 요청 ID ${id}</p>`),
    });
    if (error) console.error("[privacy-request] team email failed", error);
  } catch (e) {
    console.error("[privacy-request] team email failed", e);
  }

  try {
    const { error } = await db.emails.send({
      to: email,
      replyTo: site.email,
      from: "Lab98",
      subject: "[Lab98] 개인정보 요청을 받았어요",
      html: wrap(`
        <p style="margin:0 0 16px;font-weight:700">개인정보 ${esc(label)} 요청을 받았어요.</p>
        <p style="margin:0 0 16px">${esc(requesterDesc[type])}</p>
        <div style="border:2px solid #111;padding:16px;margin:0 0 16px">
          <strong>본인 확인을 위해 이 메일에 답장해 주세요.</strong><br>
          답장을 받으면 요청하신 날로부터 ${PRIVACY_REQUEST_DAYS}일 안에 처리하고 결과를 알려 드려요.
          답장 내용은 "본인 요청이 맞아요" 한 줄이면 충분해요.
        </div>
        <p style="margin:0 0 16px">직접 요청하지 않으셨다면 이 메일을 무시해 주세요. 답장이 없으면 아무것도 바뀌지 않아요.</p>
        <p style="margin:0;color:#5e5e5a;font-size:13px">문의: ${esc(site.email)} · 요청 ID ${id}</p>`),
    });
    if (error) console.error("[privacy-request] confirmation email failed", error);
  } catch (e) {
    console.error("[privacy-request] confirmation email failed", e);
  }

  return { ok: true };
}
