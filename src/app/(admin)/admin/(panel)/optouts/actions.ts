"use server";

import { adminAction } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { redirectWithFlash } from "@/lib/admin/flash";
import { emailRef } from "@/lib/admin/requests/erase";
import { ilikeExact, isEmail, normEmail } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
const BACK = "/admin/optouts";

export const addOptout = adminAction(async ({ admin }, formData: FormData) => {
  const email = normEmail(str(formData, "email"));
  const alsoLaunch = str(formData, "alsoLaunch") === "on";
  if (!isEmail(email)) redirectWithFlash(BACK, "error", "이메일 형식이 올바르지 않아요.");
  const db = getInsforgeAdmin().database;
  const { error } = await db.from("email_optouts").upsert([{ email, source: "admin" }], { onConflict: "email", ignoreDuplicates: true });
  if (error) redirectWithFlash(BACK, "error", "추가하지 못했어요. 잠시 뒤에 다시 해 주세요.");
  let removedLaunch = 0;
  if (alsoLaunch) {
    const del = await db.from("launch_signups").delete().ilike("email", ilikeExact(email)).select("id");
    if (del.error) redirectWithFlash(BACK, "error", "수신거부는 추가했지만 출시 알림 신청을 지우지 못했어요.");
    removedLaunch = del.data?.length ?? 0;
  }
  await audit(admin.email, "optout.add", { type: "email", id: emailRef(email) }, { removedLaunch });
  redirectWithFlash(BACK, "ok", removedLaunch ? `수신거부에 추가하고 출시 알림 신청 ${removedLaunch}건을 지웠어요.` : "수신거부에 추가했어요.");
});

export const removeOptout = adminAction(async ({ admin }, formData: FormData) => {
  const email = normEmail(str(formData, "email"));
  if (!isEmail(email)) redirectWithFlash(BACK, "error", "잘못된 요청이에요.");
  const { error } = await getInsforgeAdmin().database.from("email_optouts").delete().eq("email", email);
  if (error) redirectWithFlash(BACK, "error", "삭제하지 못했어요. 잠시 뒤에 다시 해 주세요.");
  await audit(admin.email, "optout.remove", { type: "email", id: emailRef(email) });
  redirectWithFlash(BACK, "ok", "수신거부 목록에서 뺐어요.");
});
