import { isEditableLeaf, joinPath, lastSegment } from "@/lib/copy-merge";

/** Serializable form model generated from a defaults tree (pure; used by the server page, rendered by the client editor). */
export type FieldNode = { kind: "field"; path: string; label: string; key: string; def: string; multiline: boolean };
export type GroupNode = { kind: "group"; path: string; label: string; sub?: string; isItem: boolean; children: TreeNode[] };
export type TreeNode = FieldNode | GroupNode;

const KEY_LABELS: Record<string, string> = {
  title: "제목", headline: "헤드라인", summary: "요약", description: "설명", body: "본문", lead: "리드 문장", label: "라벨", eyebrow: "상단 작은 제목",
  cta: "버튼", ctaPrimary: "주요 버튼", ctaSecondary: "보조 버튼", name: "이름", short: "짧은 이름", role: "역할", q: "질문", a: "답변",
  more: "더 보기 링크", intro: "도입", subtitle: "부제", caption: "캡션", hint: "도움말", placeholder: "입력 안내", submit: "보내기 버튼",
  error: "오류 문구", success: "완료 문구", metaTitle: "검색 제목", metaDescription: "검색 설명", cardFoot: "카드 하단 링크",
};
const TITLE_KEYS = ["title", "name", "label", "q", "headline", "short", "eyebrow"];

const matches = (pattern: string, path: string) => {
  const a = pattern.split(".");
  const b = path.split(".");
  // array indexes in the path are generic: a registry label pattern may use "*" for them
  return a.length === b.length && a.every((s, i) => s === "*" || s === b[i]);
};

export function buildTree(defaults: unknown, opts: { skip?: (path: string, value: string) => boolean; labels?: Record<string, string> } = {}): TreeNode[] {
  const labelOf = (path: string, key: string) => {
    const hit = opts.labels && Object.entries(opts.labels).find(([p]) => matches(p, path));
    return hit?.[1] ?? KEY_LABELS[key] ?? key;
  };
  const walkChildren = (node: unknown, path: string): TreeNode[] => {
    const out: TreeNode[] = [];
    const visit = (value: unknown, seg: string | number, isItem: boolean) => {
      const p = joinPath(path, seg);
      const key = String(seg);
      if (typeof value === "string") {
        if (isEditableLeaf(p, value) && !opts.skip?.(p, value)) {
          out.push({ kind: "field", path: p, key: lastSegment(p), label: typeof seg === "number" ? `${seg + 1}번째 문구` : labelOf(p, key), def: value, multiline: value.length > 60 || value.includes("\n") });
        }
      } else if (Array.isArray(value) || (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype)) {
        const children = walkChildren(value, p);
        if (children.length === 0) return;
        let sub: string | undefined;
        if (isItem) {
          const t = children.find((c): c is FieldNode => c.kind === "field" && TITLE_KEYS.includes(c.key));
          sub = (t ?? children.find((c): c is FieldNode => c.kind === "field"))?.def;
        }
        out.push({ kind: "group", path: p, label: isItem ? `${Number(seg) + 1}번째` : labelOf(p, key), sub: sub && sub.length > 40 ? `${sub.slice(0, 40)}…` : sub, isItem, children });
      }
    };
    if (Array.isArray(node)) node.forEach((v, i) => visit(v, i, true));
    else if (node && typeof node === "object") for (const k of Object.keys(node as object)) visit((node as Record<string, unknown>)[k], k, false);
    return out;
  };
  // A bare string document is not supported (defaults are objects); arrays at the root work.
  return walkChildren(defaults, "");
}

export function countFields(tree: TreeNode[]): number {
  return tree.reduce((n, t) => n + (t.kind === "field" ? 1 : countFields(t.children)), 0);
}
