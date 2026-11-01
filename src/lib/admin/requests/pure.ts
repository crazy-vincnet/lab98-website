/**
 * Pure helpers for the "받은 요청" admin sections (no server-only imports, so scripts can import this file):
 * mail rendering, CSV, labels, privacy due dates, reply templates.
 */

export const SUPPORT_EMAIL = "hello@lab98.io";
export const EMAIL_RE = /^[^\s@<>"',;()]+@[^\s@<>"',;()]+\.[^\s@<>"',;()]+$/;
export const isEmail = (v: string) => v.length >= 3 && v.length <= 254 && EMAIL_RE.test(v);
export const normEmail = (v: string) => v.trim().toLowerCase();

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Plain text -> escaped HTML paragraphs. Blank line = new paragraph, single newline = <br>. URLs are not auto-linked. */
export function textToHtml(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const WRAP_STYLE = "font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;font-size:15px;line-height:1.7;color:#111";

/** Whole email: escaped body + a small gray footer (footerHtml must already be safe HTML built by us). */
export function renderMail(bodyText: string, footerHtml: string): string {
  return `<div style="${WRAP_STYLE}">${textToHtml(bodyText)}<hr style="border:0;border-top:1px solid #ddd;margin:20px 0 12px"><div style="color:#5e5e5a;font-size:13px;line-height:1.6">${footerHtml}</div></div>`;
}

export const replyFooterHtml = () =>
  `이 메일은 noreply 주소에서 보냈지만, 그대로 답장하시면 ${esc(SUPPORT_EMAIL)} 로 전달돼요. 문의: <a href="mailto:${esc(SUPPORT_EMAIL)}">${esc(SUPPORT_EMAIL)}</a><br>Lab98`;

export const launchFooterHtml = (unsubscribeUrl: string) =>
  `Praise Tool 출시 알림을 신청하셔서 보내드렸어요. 이 메일에는 답장하실 수 있고, 문의는 <a href="mailto:${esc(SUPPORT_EMAIL)}">${esc(SUPPORT_EMAIL)}</a> 로 받아요.<br>더 이상 받고 싶지 않으시면 <a href="${esc(unsubscribeUrl)}">수신거부</a> 해 주세요.<br>Lab98`;

/** Strip control characters from text input and normalise line endings. */
export const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").replace(/\r\n?/g, "\n");
/** Subjects must be a single line. */
export const cleanSubject = (s: string) => s.replace(/[\r\n\u0000-\u001f\u007f]+/g, " ").trim();

// ---------------------------------------------------------------- CSV

/**
 * One CSV cell. Quotes when needed and neutralises spreadsheet formula injection: a cell that would start with
 * = + - @ (or tab/CR) gets a leading single quote so it is read as text.
 */
export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** UTF-8 BOM so Excel opens Korean text correctly; CRLF line ends. */
export const toCsv = (header: string[], rows: unknown[][]) =>
  "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";

// ---------------------------------------------------------------- labels

export const INQUIRY_STATUSES = ["new", "replied", "closed", "spam"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = { new: "새 문의", replied: "답장함", closed: "종료", spam: "스팸" };
export const INQUIRY_STATUS_TONE = { new: "info", replied: "ok", closed: "neutral", spam: "danger" } as const;

export const INTEREST_LABEL: Record<string, string> = {
  master: "아직 정하지 않음",
  dev: "Dev · 웹·프로그램",
  web: "Web (예전 분류)",
  ai: "AI · 교육",
  faith: "Faith · 교회·선교",
};

export const PRIVACY_STATUSES = ["new", "verifying", "done", "rejected"] as const;
export type PrivacyStatus = (typeof PRIVACY_STATUSES)[number];
export const PRIVACY_STATUS_LABEL: Record<PrivacyStatus, string> = { new: "접수", verifying: "본인 확인 중", done: "처리 완료", rejected: "거절" };
export const PRIVACY_STATUS_TONE = { new: "info", verifying: "warn", done: "ok", rejected: "neutral" } as const;

// ---------------------------------------------------------------- privacy due date

export const PRIVACY_DUE_DAYS = 10;
const DAY = 86_400_000;

/**
 * Due date = receipt + 10 days. `nowMs` is passed in (never read here) so callers decide when "now" is.
 * Resolved requests are never overdue.
 */
export function dueInfo(createdIso: string, status: string, nowMs: number): { dueIso: string; daysLeft: number; overdue: boolean; open: boolean } {
  const due = new Date(createdIso).getTime() + PRIVACY_DUE_DAYS * DAY;
  const open = status === "new" || status === "verifying";
  const daysLeft = Math.ceil((due - nowMs) / DAY);
  return { dueIso: new Date(due).toISOString(), daysLeft, overdue: open && due < nowMs, open };
}

/** a***@d***.com : keeps the request record without keeping a usable address. */
export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  const dot = domain.lastIndexOf(".");
  const host = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : "";
  return `${local.slice(0, 1)}***@${host.slice(0, 1)}***${tld}`;
}

/** Escape a value for use inside a PostgREST `ilike` pattern (exact, case-insensitive match). */
export const ilikeExact = (v: string) => v.replace(/[\\%_]/g, (c) => `\\${c}`);

// ---------------------------------------------------------------- reply templates

export const REPLY_TEMPLATES: { id: string; label: string; subject: string; body: string }[] = [
  {
    id: "received",
    label: "문의 접수 확인",
    subject: "[Lab98] 문의 감사합니다",
    body: "안녕하세요, Lab98입니다.\n\n문의 남겨 주셔서 감사해요. 보내주신 내용을 잘 읽어 봤어요.\n\n영업일 기준 2~3일 안에 자세한 답을 드릴게요. 그 사이 덧붙이실 내용이 있으면 이 메일에 편하게 답장해 주세요.\n\n감사합니다.\nLab98 드림",
  },
  {
    id: "more-info",
    label: "추가 정보 요청",
    subject: "[Lab98] 문의 관련해서 몇 가지 여쭤볼게요",
    body: "안녕하세요, Lab98입니다.\n\n문의 주셔서 감사해요. 정확하게 답을 드리려고 몇 가지만 여쭤볼게요.\n\n1. 원하시는 결과물이나 목적은 무엇인가요?\n2. 희망하시는 일정이나 예산 범위가 있나요?\n3. 참고할 만한 사이트나 자료가 있으면 알려 주세요.\n\n이 메일에 답장으로 알려 주시면 확인한 뒤 바로 이어서 안내드릴게요.\n\n감사합니다.\nLab98 드림",
  },
  {
    id: "meeting",
    label: "상담 일정 제안",
    subject: "[Lab98] 상담 일정을 잡아 볼까요?",
    body: "안녕하세요, Lab98입니다.\n\n문의 주신 내용을 직접 이야기 나누면 더 정확하게 도와드릴 수 있을 것 같아요. 20~30분 정도 온라인으로 통화해 볼까요?\n\n편하신 요일과 시간대를 두세 개 알려 주시면 맞춰서 정할게요.\n\n감사합니다.\nLab98 드림",
  },
];

export const LAUNCH_DEFAULT = {
  subject: "[Lab98] Praise Tool이 출시됐어요",
  body: "안녕하세요, Lab98입니다.\n\nPraise Tool 출시 알림을 신청해 주셔서 감사해요. 오늘 정식으로 문을 열었어요.\n\n지금 바로 써 보실 수 있어요.\nhttps://lab98.io/praise-tool\n\n써 보시고 불편한 점이나 바라는 점이 있으면 이 메일에 편하게 답장해 주세요.\n\n감사합니다.\nLab98 드림",
};

/** "Now" for dynamic admin pages (call only after requireAdmin(); never from prerendered code). */
export const currentMs = () => Date.now();
