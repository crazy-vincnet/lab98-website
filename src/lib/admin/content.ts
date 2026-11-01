import "server-only";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { toFlatOverrides, type FlatOverrides } from "@/lib/copy-merge";
import type { Locale } from "@/lib/i18n";

/** Data layer of the content editor (service key; callers must already have passed requireAdmin / adminAction). */

const db = () => getInsforgeAdmin().database;
const COLS = "key,locale,status,data,draft,version,updated_at,updated_by,draft_updated_at,draft_updated_by,published_at";
export const KEEP_VERSIONS = 50;

export type ContentRow = {
  key: string;
  locale: Locale;
  status: "draft" | "published";
  /** published override map */
  data: FlatOverrides;
  /** pending draft, null when none */
  draft: FlatOverrides | null;
  /** last published version number (0 = never published) */
  version: number;
  updated_at: string;
  updated_by: string | null;
  draft_updated_at: string | null;
  draft_updated_by: string | null;
  published_at: string | null;
};

type RawRow = Omit<ContentRow, "data" | "draft"> & { data: unknown; draft: unknown };
const shape = (r: RawRow): ContentRow => ({ ...r, data: toFlatOverrides(r.data), draft: r.draft == null ? null : toFlatOverrides(r.draft) });

export async function getRow(key: string, locale: Locale): Promise<ContentRow | null> {
  const { data, error } = await db().from("content_entries").select(COLS).eq("key", key).eq("locale", locale).limit(1);
  if (error) throw new Error(error.message);
  const r = Array.isArray(data) ? data[0] : null;
  return r ? shape(r as RawRow) : null;
}

/** All rows (small table), for the list page badges. */
export async function listRows(): Promise<ContentRow[]> {
  const { data, error } = await db().from("content_entries").select(COLS).limit(2000);
  if (error) throw new Error(error.message);
  return (Array.isArray(data) ? data : []).map((r) => shape(r as RawRow));
}

export type SaveResult = { ok: true; row: ContentRow } | { ok: false; reason: "conflict" | "error" };

/** `base` = the `updated_at` the editor loaded (null/"" = it saw no row). A mismatch means somebody saved in between. */
export async function saveDraft(actor: string, key: string, locale: Locale, flat: FlatOverrides, base: string | null): Promise<SaveResult> {
  const now = new Date().toISOString();
  if (!base) {
    const { error } = await db()
      .from("content_entries")
      .insert([{ key, locale, status: "draft", data: {}, draft: flat, version: 0, updated_at: now, updated_by: actor, draft_updated_at: now, draft_updated_by: actor }]);
    if (error) return { ok: false, reason: /duplicate|unique|23505/i.test(error.message) ? "conflict" : "error" };
  } else {
    const { data, error } = await db()
      .from("content_entries")
      .update({ draft: flat, status: "draft", updated_at: now, draft_updated_at: now, draft_updated_by: actor })
      .eq("key", key)
      .eq("locale", locale)
      .eq("updated_at", base)
      .select("key");
    if (error) return { ok: false, reason: "error" };
    if (!Array.isArray(data) || data.length === 0) return { ok: false, reason: "conflict" };
  }
  const row = await getRow(key, locale);
  return row ? { ok: true, row } : { ok: false, reason: "error" };
}

async function snapshot(actor: string, key: string, locale: Locale, version: number, flat: FlatOverrides, note: string) {
  const { error } = await db().from("content_versions").insert([{ key, locale, version, data: flat, created_by: actor, note: note || null }]);
  if (error) throw new Error(error.message);
  if (version > KEEP_VERSIONS) await db().from("content_versions").delete().eq("key", key).eq("locale", locale).lte("version", version - KEEP_VERSIONS);
}

/** Publishes `flat` as the new live override map (clears the draft) and snapshots it as the next version. */
export async function publish(actor: string, key: string, locale: Locale, flat: FlatOverrides, base: string | null, note: string): Promise<SaveResult & { version?: number }> {
  const now = new Date().toISOString();
  const current = base ? await getRow(key, locale) : null;
  if (base && (!current || current.updated_at !== base)) return { ok: false, reason: "conflict" };
  const version = (current?.version ?? 0) + 1;
  if (!current) {
    const { error } = await db()
      .from("content_entries")
      .insert([{ key, locale, status: "published", data: flat, draft: null, version, updated_at: now, updated_by: actor, published_at: now }]);
    if (error) return { ok: false, reason: /duplicate|unique|23505/i.test(error.message) ? "conflict" : "error" };
  } else {
    const { data, error } = await db()
      .from("content_entries")
      .update({ data: flat, draft: null, status: "published", version, updated_at: now, updated_by: actor, published_at: now, draft_updated_at: null, draft_updated_by: null })
      .eq("key", key)
      .eq("locale", locale)
      .eq("updated_at", base!)
      .select("key");
    if (error) return { ok: false, reason: "error" };
    if (!Array.isArray(data) || data.length === 0) return { ok: false, reason: "conflict" };
  }
  try {
    await snapshot(actor, key, locale, version, flat, note);
  } catch (e) {
    console.error("content_versions insert failed:", e instanceof Error ? e.message : e);
  }
  const row = await getRow(key, locale);
  return row ? { ok: true, row, version } : { ok: false, reason: "error" };
}

export async function discardDraft(key: string, locale: Locale, base: string): Promise<SaveResult> {
  const now = new Date().toISOString();
  const { data, error } = await db()
    .from("content_entries")
    .update({ draft: null, status: "published", updated_at: now, draft_updated_at: null, draft_updated_by: null })
    .eq("key", key)
    .eq("locale", locale)
    .eq("updated_at", base)
    .select("key");
  if (error) return { ok: false, reason: "error" };
  if (!Array.isArray(data) || data.length === 0) return { ok: false, reason: "conflict" };
  const row = await getRow(key, locale);
  return row ? { ok: true, row } : { ok: false, reason: "error" };
}

export type VersionRow = { version: number; data: FlatOverrides; created_at: string; created_by: string | null; note: string | null };

export async function listVersions(key: string, locale: Locale, limit = 20): Promise<VersionRow[]> {
  const { data, error } = await db()
    .from("content_versions")
    .select("version,data,created_at,created_by,note")
    .eq("key", key)
    .eq("locale", locale)
    .order("version", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (Array.isArray(data) ? data : []).map((r) => ({ ...(r as VersionRow), data: toFlatOverrides((r as { data: unknown }).data) }));
}

export async function getVersion(key: string, locale: Locale, version: number): Promise<VersionRow | null> {
  const { data } = await db().from("content_versions").select("version,data,created_at,created_by,note").eq("key", key).eq("locale", locale).eq("version", version).limit(1);
  const r = Array.isArray(data) ? data[0] : null;
  return r ? { ...(r as VersionRow), data: toFlatOverrides((r as { data: unknown }).data) } : null;
}
