"use server";

import { updateTag } from "next/cache";
import { audit } from "@/lib/admin/audit";
import { adminAction } from "@/lib/admin/action";
import { discardDraft, getRow, getVersion, publish, saveDraft } from "@/lib/admin/content";
import { redirectWithFlash } from "@/lib/admin/flash";
import { getDoc } from "@/lib/content-registry";
import { CONTENT_KEY_RE, contentTag } from "@/lib/copy-store";
import { normalizeValue, pruneOverrides, toFlatOverrides, validateOverrides, type FlatOverrides } from "@/lib/copy-merge";
import { isLocale, type Locale } from "@/lib/i18n";

export type EditorState = { error?: string; fieldErrors?: Record<string, string> };

const CONFLICT = "그 사이 다른 곳에서 이 문서가 바뀌었어요. 쓰던 내용은 그대로 두고 페이지를 새로고침한 뒤 다시 저장해 주세요.";
const GENERIC = "저장하지 못했어요. 잠시 뒤에 다시 해 주세요.";
const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
const editorUrl = (key: string, locale: Locale) => `/admin/content/${encodeURIComponent(key)}?locale=${locale}`;

async function load(fd: FormData) {
  const key = str(fd, "key");
  const locale = str(fd, "locale");
  const doc = CONTENT_KEY_RE.test(key) ? getDoc(key) : undefined;
  if (!doc || !isLocale(locale)) return null;
  return { doc, key, locale, defaults: await doc.defaults[locale]() };
}

/** Parses + validates the submitted override map against the code defaults. */
function readOverrides(fd: FormData, doc: { skip?: (p: string, v: string) => boolean }, defaults: unknown): { flat: FlatOverrides } | { error: EditorState } {
  let raw: unknown;
  try {
    raw = JSON.parse(str(fd, "overrides") || "{}");
  } catch {
    return { error: { error: "보낸 내용을 읽지 못했어요. 페이지를 새로고침해 주세요." } };
  }
  const submitted: FlatOverrides = {};
  for (const [p, v] of Object.entries(toFlatOverrides(raw))) submitted[p] = normalizeValue(v);
  const flat = pruneOverrides(defaults, submitted, doc.skip);
  const problems = validateOverrides(defaults, flat, doc.skip);
  if (problems.length) {
    const fieldErrors: Record<string, string> = {};
    for (const p of problems) fieldErrors[p.path] = p.message;
    return { error: { error: `고쳐야 할 항목이 ${problems.length}개 있어요. 빨간 표시를 확인해 주세요.`, fieldErrors } };
  }
  return { flat };
}

const changedPaths = (a: FlatOverrides, b: FlatOverrides) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((p) => a[p] !== b[p]);

export const saveDraftAction = adminAction(async ({ admin }, _prev: EditorState, fd: FormData): Promise<EditorState> => {
  const ctx = await load(fd);
  if (!ctx) return { error: "없는 문서예요." };
  const r = readOverrides(fd, ctx.doc, ctx.defaults);
  if ("error" in r) return r.error;
  const res = await saveDraft(admin.email, ctx.key, ctx.locale, r.flat, str(fd, "base") || null);
  if (!res.ok) return { error: res.reason === "conflict" ? CONFLICT : GENERIC };
  await audit(admin.email, "content.save_draft", { type: "content", id: `${ctx.key}:${ctx.locale}` }, { overrides: Object.keys(r.flat).length });
  redirectWithFlash(editorUrl(ctx.key, ctx.locale), "ok", "초안을 저장했어요. 공개 페이지는 아직 그대로예요.");
});

export const publishAction = adminAction(async ({ admin }, _prev: EditorState, fd: FormData): Promise<EditorState> => {
  const ctx = await load(fd);
  if (!ctx) return { error: "없는 문서예요." };
  const r = readOverrides(fd, ctx.doc, ctx.defaults);
  if ("error" in r) return r.error;
  const note = str(fd, "note").trim().slice(0, 200);
  const before = await getRow(ctx.key, ctx.locale);
  const changed = changedPaths(before?.data ?? {}, r.flat);
  if (changed.length === 0 && !before?.draft) return { error: "공개 중인 내용과 달라진 곳이 없어요." };
  const res = await publish(admin.email, ctx.key, ctx.locale, r.flat, str(fd, "base") || null, note);
  if (!res.ok) return { error: res.reason === "conflict" ? CONFLICT : GENERIC };
  await audit(admin.email, "content.publish", { type: "content", id: `${ctx.key}:${ctx.locale}` }, { version: res.version, changed: changed.length, paths: changed.slice(0, 20), note });
  updateTag(contentTag(ctx.key)); // every public page that read this document through getCopy() re-renders on its next request
  redirectWithFlash(editorUrl(ctx.key, ctx.locale), "ok", `공개했어요 (버전 ${res.version}). 홈페이지에 반영되는 데 잠시 걸릴 수 있어요.`);
});

export const discardDraftAction = adminAction(async ({ admin }, fd: FormData): Promise<void> => {
  const ctx = await load(fd);
  if (!ctx) redirectWithFlash("/admin/content", "error", "없는 문서예요.");
  const res = await discardDraft(ctx.key, ctx.locale, str(fd, "base"));
  if (!res.ok) redirectWithFlash(editorUrl(ctx.key, ctx.locale), "error", res.reason === "conflict" ? CONFLICT : GENERIC);
  await audit(admin.email, "content.discard_draft", { type: "content", id: `${ctx.key}:${ctx.locale}` });
  redirectWithFlash(editorUrl(ctx.key, ctx.locale), "ok", "초안을 버렸어요. 공개 중인 내용으로 돌아왔어요.");
});

/** Restores an old version = publishes its text as a NEW version (history is never rewritten) and drops the pending draft. */
export const restoreVersionAction = adminAction(async ({ admin }, fd: FormData): Promise<void> => {
  const ctx = await load(fd);
  if (!ctx) redirectWithFlash("/admin/content", "error", "없는 문서예요.");
  const n = Number(str(fd, "version"));
  const v = Number.isInteger(n) ? await getVersion(ctx.key, ctx.locale, n) : null;
  if (!v) redirectWithFlash(editorUrl(ctx.key, ctx.locale), "error", "그 버전을 찾지 못했어요.");
  // Re-validate against today's defaults: paths that no longer exist are dropped, invalid texts are refused.
  const flat = pruneOverrides(ctx.defaults, v.data, ctx.doc.skip);
  const problems = validateOverrides(ctx.defaults, flat, ctx.doc.skip);
  if (problems.length) redirectWithFlash(editorUrl(ctx.key, ctx.locale), "error", `기본 문구가 바뀌어서 그대로 복원할 수 없어요 (${problems.length}곳).`);
  const res = await publish(admin.email, ctx.key, ctx.locale, flat, str(fd, "base") || null, `버전 ${n} 복원`);
  if (!res.ok) redirectWithFlash(editorUrl(ctx.key, ctx.locale), "error", res.reason === "conflict" ? CONFLICT : GENERIC);
  await audit(admin.email, "content.restore", { type: "content", id: `${ctx.key}:${ctx.locale}` }, { from: n, version: res.version });
  updateTag(contentTag(ctx.key));
  redirectWithFlash(editorUrl(ctx.key, ctx.locale), "ok", `버전 ${n}을 복원해서 새 버전 ${res.version}으로 공개했어요.`);
});
