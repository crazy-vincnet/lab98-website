import { Badge } from "../badge";
import { ConfirmButton } from "../confirm-button";
import { Card } from "../card";
import { formatKst } from "@/lib/admin/format";
import type { VersionRow } from "@/lib/admin/content";
import { discardDraftAction, restoreVersionAction } from "@/app/(admin)/admin/(panel)/content/actions";
import type { FlatOverrides } from "@/lib/copy-merge";

type Line = { path: string; label: string; current: string; version: string };

/** Differences between a snapshot and the live text. Missing overrides count as the code default. */
function diff(defaults: Map<string, string>, labels: Map<string, string>, live: FlatOverrides, snap: FlatOverrides): Line[] {
  const paths = new Set([...Object.keys(live), ...Object.keys(snap)]);
  const out: Line[] = [];
  for (const path of paths) {
    const d = defaults.get(path);
    if (d === undefined) continue;
    const cur = live[path] ?? d;
    const old = snap[path] ?? d;
    if (cur !== old) out.push({ path, label: labels.get(path) ?? path, current: cur, version: old });
  }
  return out;
}

export function VersionHistory({
  docKey,
  locale,
  base,
  versions,
  live,
  defaults,
  labels,
  currentVersion,
}: {
  docKey: string;
  locale: "ko" | "en";
  base: string;
  versions: VersionRow[];
  live: FlatOverrides;
  defaults: Map<string, string>;
  labels: Map<string, string>;
  currentVersion: number;
}) {
  if (versions.length === 0) return <p className="text-gray">아직 공개한 기록이 없어요. 처음 공개하면 여기에 쌓여요.</p>;
  return (
    <ul className="grid gap-3">
      {versions.map((v) => {
        const lines = diff(defaults, labels, live, v.data);
        const isCurrent = v.version === currentVersion;
        return (
          <li key={v.version}>
            <Card
              title={
                <span className="flex flex-wrap items-center gap-2">
                  버전 {v.version}
                  {isCurrent && <Badge tone="ok">현재 공개 중</Badge>}
                </span>
              }
            >
              <p className="text-[14px] text-gray">
                {formatKst(v.created_at)} · {v.created_by ?? "-"} · 수정 {Object.keys(v.data).length}곳{v.note ? ` · ${v.note}` : ""}
              </p>
              <details className="mt-2">
                <summary className="min-h-11 cursor-pointer py-2 text-[15px] font-bold">{isCurrent ? "이 버전의 내용" : `현재와 다른 곳 ${lines.length}개 보기`}</summary>
                {isCurrent || lines.length === 0 ? (
                  <p className="text-[14px] text-gray">현재 공개 중인 내용과 같아요.</p>
                ) : (
                  <ul className="grid gap-3">
                    {lines.slice(0, 40).map((l) => (
                      <li key={l.path} className="text-[14px] leading-snug">
                        <p className="font-bold">
                          {l.label} <code className="font-normal text-gray">{l.path}</code>
                        </p>
                        <p className="whitespace-pre-wrap bg-[#fde4e2] px-2 py-1" lang={locale}>
                          <span className="font-bold">현재 </span>
                          {l.current}
                        </p>
                        <p className="whitespace-pre-wrap bg-[#dcf5ea] px-2 py-1" lang={locale}>
                          <span className="font-bold">버전 {v.version} </span>
                          {l.version}
                        </p>
                      </li>
                    ))}
                    {lines.length > 40 && <li className="text-gray">외 {lines.length - 40}개…</li>}
                  </ul>
                )}
              </details>
              {!isCurrent && (
                <form action={restoreVersionAction} className="mt-2">
                  <input type="hidden" name="key" value={docKey} />
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="version" value={v.version} />
                  <input type="hidden" name="base" value={base} />
                  <ConfirmButton question={`버전 ${v.version} 내용을 새 버전으로 바로 공개할까요? 작성 중인 초안은 사라져요.`} confirmLabel="네, 복원해요" variant="primary">
                    이 버전으로 복원
                  </ConfirmButton>
                </form>
              )}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export function DiscardDraft({ docKey, locale, base }: { docKey: string; locale: "ko" | "en"; base: string }) {
  return (
    <form action={discardDraftAction}>
      <input type="hidden" name="key" value={docKey} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="base" value={base} />
      <ConfirmButton question="초안을 버리고 공개 중인 내용으로 돌아갈까요?" confirmLabel="네, 버려요">
        초안 버리기
      </ConfirmButton>
    </form>
  );
}
