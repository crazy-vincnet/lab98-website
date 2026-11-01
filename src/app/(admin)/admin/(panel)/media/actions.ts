"use server";

import { updateTag } from "next/cache";
import { adminAction } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { redirectWithFlash } from "@/lib/admin/flash";
import { getMediaUsage, MEDIA_BUCKET, MEDIA_COLUMNS, type MediaItem } from "@/lib/admin/media";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { POSTS_TAG } from "@/lib/posts";

export type AltState = { error?: string; ok?: boolean; values?: { alt_ko: string; alt_en: string } };
const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string).trim() : "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const updateMediaAlt = adminAction(async ({ admin }, _prev: AltState, formData: FormData): Promise<AltState> => {
  const id = str(formData, "id");
  const values = { alt_ko: str(formData, "alt_ko"), alt_en: str(formData, "alt_en") };
  if (!UUID.test(id)) return { error: "잘못된 요청이에요.", values };
  if (!values.alt_ko) return { error: "한국어 대체 텍스트는 비워 둘 수 없어요.", values };
  if (values.alt_ko.length > 300 || values.alt_en.length > 300) return { error: "대체 텍스트는 300자 이내로 적어 주세요.", values };
  const { error } = await getInsforgeAdmin().database.from("media").update(values).eq("id", id);
  if (error) return { error: "저장하지 못했어요. 잠시 뒤에 다시 해 주세요.", values };
  await audit(admin.email, "media.alt", { type: "media", id });
  updateTag(POSTS_TAG); // cover images take their alt text from the library
  return { ok: true, values };
});

export const deleteMedia = adminAction(async ({ admin }, formData: FormData) => {
  const id = str(formData, "id");
  if (!UUID.test(id)) redirectWithFlash("/admin/media", "error", "잘못된 요청이에요.");
  const db = getInsforgeAdmin();
  const { data } = await db.database.from("media").select(MEDIA_COLUMNS).eq("id", id).limit(1);
  const item = (Array.isArray(data) ? data[0] : null) as MediaItem | null;
  if (!item) redirectWithFlash("/admin/media", "error", "이미 지워진 이미지예요.");
  const uses = (await getMediaUsage([item])).get(id) ?? [];
  if (uses.length) redirectWithFlash("/admin/media", "error", `글 ${new Set(uses.map((u) => u.postId)).size}개에서 쓰고 있어서 지울 수 없어요. 먼저 글에서 빼 주세요.`);
  const rm = await db.storage.from(MEDIA_BUCKET).remove(item.key);
  if (rm.error) redirectWithFlash("/admin/media", "error", "저장소에서 지우지 못했어요. 잠시 뒤에 다시 해 주세요.");
  const del = await db.database.from("media").delete().eq("id", id);
  if (del.error) redirectWithFlash("/admin/media", "error", "목록에서 지우지 못했어요. 다시 시도해 주세요.");
  await audit(admin.email, "media.delete", { type: "media", id }, { key: item.key });
  redirectWithFlash("/admin/media", "ok", "이미지를 지웠어요.");
});
