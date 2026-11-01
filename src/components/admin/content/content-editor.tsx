"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { publishAction, saveDraftAction, type EditorState } from "@/app/(admin)/admin/(panel)/content/actions";
import type { FieldNode, GroupNode, TreeNode } from "@/lib/admin/content-tree";
import { fieldMaxLength, sameTokens, tokensOf } from "@/lib/copy-merge";
import { Alert } from "../alert";
import { Badge } from "../badge";
import { Button, buttonClass } from "../button";
import { TextInput } from "../field";
import { SubmitButton } from "../submit-button";
import { cx } from "../cx";

type Props = {
  docKey: string;
  locale: "ko" | "en";
  tree: TreeNode[];
  /** path -> text currently being edited (draft if any, else published); only edited paths. */
  initial: Record<string, string>;
  /** path -> text that is live now (only edited paths). */
  published: Record<string, string>;
  /** path -> effective text of the OTHER language (for the side-by-side view). */
  other: Record<string, string>;
  otherLocale: "ko" | "en";
  /** updated_at of the row when loaded ("" = no row yet); sent back to detect concurrent edits. */
  base: string;
  previewHref: string;
  publicHref: string;
  staleCount: number;
};

const collectFields = (tree: TreeNode[]): FieldNode[] => tree.flatMap((n) => (n.kind === "field" ? [n] : collectFields(n.children)));

export function ContentEditor(p: Props) {
  const fields = useMemo(() => collectFields(p.tree), [p.tree]);
  const initialValues = useMemo(() => Object.fromEntries(fields.map((f) => [f.path, p.initial[f.path] ?? f.def])), [fields, p.initial]);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [query, setQuery] = useState("");
  const [showOther, setShowOther] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTick, setPreviewTick] = useState(0);
  const [saveState, saveAction] = useActionState<EditorState, FormData>(saveDraftAction, {});
  const [pubState, pubAction] = useActionState<EditorState, FormData>(publishAction, {});
  const state = pubState.error || pubState.fieldErrors ? pubState : saveState;
  const formRef = useRef<HTMLFormElement>(null);

  const overrides = useMemo(() => {
    const o: Record<string, string> = {};
    for (const f of fields) if (values[f.path] !== f.def) o[f.path] = values[f.path];
    return o;
  }, [fields, values]);
  const dirty = fields.some((f) => values[f.path] !== initialValues[f.path]);
  const editedCount = Object.keys(overrides).length;
  const liveDiff = fields.filter((f) => (overrides[f.path] ?? f.def) !== (p.published[f.path] ?? f.def)).length;

  // Unsaved-change guard: browser leave/reload + clicks on in-app links.
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("[data-no-guard]")) return;
      if (!window.confirm("저장하지 않은 수정이 있어요. 이 페이지를 떠날까요?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  const q = query.trim().toLowerCase();
  const fieldMatches = (f: FieldNode) =>
    !q || f.path.toLowerCase().includes(q) || f.label.toLowerCase().includes(q) || f.def.toLowerCase().includes(q) || (values[f.path] ?? "").toLowerCase().includes(q);
  const nodeVisible = (n: TreeNode): boolean => (n.kind === "field" ? fieldMatches(n) : n.children.some(nodeVisible));
  const visibleCount = fields.filter(fieldMatches).length;

  const set = (path: string, v: string) => setValues((s) => ({ ...s, [path]: v }));

  const renderNode = (n: TreeNode, depth: number) => {
    if (!nodeVisible(n)) return null;
    if (n.kind === "field") {
      return (
        <FieldRow
          key={n.path}
          f={n}
          value={values[n.path] ?? n.def}
          liveValue={p.published[n.path] ?? n.def}
          error={state.fieldErrors?.[n.path]}
          other={showOther ? p.other[n.path] : undefined}
          otherLocale={p.otherLocale}
          locale={p.locale}
          onChange={(v) => set(n.path, v)}
        />
      );
    }
    return <GroupBox key={`${n.path}:${q ? "q" : ""}`} g={n} depth={depth} forceOpen={!!q} render={(c) => renderNode(c, depth + 1)} />;
  };

  return (
    <div className={cx("grid gap-6", previewOpen && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
      <form ref={formRef} action={saveAction} className="grid min-w-0 gap-5" noValidate>
        <input type="hidden" name="key" value={p.docKey} />
        <input type="hidden" name="locale" value={p.locale} />
        <input type="hidden" name="base" value={p.base} />
        <input type="hidden" name="overrides" value={JSON.stringify(overrides)} />

        <div className="sticky top-0 z-20 -mx-1 grid gap-3 border-b border-line bg-paper px-1 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="content-search">
              이 문서에서 찾기
            </label>
            <TextInput id="content-search" type="search" placeholder="문구·항목 이름 찾기" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
            <label className="flex min-h-11 items-center gap-2 text-[15px]">
              <input type="checkbox" checked={showOther} onChange={(e) => setShowOther(e.target.checked)} className="size-5" />
              {p.otherLocale === "en" ? "영어" : "한국어"} 문구 같이 보기
            </label>
            <Button variant="secondary" onClick={() => setPreviewOpen((o) => !o)}>
              {previewOpen ? "미리보기 닫기" : "미리보기 열기"}
            </Button>
            <a href={p.previewHref} target="_blank" rel="noreferrer" data-no-guard className={buttonClass("ghost")}>
              새 탭에서 미리보기
            </a>
          </div>
          <p className="text-[14px] text-gray" aria-live="polite">
            {q ? `${visibleCount}개 항목이 찾았어요 · ` : ""}전체 {fields.length}개 항목 · 기본값에서 바꾼 항목 {editedCount}개
            {liveDiff > 0 && ` · 공개 중인 내용과 다른 항목 ${liveDiff}개`}
            {dirty && <strong className="ml-2 text-[#7a5500]">저장하지 않은 수정이 있어요</strong>}
          </p>
        </div>

        {state.error && <Alert kind="error">{state.error}</Alert>}
        {p.staleCount > 0 && (
          <Alert kind="info">
            저장된 수정 중 {p.staleCount}개는 지금 기본 문구에 없는 항목이라 사이트에 쓰이지 않아요. 저장하면 정리돼요.
          </Alert>
        )}

        <div className="grid gap-4">{p.tree.map((n) => renderNode(n, 0))}</div>
        {q && visibleCount === 0 && <p className="text-gray">찾는 문구가 없어요.</p>}

        <div className="sticky bottom-0 z-20 grid gap-3 border-t-2 border-ink bg-paper py-3">
          <TextInput name="note" maxLength={200} placeholder="공개 메모 (선택) 예: 버튼 문구 수정" aria-label="공개 메모" />
          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton variant="secondary" pendingLabel="저장 중…">
              초안 저장
            </SubmitButton>
            <PublishButton action={pubAction} />
            <Button
              variant="ghost"
              disabled={editedCount === 0}
              onClick={() => {
                if (window.confirm("이 화면의 모든 문구를 코드 기본값으로 되돌릴까요? (저장하기 전까지는 사이트에 영향이 없어요)")) setValues(Object.fromEntries(fields.map((f) => [f.path, f.def])));
              }}
            >
              전체 기본값으로
            </Button>
            <Button
              variant="ghost"
              disabled={!dirty}
              onClick={() => {
                if (window.confirm("저장하지 않은 수정을 버릴까요?")) setValues(initialValues);
              }}
            >
              수정 취소
            </Button>
          </div>
          <p className="text-[14px] text-gray">‘초안 저장’은 공개 페이지에 영향이 없어요. ‘공개하기’를 눌러야 사이트에 반영돼요.</p>
        </div>
      </form>

      {previewOpen && (
        <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start" aria-label="미리보기">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="info">저장한 초안 기준</Badge>
            <Button variant="secondary" onClick={() => setPreviewTick((t) => t + 1)}>
              새로고침
            </Button>
            <Link href={p.publicHref} target="_blank" data-no-guard className={buttonClass("ghost")}>
              공개 페이지 보기
            </Link>
          </div>
          <iframe key={previewTick} title="초안 미리보기" src={`${p.previewHref}${p.previewHref.includes("?") ? "&" : "?"}t=${previewTick}`} className="h-[75svh] w-full border border-ink bg-paper" />
          <p className="mt-2 text-[14px] text-gray">입력 중인 내용은 ‘초안 저장’ 후에 미리보기에 나타나요.</p>
        </aside>
      )}
    </div>
  );
}

function PublishButton({ action }: { action: (fd: FormData) => void }) {
  return (
    <button
      type="submit"
      formAction={action}
      className={buttonClass("primary")}
      onClick={(e) => {
        if (!window.confirm("지금 사이트에 공개할까요? 방문자에게 바로 보여요.")) e.preventDefault();
      }}
    >
      공개하기
    </button>
  );
}

function GroupBox({ g, depth, forceOpen, render }: { g: GroupNode; depth: number; forceOpen: boolean; render: (c: TreeNode) => React.ReactNode }) {
  return (
    <details open={forceOpen || depth < 1 || undefined} className={cx("border border-line bg-paper", depth === 0 && "border-ink")}>
      <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-[16px] font-bold">
        <span>{g.label}</span>
        {g.sub && <span className="font-normal text-gray">{g.sub}</span>}
      </summary>
      <div className="grid gap-4 border-t border-line p-4">{g.children.map(render)}</div>
    </details>
  );
}

function FieldRow({
  f,
  value,
  liveValue,
  error,
  other,
  otherLocale,
  locale,
  onChange,
}: {
  f: FieldNode;
  value: string;
  liveValue: string;
  error?: string;
  other?: string;
  otherLocale: "ko" | "en";
  locale: "ko" | "en";
  onChange: (v: string) => void;
}) {
  const id = `f-${f.path}`;
  const edited = value !== f.def;
  const changedFromLive = value !== liveValue;
  const max = fieldMaxLength(f.def);
  const tokens = tokensOf(f.def);
  const tokenBad = !sameTokens(f.def, value);
  const msg = error ?? (tokenBad ? (tokens.length ? `${tokens.join(" ")} 표시를 기본 문구와 똑같이 넣어 주세요.` : "{ } 표시는 쓸 수 없어요.") : undefined);
  const hint = [tokens.length ? `자리표시 ${tokens.join(" ")} 는 그대로 두세요.` : "", `${value.length.toLocaleString("ko-KR")}자 / 최대 ${max.toLocaleString("ko-KR")}자`].filter(Boolean).join(" · ");
  const common = {
    id,
    value,
    lang: locale,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    "aria-invalid": msg ? (true as const) : undefined,
    "aria-describedby": `${id}-hint`,
    maxLength: max,
  };
  const rows = Math.min(10, Math.max(3, Math.ceil(Math.max(value.length, f.def.length) / 50) + (value.split("\n").length - 1)));
  return (
    <div className={cx("grid gap-1.5 border-l-4 pl-3", edited ? "border-[#f0a500]" : "border-transparent")}>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="text-[15px] font-bold">
          {f.label}
        </label>
        <code className="text-[12px] text-gray">{f.path}</code>
        {edited && <Badge tone="warn">수정됨</Badge>}
        {changedFromLive && <Badge tone="info">공개 중과 다름</Badge>}
        {edited && (
          <button type="button" className={buttonClass("ghost", "min-h-11 px-2 py-0 text-[14px]")} onClick={() => onChange(f.def)}>
            기본값으로 되돌리기
          </button>
        )}
      </div>
      {f.multiline ? <textarea {...common} rows={rows} className={cx("block w-full border bg-paper px-3 py-2 text-[16px] leading-relaxed", msg ? "border-[#b42318] bg-[#fff6f5]" : "border-ink")} /> : <input {...common} type="text" className={cx("block min-h-11 w-full border bg-paper px-3 py-2 text-[16px]", msg ? "border-[#b42318] bg-[#fff6f5]" : "border-ink")} />}
      <p id={`${id}-hint`} className={cx("text-[14px] leading-snug", msg ? "font-bold text-[#b42318]" : "text-gray")} role={msg ? "alert" : undefined}>
        {msg ?? hint}
      </p>
      <p className="whitespace-pre-wrap text-[14px] leading-snug text-gray" lang={locale}>
        <span className="font-bold">코드 기본값 </span>
        {f.def || "(빈 문구)"}
      </p>
      {other !== undefined && (
        <p className="whitespace-pre-wrap border-l-2 border-line pl-2 text-[14px] leading-snug" lang={otherLocale}>
          <span className="font-bold text-gray">{otherLocale === "en" ? "English " : "한국어 "}</span>
          {other || "(없음)"}
        </p>
      )}
    </div>
  );
}
