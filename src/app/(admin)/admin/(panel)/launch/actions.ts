"use server";

import { adminAction } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { redirectWithFlash } from "@/lib/admin/flash";
import { getRecipients, type Failure } from "@/lib/admin/requests/launch";
import { sendMail, sleep, UUID_RE } from "@/lib/admin/requests/mail";
import { clean, cleanSubject, launchFooterHtml, renderMail, SUPPORT_EMAIL } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { unsubscribeUrl } from "@/lib/unsubscribe-token";

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
const SUBJECT_MAX = 150;
const BODY_MAX = 5000;
const KIND = "launch-praise-tool";
/** Recipients handled per Server Action call, and the pause between mails. InsForge also caps sends per hour (10-50). */
const CHUNK = 8;
const GAP_MS = 1200;
const NEW_CAMPAIGNS_PER_HOUR = 5;

const html = (body: string, email: string) => renderMail(body, launchFooterHtml(unsubscribeUrl(email)));

// ------------------------------------------------------------------ signups

export const deleteSignups = adminAction(async ({ admin }, formData: FormData) => {
  const ids = [...new Set(formData.getAll("ids").filter((v): v is string => typeof v === "string" && UUID_RE.test(v)))].slice(0, 500);
  if (!ids.length) redirectWithFlash("/admin/launch", "error", "삭제할 신청자를 골라 주세요.");
  const { error } = await getInsforgeAdmin().database.from("launch_signups").delete().in("id", ids);
  if (error) redirectWithFlash("/admin/launch", "error", "삭제하지 못했어요. 잠시 뒤에 다시 해 주세요.");
  await audit(admin.email, "launch.signup_delete", { type: "launch_signups" }, { count: ids.length });
  redirectWithFlash("/admin/launch", "ok", `${ids.length}명을 삭제했어요.`);
});

// ------------------------------------------------------------------ campaign: compose + test

export type ComposeState = { error?: string; values?: { subject: string; body: string } };

/** Step 1: freeze subject/body as a draft campaign and mail a test copy to the admin. The real send needs test_sent_at. */
export const createCampaignWithTest = adminAction(async ({ admin }, _prev: ComposeState, formData: FormData): Promise<ComposeState> => {
  const subject = cleanSubject(str(formData, "subject"));
  const body = clean(str(formData, "body")).trim();
  const values = { subject, body };
  if (!subject) return { error: "제목을 써 주세요.", values };
  if (subject.length > SUBJECT_MAX) return { error: `제목은 ${SUBJECT_MAX}자까지 쓸 수 있어요.`, values };
  if (!body) return { error: "내용을 써 주세요.", values };
  if (body.length > BODY_MAX) return { error: `내용은 ${BODY_MAX.toLocaleString("ko-KR")}자까지 쓸 수 있어요.`, values };

  const db = getInsforgeAdmin().database;
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const recent = await db.from("mail_campaigns").select("id", { count: "exact", head: true }).eq("kind", KIND).gte("created_at", since);
  if (recent.error) return { error: "한도를 확인하지 못했어요. 잠시 뒤에 다시 해 주세요.", values };
  if ((recent.count ?? 0) >= NEW_CAMPAIGNS_PER_HOUR) return { error: "한 시간에 새 메일은 5개까지만 만들 수 있어요.", values };

  const ins = await db.from("mail_campaigns").insert([{ kind: KIND, subject, body, sent_by: admin.email, status: "draft" }]).select("id");
  const id = (ins.data?.[0] as { id?: string } | undefined)?.id;
  if (ins.error || !id) return { error: "저장하지 못했어요. 잠시 뒤에 다시 해 주세요.", values };

  const sent = await sendMail({ to: admin.email, subject: `[테스트] ${subject}`.slice(0, 200), html: html(body, admin.email), replyTo: SUPPORT_EMAIL, from: "Lab98" });
  if (!sent.ok) {
    await db.from("mail_campaigns").delete().eq("id", id);
    return { error: sent.rateLimited ? `메일 발송 한도에 걸렸어요. 잠시 뒤에 다시 해 주세요. (${sent.error})` : `테스트 메일을 보내지 못했어요: ${sent.error}`, values };
  }
  await db.from("mail_campaigns").update({ test_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
  await audit(admin.email, "launch.campaign_test", { type: "mail_campaign", id }, { subjectLength: subject.length });
  redirectWithFlash(`/admin/launch?campaign=${id}`, "ok", "테스트 메일을 내 주소로 보냈어요. 받은 편지함을 확인해 보세요.");
});

export const resendCampaignTest = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) redirectWithFlash("/admin/launch", "error", "잘못된 요청이에요.");
  const db = getInsforgeAdmin().database;
  const { data } = await db.from("mail_campaigns").select("id,subject,body,status").eq("id", id).eq("kind", KIND).limit(1);
  const c = data?.[0] as { subject: string; body: string; status: string } | undefined;
  if (!c) redirectWithFlash("/admin/launch", "error", "메일을 찾지 못했어요.");
  const sent = await sendMail({ to: admin.email, subject: `[테스트] ${c.subject}`.slice(0, 200), html: html(c.body, admin.email), replyTo: SUPPORT_EMAIL, from: "Lab98" });
  if (!sent.ok) redirectWithFlash(`/admin/launch?campaign=${id}`, "error", `테스트 메일을 보내지 못했어요: ${sent.error}`.slice(0, 190));
  await db.from("mail_campaigns").update({ test_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
  await audit(admin.email, "launch.campaign_test", { type: "mail_campaign", id }, { again: true });
  redirectWithFlash(`/admin/launch?campaign=${id}`, "ok", "테스트 메일을 다시 보냈어요.");
});

export const discardCampaign = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) redirectWithFlash("/admin/launch", "error", "잘못된 요청이에요.");
  const { data, error } = await getInsforgeAdmin().database.from("mail_campaigns").delete().eq("id", id).eq("kind", KIND).eq("status", "draft").select("id");
  if (error || !data?.length) redirectWithFlash("/admin/launch", "error", "보내기 전 초안만 지울 수 있어요.");
  await audit(admin.email, "launch.campaign_discard", { type: "mail_campaign", id });
  redirectWithFlash("/admin/launch", "ok", "초안을 지웠어요.");
});

export const retryCampaignFailures = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) redirectWithFlash("/admin/launch", "error", "잘못된 요청이에요.");
  const { error } = await getInsforgeAdmin()
    .database.from("mail_campaigns")
    .update({ failures: [], status: "sending", last_error: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("kind", KIND)
    .in("status", ["sent", "failed", "sending"]);
  if (error) redirectWithFlash(`/admin/launch?campaign=${id}`, "error", "처리하지 못했어요.");
  await audit(admin.email, "launch.campaign_retry", { type: "mail_campaign", id });
  redirectWithFlash(`/admin/launch?campaign=${id}`, "ok", "실패한 분들을 다시 보낼 수 있게 했어요. '이어서 보내기'를 눌러 주세요.");
});

// ------------------------------------------------------------------ campaign: send in chunks

export type ChunkResult = {
  ok: boolean;
  error?: string;
  /** sending = more to do; paused = hit InsForge hourly cap (resume later); done = nothing left */
  state?: "sending" | "paused" | "done";
  sentTotal?: number;
  failedTotal?: number;
  remaining?: number;
  recipientsTotal?: number;
};

type Campaign = {
  id: string;
  subject: string;
  body: string;
  status: string;
  test_sent_at: string | null;
  recipients_count: number;
  skipped_optout: number;
  sent_count: number;
  failures: Failure[] | null;
};

/**
 * Step 2: called repeatedly by the browser until it returns done/paused. Each call sends at most CHUNK mails.
 * `confirmCount` is required on the first call (status draft): it must equal the exact number of recipients now,
 * so a list that changed since the confirm dialog is refused. Safe to call again after a crash or a closed tab:
 * recipients are claimed (notified_at set where it is still NULL) BEFORE sending, so nobody is mailed twice, and
 * a failed send releases the claim and goes to the campaign's failure list.
 */
export const sendCampaignChunk = adminAction(async ({ admin }, campaignId: string, confirmCount?: number): Promise<ChunkResult> => {
  if (!UUID_RE.test(campaignId)) return { ok: false, error: "잘못된 요청이에요." };
  const db = getInsforgeAdmin().database;
  const read = async () => {
    const { data } = await db
      .from("mail_campaigns")
      .select("id,subject,body,status,test_sent_at,recipients_count,skipped_optout,sent_count,failures")
      .eq("id", campaignId)
      .eq("kind", KIND)
      .limit(1);
    return (data?.[0] ?? null) as Campaign | null;
  };
  const c = await read();
  if (!c) return { ok: false, error: "메일을 찾지 못했어요." };
  if (!c.test_sent_at) return { ok: false, error: "먼저 테스트 메일을 나에게 보내 주세요." };
  if (c.status === "sent") return { ok: true, state: "done", sentTotal: c.sent_count, failedTotal: (c.failures ?? []).length, remaining: 0, recipientsTotal: c.recipients_count };

  let failures: Failure[] = Array.isArray(c.failures) ? c.failures : [];
  let recipients;
  try {
    recipients = await getRecipients(failures.map((f) => f.email)); // fail-closed on opt-out lookup errors
  } catch (e) {
    console.error("[launch send] recipients lookup failed", e instanceof Error ? e.message : e);
    return { ok: false, error: "받는 사람 목록을 확인하지 못해 보내지 않았어요. 잠시 뒤에 다시 해 주세요." };
  }

  if (c.status === "draft") {
    if (!Number.isInteger(confirmCount) || confirmCount !== recipients.eligible.length) {
      return { ok: false, error: `받는 사람 수가 바뀌었어요(지금 ${recipients.eligible.length}명). 화면을 새로고침한 뒤 다시 확인해 주세요.` };
    }
    if (recipients.eligible.length === 0) return { ok: false, error: "보낼 사람이 없어요." };
    const { data: started, error } = await db
      .from("mail_campaigns")
      .update({ status: "sending", recipients_count: recipients.eligible.length, skipped_optout: recipients.skippedOptout, last_error: null, updated_at: new Date().toISOString() })
      .eq("id", campaignId)
      .eq("status", "draft")
      .select("id");
    if (error) return { ok: false, error: "시작하지 못했어요. 잠시 뒤에 다시 해 주세요." };
    if (started?.length) {
      await audit(admin.email, "launch.campaign_start", { type: "mail_campaign", id: campaignId }, { recipients: recipients.eligible.length, skippedOptout: recipients.skippedOptout });
    }
  } else if (c.status === "failed") {
    await db.from("mail_campaigns").update({ status: "sending" }).eq("id", campaignId);
  }

  let sent = 0;
  let paused: string | null = null;
  const batch = recipients.eligible.slice(0, CHUNK);
  for (let n = 0; n < batch.length; n++) {
    const r = batch[n];
    // Claim first: only one caller can flip notified_at from NULL, so concurrent loops never double-send.
    const claim = await db.from("launch_signups").update({ notified_at: new Date().toISOString() }).eq("id", r.id).is("notified_at", null).select("id");
    if (claim.error || !claim.data?.length) continue;
    const res = await sendMail({ to: r.email, subject: c.subject, html: html(c.body, r.email), replyTo: SUPPORT_EMAIL, from: "Lab98" });
    if (res.ok) {
      sent++;
    } else {
      await db.from("launch_signups").update({ notified_at: null }).eq("id", r.id); // release the claim
      if (res.rateLimited) {
        paused = res.error;
        break;
      }
      failures = [...failures, { email: r.email, error: res.error.slice(0, 200), at: new Date().toISOString() }];
    }
    if (n < batch.length - 1) await sleep(GAP_MS);
  }

  // Re-read so parallel callers don't overwrite each other's counter.
  const fresh = (await read()) ?? c;
  const merged = new Map<string, Failure>();
  for (const f of [...(Array.isArray(fresh.failures) ? fresh.failures : []), ...failures]) merged.set(f.email, f);
  const failureList = [...merged.values()];
  const sentTotal = fresh.sent_count + sent;

  let after;
  try {
    after = await getRecipients(failureList.map((f) => f.email));
  } catch {
    after = { eligible: [] as { id: string; email: string }[] };
  }
  const remaining = after.eligible.length;
  const finished = !paused && remaining === 0;
  const status = finished ? (sentTotal > 0 ? "sent" : "failed") : "sending";
  await db
    .from("mail_campaigns")
    .update({
      sent_count: sentTotal,
      failures: failureList,
      status,
      last_error: paused,
      sent_at: finished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);
  if (finished || paused) {
    await audit(admin.email, finished ? "launch.campaign_done" : "launch.campaign_paused", { type: "mail_campaign", id: campaignId }, { sent: sentTotal, failed: failureList.length, remaining });
  }
  return {
    ok: true,
    state: finished ? "done" : paused ? "paused" : "sending",
    error: paused ? `메일 발송 한도에 걸려 잠시 멈췄어요. 한 시간쯤 뒤에 '이어서 보내기'를 눌러 주세요. (${paused})` : undefined,
    sentTotal,
    failedTotal: failureList.length,
    remaining,
    recipientsTotal: fresh.recipients_count || c.recipients_count,
  };
});
