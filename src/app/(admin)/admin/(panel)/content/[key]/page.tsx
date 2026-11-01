import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert } from "@/components/admin/alert";
import { Badge } from "@/components/admin/badge";
import { LinkButton } from "@/components/admin/button";
import { Card } from "@/components/admin/card";
import { ContentEditor } from "@/components/admin/content/content-editor";
import { DiscardDraft, VersionHistory } from "@/components/admin/content/version-history";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/admin/auth";
import { getRow, listVersions } from "@/lib/admin/content";
import { buildTree } from "@/lib/admin/content-tree";
import { formatKst } from "@/lib/admin/format";
import { getDoc } from "@/lib/content-registry";
import { flattenStrings, mergeOverrides } from "@/lib/copy-merge";
import { CONTENT_KEY_RE } from "@/lib/copy-store";
import { isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = { title: "문구 편집" };

export default async function ContentEditorPage({ params, searchParams }: PageProps<"/admin/content/[key]">) {
  await requireAdmin();
  const { key } = await params;
  const sp = await searchParams;
  const doc = CONTENT_KEY_RE.test(key) ? getDoc(key) : undefined;
  if (!doc) notFound();
  const locale: Locale = isLocale(sp.locale) ? sp.locale : "ko";
  const otherLocale: Locale = locale === "ko" ? "en" : "ko";

  const [defaults, otherDefaults, row, otherRow] = await Promise.all([doc.defaults[locale](), doc.defaults[otherLocale](), getRow(key, locale), getRow(key, otherLocale)]);
  let versions: Awaited<ReturnType<typeof listVersions>> = [];
  let historyFailed = false;
  try {
    versions = await listVersions(key, locale);
  } catch {
    historyFailed = true;
  }

  const tree = buildTree(defaults, { skip: doc.skip, labels: doc.labels });
  const leaves = flattenStrings(defaults, doc.skip);
  const known = new Set(leaves.map((l) => l.path));
  const working = row?.draft ?? row?.data ?? {};
  const initial = Object.fromEntries(Object.entries(working).filter(([p]) => known.has(p)));
  const published = Object.fromEntries(Object.entries(row?.data ?? {}).filter(([p]) => known.has(p)));
  const staleCount = Object.keys(working).filter((p) => !known.has(p)).length;

  // Effective text of the other language (its draft if any), keyed by path, for the side-by-side view.
  const otherMerged = mergeOverrides(otherDefaults, otherRow?.draft ?? otherRow?.data ?? {}, doc.skip);
  const other = Object.fromEntries(flattenStrings(otherMerged, doc.skip).map((l) => [l.path, l.value]));

  const labelMap = new Map<string, string>();
  const walkLabels = (nodes: ReturnType<typeof buildTree>, prefix: string) => {
    for (const n of nodes) {
      const l = prefix ? `${prefix} › ${n.label}` : n.label;
      if (n.kind === "field") labelMap.set(n.path, l);
      else walkLabels(n.children, n.sub ? `${l} (${n.sub})` : l);
    }
  };
  walkLabels(tree, "");

  const base = row?.updated_at ?? "";
  const q = `?locale=${locale}`;
  return (
    <>
      <PageHeader
        title={doc.titleKo}
        description={doc.description}
        actions={
          <>
            <LinkButton href={`/admin/content/${key}?locale=ko`} variant={locale === "ko" ? "primary" : "secondary"} aria-current={locale === "ko" ? "true" : undefined}>
              한국어
            </LinkButton>
            <LinkButton href={`/admin/content/${key}?locale=en`} variant={locale === "en" ? "primary" : "secondary"} aria-current={locale === "en" ? "true" : undefined}>
              English
            </LinkButton>
            <LinkButton href="/admin/content">목록으로</LinkButton>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[15px]">
        <Badge tone={row && row.version > 0 ? "ok" : "neutral"}>{row && row.version > 0 ? `공개 중 · 버전 ${row.version} · ${formatKst(row.published_at)}` : "아직 공개한 수정 없음 (기본값 사용 중)"}</Badge>
        {row?.draft && <Badge tone="warn">초안 있음 · {formatKst(row.draft_updated_at)} · {row.draft_updated_by}</Badge>}
        <code className="text-[12px] text-gray">{key}</code>
      </div>
      {row?.draft && (
        <Alert kind="info" className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>저장해 둔 초안을 불러왔어요. 공개 페이지는 아직 이전 내용이에요.</span>
            <DiscardDraft docKey={key} locale={locale} base={base} />
          </div>
        </Alert>
      )}
      <ContentEditor
        key={`${key}:${locale}:${base}`}
        docKey={key}
        locale={locale}
        tree={tree}
        initial={initial}
        published={published}
        other={other}
        otherLocale={otherLocale}
        base={base}
        previewHref={`/admin/content/${key}/preview${q}`}
        publicHref={doc.publicPath(locale)}
        staleCount={staleCount}
      />
      <div className="mt-10">
        <Card title="공개 기록 (최근 20개)" actions={<LinkButton href="/admin/audit" variant="ghost">감사 로그 보기</LinkButton>}>
          {historyFailed ? (
            <Alert kind="error">기록을 불러오지 못했어요. 새로고침해 주세요.</Alert>
          ) : (
            <VersionHistory
              docKey={key}
              locale={locale}
              base={base}
              versions={versions}
              live={published}
              defaults={new Map(leaves.map((l) => [l.path, l.value]))}
              labels={labelMap}
              currentVersion={row?.version ?? 0}
            />
          )}
        </Card>
      </div>
    </>
  );
}
