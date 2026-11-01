/**
 * Pure helpers of the content override engine (no server-only, no I/O: safe in client code and in tests).
 * See docs/admin-content.md.
 *
 * Model: a "copy document" is a defaults tree that lives in code (strings, nested objects, arrays, plus anything
 * else such as functions/numbers). An override is a FLAT map { "path": "text" } with one entry per edited STRING leaf.
 * Paths join keys with "." and array indexes are plain numbers: "services.0.title".
 * A "." inside a key is written "~1" and a "~" as "~0" (see encodeSegment).
 */

export type FlatOverrides = Record<string, string>;

/** Hard ceiling for any single override string (the editor uses a tighter per-field limit, see fieldMaxLength). */
export const MAX_OVERRIDE_LENGTH = 20_000;
/** Hard ceiling for the number of overrides in one document. */
export const MAX_OVERRIDE_COUNT = 2_000;

export const encodeSegment = (s: string) => s.replace(/~/g, "~0").replace(/\./g, "~1");
export const joinPath = (parent: string, seg: string | number) => (parent ? `${parent}.${encodeSegment(String(seg))}` : encodeSegment(String(seg)));

/** Last key of a path, decoded (for labels). */
export function lastSegment(path: string): string {
  const s = path.slice(path.lastIndexOf(".") + 1);
  return s.replace(/~1/g, ".").replace(/~0/g, "~");
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (v === null || typeof v !== "object") return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};

/**
 * Leaves that are never editable even though they are strings: URLs, paths, anchors, ids, slugs, image sources.
 * Decided from the last key and the value only, so the public merge and the editor always agree.
 */
const NON_COPY_KEYS = /^(href|src|srcset|url|uri|slug|id|path|icon|image|img|symbol|class|classname|color|theme|lang|locale|tone|variant|anchor|rel|target|htmlfor)$/i;
const URLISH = /^(https?:\/\/|mailto:|tel:|\/[A-Za-z0-9_\-/#?=&.%]*$|#[A-Za-z0-9_-]+$)/;

export function isEditableLeaf(path: string, value: string): boolean {
  if (NON_COPY_KEYS.test(lastSegment(path))) return false;
  if (URLISH.test(value)) return false;
  return true;
}

/** {name}-style tokens of a string, sorted (a multiset). An override must keep exactly the same tokens as the default. */
export function tokensOf(s: string): string[] {
  return (s.match(/\{[A-Za-z_][\w.]*\}/g) ?? []).slice().sort();
}
export const sameTokens = (a: string, b: string) => {
  const x = tokensOf(a);
  const y = tokensOf(b);
  return x.length === y.length && x.every((t, i) => t === y[i]);
};

/** Per-field length limit applied by the save action: generous multiple of the default, never above the hard ceiling. */
export const fieldMaxLength = (def: string) => Math.min(MAX_OVERRIDE_LENGTH, Math.max(300, def.length * 5));

export type StringLeaf = { path: string; value: string };

/**
 * Every editable string leaf of `defaults` with its stable path (objects by key, arrays by index, document order).
 * Functions, numbers, booleans, null, class instances and non-editable strings (see isEditableLeaf) are skipped.
 * `skip` lets a registry entry exclude more paths.
 */
export function flattenStrings(defaults: unknown, skip?: (path: string, value: string) => boolean): StringLeaf[] {
  const out: StringLeaf[] = [];
  const walk = (node: unknown, path: string) => {
    if (typeof node === "string") {
      if (path && isEditableLeaf(path, node) && !skip?.(path, node)) out.push({ path, value: node });
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, joinPath(path, i)));
    } else if (isPlainObject(node)) {
      for (const k of Object.keys(node)) walk(node[k], joinPath(path, k));
    }
  };
  walk(defaults, "");
  return out;
}

/**
 * Returns `defaults` with string leaves replaced by overrides. Guarantees (so a bad row can never break a page):
 *  - shape never changes: only existing STRING leaves are replaced; arrays keep their length; unknown paths are ignored;
 *  - the override must be a string, within MAX_OVERRIDE_LENGTH, with exactly the default's `{tokens}`;
 *  - non-string values (functions, numbers, …) are returned as the same references;
 *  - with no (usable) overrides the very same `defaults` object is returned.
 */
export function mergeOverrides<T>(defaults: T, overrides: FlatOverrides | null | undefined, skip?: (path: string, value: string) => boolean): T {
  if (!overrides) return defaults;
  const keys = Object.keys(overrides);
  if (keys.length === 0) return defaults;
  let used = 0;
  const walk = (node: unknown, path: string): unknown => {
    if (typeof node === "string") {
      const o = path && Object.hasOwn(overrides, path) ? overrides[path] : undefined;
      if (typeof o === "string" && o.length <= MAX_OVERRIDE_LENGTH && isEditableLeaf(path, node) && !skip?.(path, node) && sameTokens(node, o)) {
        used++;
        return o;
      }
      return node;
    }
    if (Array.isArray(node)) return node.map((v, i) => walk(v, joinPath(path, i)));
    if (isPlainObject(node)) {
      const next: Record<string, unknown> = {};
      for (const k of Object.keys(node)) next[k] = walk(node[k], joinPath(path, k));
      return next;
    }
    return node;
  };
  const merged = walk(defaults, "") as T;
  return used === 0 ? defaults : merged;
}

/** Keeps only the entries that are known editable leaves of `defaults` and differ from the default. */
export function pruneOverrides(defaults: unknown, overrides: FlatOverrides, skip?: (path: string, value: string) => boolean): FlatOverrides {
  const known = new Map(flattenStrings(defaults, skip).map((l) => [l.path, l.value]));
  const out: FlatOverrides = {};
  for (const [p, v] of Object.entries(overrides)) {
    const d = known.get(p);
    if (d !== undefined && typeof v === "string" && v !== d) out[p] = v;
  }
  return out;
}

/** Narrows unknown JSON (a jsonb column, a form field) to a flat string map; anything else is dropped. */
export function toFlatOverrides(v: unknown): FlatOverrides {
  const out: FlatOverrides = {};
  if (!isPlainObject(v)) return out;
  for (const [k, val] of Object.entries(v)) if (typeof val === "string") out[k] = val;
  return out;
}

export type OverrideProblem = { path: string; message: string };

/** Save-time validation (Korean messages). Also used to decide what the editor may submit. */
export function validateOverrides(defaults: unknown, overrides: FlatOverrides, skip?: (path: string, value: string) => boolean): OverrideProblem[] {
  const known = new Map(flattenStrings(defaults, skip).map((l) => [l.path, l.value]));
  const problems: OverrideProblem[] = [];
  const entries = Object.entries(overrides);
  if (entries.length > MAX_OVERRIDE_COUNT) return [{ path: "", message: "수정한 항목이 너무 많아요." }];
  for (const [path, value] of entries) {
    const def = known.get(path);
    if (def === undefined) continue; // unknown/non-editable paths are dropped by pruneOverrides, not an error
    if (value === def) continue;
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) problems.push({ path, message: "쓸 수 없는 제어 문자가 들어 있어요." });
    else if (value.trim() === "" && def.trim() !== "") problems.push({ path, message: "비워 둘 수 없어요. 기본값으로 되돌리려면 '기본값으로 되돌리기'를 눌러 주세요." });
    else if (value.length > fieldMaxLength(def)) problems.push({ path, message: `너무 길어요. 최대 ${fieldMaxLength(def).toLocaleString("ko-KR")}자까지 쓸 수 있어요.` });
    else if (!sameTokens(def, value)) {
      const want = tokensOf(def);
      problems.push({
        path,
        message: want.length
          ? `${want.join(" ")} 표시는 기본 문구와 똑같이 넣어 주세요. 지우거나 바꾸면 안 돼요.`
          : "{ } 로 감싼 표시는 쓸 수 없어요. 기본 문구에 없는 자리표시예요.",
      });
    }
  }
  return problems;
}

/** Normalizes line breaks and trims trailing whitespace of an edited value. */
export const normalizeValue = (s: string) => s.replace(/\r\n?/g, "\n");
