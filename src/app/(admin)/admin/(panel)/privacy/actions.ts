"use server";

import { adminAction } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { redirectWithFlash } from "@/lib/admin/flash";
import { emailRef, inspectEmail, type EmailData } from "@/lib/admin/requests/erase";
import { sendMail, UUID_RE } from "@/lib/admin/requests/mail";
import { clean, ilikeExact, isEmail, maskEmail, normEmail, PRIVACY_STATUSES, renderMail, replyFooterHtml, SUPPORT_EMAIL } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");

export const savePrivacyRequest = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  const status = str(formData, "status");
  const note = clean(str(formData, "admin_note")).trim();
  if (!UUID_RE.test(id) || !(PRIVACY_STATUSES as readonly string[]).includes(status)) redirectWithFlash("/admin/privacy", "error", "잘못된 요청이에요.");
  if (note.length > 2000) redirectWithFlash(`/admin/privacy/${id}`, "error", "메모는 2,000자까지 쓸 수 있어요.");
  const now = new Date().toISOString();
  const closing = status === "done" || status === "rejected";
  const db = getInsforgeAdmin().database;
  const { data: prev } = await db.from("privacy_requests").select("status,resolved_at").eq("id", id).limit(1);
  const before = prev?.[0] as { status: string; resolved_at: string | null } | undefined;
  if (!before) redirectWithFlash("/admin/privacy", "error", "요청을 찾지 못했어요.");
  const { error } = await db
    .from("privacy_requests")
    .update({ status, admin_note: note || null, updated_at: now, resolved_at: closing ? (before.resolved_at ?? now) : null })
    .eq("id", id);
  if (error) redirectWithFlash(`/admin/privacy/${id}`, "error", "저장하지 못했어요. 잠시 뒤에 다시 해 주세요.");
  await audit(admin.email, "privacy.update", { type: "privacy_request", id }, { from: before.status, to: status });
  redirectWithFlash(`/admin/privacy/${id}`, "ok", "저장했어요.");
});

// ------------------------------------------------------------------ erase everything for one email

export type EraseState = {
  error?: string;
  /** preview result */
  email?: string;
  data?: EmailData;
  requestId?: string;
  /** execution result */
  done?: { removed: Record<string, number>; mailed: "sent" | "failed" | "no" };
};

/** Step 1: look up what exists for an address (read-only). */
export const previewEraseEmail = adminAction(async ({ admin }, _prev: EraseState, formData: FormData): Promise<EraseState> => {
  const email = normEmail(str(formData, "email"));
  const requestId = UUID_RE.test(str(formData, "request")) ? str(formData, "request") : undefined;
  if (!isEmail(email)) return { error: "이메일 형식이 올바르지 않아요." };
  try {
    const data = await inspectEmail(email);
    await audit(admin.email, "privacy.erase_preview", { type: "email", id: emailRef(email) });
    return { email, data, requestId };
  } catch (e) {
    console.error("[privacy erase] preview failed", e instanceof Error ? e.message : e);
    return { error: "조회하지 못했어요. 잠시 뒤에 다시 해 주세요." };
  }
});

/**
 * Step 2: delete. Needs the address typed again. Follows the privacy policy retention table:
 *   - inquiries (+ cascade inquiry_replies), stray replies to this address, launch_signups: deleted.
 *   - privacy_requests: the record is KEPT (3 years after resolution, for disputes) but minimised: details and ip_hash
 *     removed and the address masked. Requests still open (other than the one being handled) are left untouched.
 *   - email_optouts: KEPT, it is what stops future mail (removed only on request, in /admin/optouts).
 */
export const eraseEmailData = adminAction(async ({ admin }, _prev: EraseState, formData: FormData): Promise<EraseState> => {
  const email = normEmail(str(formData, "email"));
  const typed = normEmail(str(formData, "confirm"));
  const requestId = UUID_RE.test(str(formData, "request")) ? str(formData, "request") : undefined;
  const notify = str(formData, "notify") === "on";
  if (!isEmail(email)) return { error: "이메일 형식이 올바르지 않아요." };
  if (typed !== email) return { error: "확인용 이메일이 달라요. 삭제할 주소를 그대로 다시 입력해 주세요.", email, requestId };

  const db = getInsforgeAdmin().database;
  const pat = ilikeExact(email);
  let before: EmailData;
  try {
    before = await inspectEmail(email);
  } catch {
    return { error: "조회하지 못해 삭제하지 않았어요. 잠시 뒤에 다시 해 주세요.", email, requestId };
  }

  const fail = (what: string, msg: string) => {
    console.error(`[privacy erase] ${what} failed`, msg);
    return { error: `${what} 삭제 중 문제가 생겼어요. 일부만 지워졌을 수 있으니 미리보기를 다시 확인한 뒤 한 번 더 실행해 주세요.`, email, requestId } satisfies EraseState;
  };

  const inq = await db.from("inquiries").delete().ilike("email", pat); // replies cascade
  if (inq.error) return fail("문의", inq.error.message);
  const rep = await db.from("inquiry_replies").delete().ilike("to_email", pat);
  if (rep.error) return fail("답장 기록", rep.error.message);
  const sig = await db.from("launch_signups").delete().ilike("email", pat);
  if (sig.error) return fail("출시 알림 신청", sig.error.message);

  // Keep the request record, minimised.
  const now = new Date().toISOString();
  const red = await db
    .from("privacy_requests")
    .update({ email: maskEmail(email), details: null, ip_hash: null, updated_at: now })
    .ilike("email", pat)
    .in("status", ["done", "rejected"])
    .select("id");
  if (red.error) return fail("개인정보 요청 기록 정리", red.error.message);
  let redacted = red.data?.length ?? 0;
  if (requestId) {
    const own = await db
      .from("privacy_requests")
      .update({ status: "done", resolved_at: now, updated_at: now, admin_note: "이메일 관련 데이터를 삭제했어요.", email: maskEmail(email), details: null, ip_hash: null })
      .eq("id", requestId)
      .ilike("email", pat)
      .select("id");
    if (own.error) return fail("요청 처리 완료 표시", own.error.message);
    redacted += own.data?.length ?? 0;
  }

  const removed = { inquiries: before.inquiries, replies: before.replies, launchSignups: before.launchSignups, requestRecordsMinimised: redacted };
  await audit(admin.email, "privacy.erase", { type: "email", id: emailRef(email) }, { ...removed, requestId: requestId ?? null, notify, optoutKept: before.optouts > 0 });

  let mailed: "sent" | "failed" | "no" = "no";
  if (notify) {
    const body =
      `안녕하세요, Lab98입니다.\n\n요청하신 대로 이 이메일 주소로 보관하던 개인정보를 삭제했어요.\n\n` +
      `- 문의와 답장 기록: ${before.inquiries}건 삭제\n- Praise Tool 출시 알림 신청: ${before.launchSignups}건 삭제\n\n` +
      `개인정보 요청을 처리한 기록은 방침에 따라 최소한(요청 종류와 처리 시각, 가린 이메일)만 3년간 보관해요.` +
      (before.optouts > 0 ? `\n메일을 다시 받지 않도록 수신거부 목록의 이메일 주소는 그대로 두었어요. 이것도 지우기를 원하시면 이 메일에 답장해 주세요.` : "") +
      `\n\n감사합니다.\nLab98 드림`;
    const sent = await sendMail({ to: email, subject: "[Lab98] 개인정보 삭제를 마쳤어요", html: renderMail(body, replyFooterHtml()), replyTo: SUPPORT_EMAIL, from: "Lab98" });
    mailed = sent.ok ? "sent" : "failed";
    await audit(admin.email, sent.ok ? "privacy.erase_mail" : "privacy.erase_mail_failed", { type: "email", id: emailRef(email) });
  }
  return { email, requestId, done: { removed, mailed } };
});
