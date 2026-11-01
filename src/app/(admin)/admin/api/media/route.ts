import { adminRoute } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { MAX_PIXELS, MAX_UPLOAD_BYTES, readImageInfo } from "@/lib/admin/image-info";
import { listMedia, MEDIA_BUCKET, MEDIA_COLUMNS, type MediaItem } from "@/lib/admin/media";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

/**
 * Media library API (admin only, 401 JSON otherwise).
 *   GET  -> { items }                       used by the MediaPicker
 *   POST -> multipart: file, alt_ko (required), alt_en  -> { item }
 * Uploads go through the server with the admin key; the browser never gets storage credentials.
 */
const noStore = { "Cache-Control": "no-store" };
const fail = (error: string, status = 400) => Response.json({ error }, { status, headers: noStore });

export const GET = adminRoute(async () => {
  try {
    return Response.json({ items: await listMedia() }, { headers: noStore });
  } catch {
    return fail("목록을 불러오지 못했어요.", 500);
  }
});

export const POST = adminRoute(async ({ admin }, request: Request) => {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES + 512 * 1024) return fail("파일이 너무 커요. 5MB 이하로 올려 주세요.", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("올린 내용을 읽지 못했어요. 다시 시도해 주세요.");
  }
  const file = form.get("file");
  const altKo = String(form.get("alt_ko") ?? "").trim();
  const altEn = String(form.get("alt_en") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) return fail("이미지 파일을 골라 주세요.");
  if (file.size > MAX_UPLOAD_BYTES) return fail("파일이 너무 커요. 5MB 이하로 올려 주세요.", 413);
  if (!altKo) return fail("한국어 대체 텍스트를 꼭 적어 주세요. 이미지를 볼 수 없는 분께 읽어 주는 설명이에요.");
  if (altKo.length > 300 || altEn.length > 300) return fail("대체 텍스트는 300자 이내로 적어 주세요.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = readImageInfo(bytes);
  if (!info) return fail("PNG, JPG, WEBP, GIF 이미지만 올릴 수 있어요. (SVG는 보안 때문에 받지 않아요.)");
  if (!info.width || !info.height || info.width * info.height > MAX_PIXELS) return fail("이미지 크기를 확인하지 못했거나 너무 커요.");

  const now = new Date();
  const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${info.ext}`;
  const db = getInsforgeAdmin();
  const up = await db.storage.from(MEDIA_BUCKET).upload(key, new Blob([bytes], { type: info.mime }));
  if (up.error || !up.data) return fail("저장소에 올리지 못했어요. 잠시 뒤에 다시 해 주세요.", 502);

  const { data, error } = await db.database
    .from("media")
    .insert([{ key: up.data.key ?? key, url: up.data.url, alt_ko: altKo, alt_en: altEn, width: info.width, height: info.height, mime: info.mime, size: bytes.length }])
    .select(MEDIA_COLUMNS);
  const item = (Array.isArray(data) ? data[0] : null) as MediaItem | null;
  if (error || !item) {
    await db.storage.from(MEDIA_BUCKET).remove(up.data.key ?? key); // no orphan files
    return fail("저장하지 못했어요. 잠시 뒤에 다시 해 주세요.", 500);
  }
  await audit(admin.email, "media.upload", { type: "media", id: item.id }, { key: item.key, mime: info.mime, size: bytes.length });
  return Response.json({ item, warnings: altEn ? [] : ["영어 대체 텍스트가 비어 있어요. 영어 글에 쓰기 전에 채워 주세요."] }, { headers: noStore });
});
