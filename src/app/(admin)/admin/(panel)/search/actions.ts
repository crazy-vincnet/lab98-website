"use server";

import { updateTag } from "next/cache";
import { audit } from "@/lib/admin/audit";
import { adminAction } from "@/lib/admin/action";
import { redirectWithFlash } from "@/lib/admin/flash";
import { extractVerificationCode, runSearchChecks, type CheckResult } from "@/lib/admin/search";
import { site } from "@/lib/content";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { SEARCH_SETTINGS_KEY, SITE_SETTINGS_TAG } from "@/lib/site-settings";

export type SearchFormState = { errors?: { google?: string; naver?: string }; values?: { google: string; naver: string } };
export type ChecksState = { results?: CheckResult[]; error?: string };

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
const BAD = "영문, 숫자, - , _ 만 쓸 수 있어요. 코드만 넣거나 <meta> 태그를 통째로 붙여 넣어 주세요.";

export const saveSearchSettings = adminAction(async ({ admin }, _prev: SearchFormState, formData: FormData): Promise<SearchFormState> => {
  const values = { google: str(formData, "google"), naver: str(formData, "naver") };
  const google = extractVerificationCode(values.google);
  const naver = extractVerificationCode(values.naver);
  const errors: NonNullable<SearchFormState["errors"]> = {};
  if (google === null) errors.google = BAD;
  if (naver === null) errors.naver = BAD;
  if (google === null || naver === null) return { errors, values };

  const { error } = await getInsforgeAdmin()
    .database.from("site_settings")
    .upsert([{ key: SEARCH_SETTINGS_KEY, value: { google, naver }, updated_at: new Date().toISOString(), updated_by: admin.email }], { onConflict: "key" });
  if (error) return { values, errors: { google: "저장하지 못했어요. 잠시 뒤에 다시 해 주세요." } };

  await audit(admin.email, "search.update", { type: "site_settings", id: SEARCH_SETTINGS_KEY }, { google: google ? "set" : "cleared", naver: naver ? "set" : "cleared" });
  updateTag(SITE_SETTINGS_TAG); // public root layouts read these via getSiteSettings() ("use cache")
  redirectWithFlash("/admin/search", "ok", "저장했어요. 홈페이지에 반영되는 데 잠시 걸릴 수 있어요.");
});

export const runChecksAction = adminAction(async (_ctx, _prev: ChecksState): Promise<ChecksState> => {
  const { data } = await getInsforgeAdmin().database.from("site_settings").select("value").eq("key", SEARCH_SETTINGS_KEY).limit(1);
  const v = (Array.isArray(data) ? data[0]?.value : null) as { google?: string; naver?: string } | null;
  try {
    const results = await runSearchChecks(site.url, { google: v?.google ?? "", naver: v?.naver ?? "" });
    return { results };
  } catch {
    return { error: "점검하지 못했어요. 잠시 뒤에 다시 해 주세요." };
  }
});
