"use server";

import { adminAction } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { redirectWithFlash } from "@/lib/admin/flash";
import { sendMail, UUID_RE } from "@/lib/admin/requests/mail";
import { clean, cleanSubject, INQUIRY_STATUSES, isEmail, renderMail, replyFooterHtml, SUPPORT_EMAIL } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
const NOTE_MAX = 2000;
const SUBJECT_MAX = 150;
const BODY_MAX = 5000;
/** App-side guard on top of InsForge's own hourly cap. */
const REPLIES_PER_HOUR = 20;

const back = (id: string) => `/admin/inquiries/${id}`;

export const saveInquiry = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  const status = str(formData, "status");
  const note = clean(str(formData, "admin_note")).trim();
  if (!UUID_RE.test(id) || !(INQUIRY_STATUSES as readonly string[]).includes(status)) redirectWithFlash("/admin/inquiries", "error", "잘못된 요청이에요.");
  if (note.length > NOTE_MAX) redirectWithFlash(back(id), "error", `메모는 ${NOTE_MAX}자까지 쓸 수 있어요.`);
  const { error } = await getInsforgeAdmin().database.from("inquiries").update({ status, admin_note: note || null }).eq("id", id);
  if (error) redirectWithFlash(back(id), "error", "저장하지 못했어요. 잠시 뒤에 다시 해 주세요.");
  await audit(admin.email, "inquiry.update", { type: "inquiry", id }, { status, note: note ? "set" : "empty" });
  redirectWithFlash(back(id), "ok", "저장했어요.");
});

export const markInquirySpam = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) redirectWithFlash("/admin/inquiries", "error", "잘못된 요청이에요.");
  const { error } = await getInsforgeAdmin().database.from("inquiries").update({ status: "spam" }).eq("id", id);
  if (error) redirectWithFlash(back(id), "error", "표시하지 못했어요.");
  await audit(admin.email, "inquiry.spam", { type: "inquiry", id });
  redirectWithFlash(back(id), "ok", "스팸으로 표시했어요.");
});

export const deleteInquiry = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) redirectWithFlash("/admin/inquiries", "error", "잘못된 요청이에요.");
  const { error } = await getInsforgeAdmin().database.from("inquiries").delete().eq("id", id); // replies cascade
  if (error) redirectWithFlash(back(id), "error", "삭제하지 못했어요.");
  await audit(admin.email, "inquiry.delete", { type: "inquiry", id });
  redirectWithFlash("/admin/inquiries", "ok", "문의와 답장 기록을 삭제했어요.");
});

export type ReplyState = { error?: string; ok?: boolean; values?: { subject: string; body: string } };

/** Compose + send a reply, store it in inquiry_replies, mark the inquiry as replied. */
export const sendInquiryReply = adminAction(async ({ admin }, _prev: ReplyState, formData: FormData): Promise<ReplyState> => {
  const id = str(formData, "id");
  const subject = cleanSubject(str(formData, "subject"));
  const body = clean(str(formData, "body")).trim();
  const values = { subject, body };
  if (!UUID_RE.test(id)) return { error: "잘못된 요청이에요.", values };
  if (!subject) return { error: "제목을 써 주세요.", values };
  if (subject.length > SUBJECT_MAX) return { error: `제목은 ${SUBJECT_MAX}자까지 쓸 수 있어요.`, values };
  if (!body) return { error: "내용을 써 주세요.", values };
  if (body.length > BODY_MAX) return { error: `내용은 ${BODY_MAX.toLocaleString("ko-KR")}자까지 쓸 수 있어요.`, values };

  const db = getInsforgeAdmin().database;
  const { data: rows, error: readError } = await db.from("inquiries").select("id,email,status").eq("id", id).limit(1);
  const inquiry = (rows?.[0] ?? null) as { id: string; email: string; status: string } | null;
  if (readError || !inquiry) return { error: "문의를 찾지 못했어요.", values };
  if (!isEmail(inquiry.email)) return { error: "문의자 이메일 형식이 올바르지 않아 보낼 수 없어요.", values };

  const since = new Date(Date.now() - 3_600_000).toISOString();
  const recent = await db.from("inquiry_replies").select("id", { count: "exact", head: true }).gte("created_at", since);
  if (recent.error) return { error: "발송 한도를 확인하지 못했어요. 잠시 뒤에 다시 해 주세요.", values };
  if ((recent.count ?? 0) >= REPLIES_PER_HOUR) return { error: `한 시간에 ${REPLIES_PER_HOUR}통까지만 보낼 수 있어요. 잠시 뒤에 다시 해 주세요.`, values };

  const result = await sendMail({ to: inquiry.email, subject, html: renderMail(body, replyFooterHtml()), replyTo: SUPPORT_EMAIL, from: "Lab98" });
  const now = new Date().toISOString();
  const { error: storeError } = await db.from("inquiry_replies").insert([
    { inquiry_id: id, to_email: inquiry.email, subject, body, sent_at: result.ok ? now : null, sent_by: admin.email, error: result.ok ? null : result.error },
  ]);
  if (storeError) console.error("[inquiry reply] store failed", storeError.message);

  if (!result.ok) {
    await audit(admin.email, "inquiry.reply_failed", { type: "inquiry", id }, { rateLimited: result.rateLimited });
    return {
      error: result.rateLimited ? `메일 발송 한도에 걸렸어요. 잠시 뒤에 다시 보내 주세요. (${result.error})` : `보내지 못했어요: ${result.error}`,
      values,
    };
  }

  const { error: statusError } = await db.from("inquiries").update({ status: "replied", replied_at: now }).eq("id", id);
  if (statusError) console.error("[inquiry reply] status update failed", statusError.message);
  await audit(admin.email, "inquiry.reply", { type: "inquiry", id }, { subjectLength: subject.length, bodyLength: body.length });
  redirectWithFlash(back(id), "ok", "답장을 보냈어요.");
});
