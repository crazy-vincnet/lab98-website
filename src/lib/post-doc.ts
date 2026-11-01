/**
 * Blog post body = a Tiptap/ProseMirror JSON document stored in `posts.blocks`.
 *
 * This file is the single allowlist for that JSON. It has no server-only imports so the editor (client),
 * the Server Actions (before saving) and the public renderer all use the same rules:
 *   - only the node and mark types below survive `normalizeDoc`; everything else is dropped
 *   - link/image URLs go through `sanitizeUrl` (http, https, mailto, or a site-relative path)
 *   - no raw HTML is ever stored or rendered
 */

export type DocMark = { type: "bold" | "italic" | "code" | "link"; attrs?: { href?: string } };
export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  text?: string;
  marks?: DocMark[];
};
export type PostDoc = { type: "doc"; content: DocNode[] };

export const emptyDoc = (): PostDoc => ({ type: "doc", content: [{ type: "paragraph" }] });

const MAX_DEPTH = 8;
const MAX_NODES = 6000;
const MAX_TEXT = 200_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Allow http(s), mailto and relative links only. Returns the cleaned URL or null.
 * `javascript:`, `data:`, `vbscript:`, protocol-relative `//host` and anything with control characters are rejected.
 */
export function sanitizeUrl(input: unknown, opts: { allowMailto?: boolean } = {}): string | null {
  if (typeof input !== "string") return null;
  // Browsers strip tabs/newlines inside a URL scheme ("java\nscript:"), so reject control characters outright.
  if (/[\u0000-\u001f\u007f\s]/.test(input.trim()) || input.length > 2048) return null;
  const v = input.trim();
  if (!v) return null;
  if (v.startsWith("#")) return v;
  if (v.startsWith("/")) return v.startsWith("//") || v.startsWith("/\\") ? null : v;
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
    } catch {
      return null;
    }
  }
  if (opts.allowMailto !== false && /^mailto:[^\s<>]+$/i.test(v)) return v;
  return null;
}

const clampInt = (v: unknown, max = 20000): number | undefined => (typeof v === "number" && Number.isFinite(v) && v > 0 && v <= max ? Math.round(v) : undefined);

function cleanMarks(marks: unknown): DocMark[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const out: DocMark[] = [];
  const seen = new Set<string>();
  for (const m of marks) {
    const type = (m as { type?: unknown })?.type;
    if (typeof type !== "string" || seen.has(type)) continue;
    if (type === "bold" || type === "italic" || type === "code") {
      out.push({ type });
      seen.add(type);
    } else if (type === "link") {
      const href = sanitizeUrl((m as { attrs?: { href?: unknown } }).attrs?.href);
      if (href) {
        out.push({ type: "link", attrs: { href } });
        seen.add(type);
      }
    }
  }
  return out.length ? out : undefined;
}

function cleanNode(raw: unknown, depth: number, budget: { nodes: number; text: number }, parent: string): DocNode | null {
  if (!raw || typeof raw !== "object" || depth > MAX_DEPTH || ++budget.nodes > MAX_NODES) return null;
  const n = raw as DocNode;
  const kids = (allowed?: string[]) =>
    (Array.isArray(n.content) ? n.content : [])
      .map((c) => cleanNode(c, depth + 1, budget, n.type))
      .filter((c): c is DocNode => !!c && (!allowed || allowed.includes(c.type)));

  switch (n.type) {
    case "text": {
      if (typeof n.text !== "string" || !n.text) return null;
      budget.text += n.text.length;
      if (budget.text > MAX_TEXT) return null;
      const marks = cleanMarks(n.marks);
      return { type: "text", text: n.text, ...(marks ? { marks } : {}) };
    }
    case "hardBreak":
      return { type: "hardBreak" };
    case "horizontalRule":
      return { type: "horizontalRule" };
    case "paragraph": {
      const content = kids(["text", "hardBreak"]);
      return content.length ? { type: "paragraph", content } : { type: "paragraph" };
    }
    case "heading": {
      const level = (n.attrs as { level?: unknown } | undefined)?.level;
      const content = kids(["text", "hardBreak"]);
      return { type: "heading", attrs: { level: level === 3 ? 3 : 2 }, ...(content.length ? { content } : {}) };
    }
    case "blockquote": {
      const content = kids(["paragraph"]);
      return content.length ? { type: "blockquote", content } : null;
    }
    case "bulletList":
    case "orderedList": {
      const content = kids(["listItem"]);
      return content.length ? { type: n.type, content } : null;
    }
    case "listItem": {
      if (parent !== "bulletList" && parent !== "orderedList") return null;
      const content = kids(["paragraph", "bulletList", "orderedList"]);
      return content.length ? { type: "listItem", content } : null;
    }
    case "codeBlock": {
      const lang = (n.attrs as { language?: unknown } | undefined)?.language;
      const text = (Array.isArray(n.content) ? n.content : []).map((c) => (c?.type === "text" && typeof c.text === "string" ? c.text : "")).join("");
      budget.text += text.length;
      const language = typeof lang === "string" && /^[a-z0-9+#-]{1,20}$/i.test(lang) ? lang : null;
      return { type: "codeBlock", attrs: { language }, ...(text ? { content: [{ type: "text", text }] } : {}) };
    }
    case "image": {
      const a = (n.attrs ?? {}) as Record<string, unknown>;
      const src = sanitizeUrl(a.src, { allowMailto: false });
      if (!src || src.startsWith("#")) return null;
      const mediaId = typeof a.mediaId === "string" && UUID_RE.test(a.mediaId) ? a.mediaId : null;
      const alt = typeof a.alt === "string" ? a.alt.slice(0, 500) : "";
      return { type: "image", attrs: { src, alt, mediaId, width: clampInt(a.width) ?? null, height: clampInt(a.height) ?? null } };
    }
    default:
      return null;
  }
}

/** Whatever came in (DB value, client payload) -> a document that contains only allowlisted nodes/marks. */
export function normalizeDoc(input: unknown): PostDoc {
  let value = input;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return emptyDoc();
    }
  }
  if (!value || typeof value !== "object" || (value as DocNode).type !== "doc") return emptyDoc();
  const budget = { nodes: 0, text: 0 };
  const blocks = (Array.isArray((value as DocNode).content) ? (value as DocNode).content! : [])
    .map((c) => cleanNode(c, 1, budget, "doc"))
    .filter((c): c is DocNode => !!c && ["paragraph", "heading", "blockquote", "bulletList", "orderedList", "codeBlock", "horizontalRule", "image"].includes(c.type));
  return { type: "doc", content: blocks.length ? blocks : [{ type: "paragraph" }] };
}

/** Plain text of the document (reading time, empty check, search). */
export function docText(doc: PostDoc): string {
  const parts: string[] = [];
  const walk = (n: DocNode) => {
    if (n.type === "text" && n.text) parts.push(n.text);
    if (n.type === "hardBreak") parts.push(" ");
    n.content?.forEach(walk);
    if (["paragraph", "heading", "listItem", "codeBlock", "blockquote"].includes(n.type)) parts.push("\n");
  };
  doc.content.forEach(walk);
  return parts.join("").trim();
}

export function docHasContent(doc: PostDoc): boolean {
  return docText(doc).length > 0 || doc.content.some((n) => n.type === "image");
}

export const readingMinutes = (doc: PostDoc, locale: "ko" | "en"): number => {
  const text = docText(doc);
  if (locale === "en") return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 220));
  return Math.max(1, Math.ceil(text.replace(/\s+/g, "").length / 500));
};

/** Every image in the document: its media id (if any) and src. */
export function docImages(doc: PostDoc): { mediaId: string | null; src: string }[] {
  const out: { mediaId: string | null; src: string }[] = [];
  const walk = (n: DocNode) => {
    if (n.type === "image") out.push({ mediaId: (n.attrs?.mediaId as string | null) ?? null, src: String(n.attrs?.src ?? "") });
    n.content?.forEach(walk);
  };
  doc.content.forEach(walk);
  return out;
}

/* ------------------------------------------------------------------ slugs */

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MAX = 80;

/** "Hello, World!" -> "hello-world". Korean-only titles give "" (the caller falls back to a dated slug). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

/** Slug for a new post: from the title when it has latin letters/digits, otherwise `post-YYMMDD-xxxx`. */
export function suggestSlug(title: string, kstDate: string, rand: string): string {
  return slugify(title) || `post-${kstDate.replace(/-/g, "").slice(2)}-${rand}`;
}
