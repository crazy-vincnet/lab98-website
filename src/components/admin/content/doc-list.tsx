import { Badge } from "../badge";
import { LinkButton } from "../button";
import { Alert } from "../alert";
import { PageHeader } from "../page-header";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "../table";
import { formatKst } from "@/lib/admin/format";
import { listRows, type ContentRow } from "@/lib/admin/content";
import { CONTENT_DOCS, CONTENT_GROUPS, type ContentGroup } from "@/lib/content-registry";

function Status({ row }: { row: ContentRow | undefined }) {
  if (!row) return <span className="text-gray">기본값</span>;
  const edited = Object.keys(row.data).length;
  return (
    <span className="grid gap-1">
      <span>{row.version > 0 ? `공개 v${row.version} · 수정 ${edited}곳` : "아직 공개 안 함"}</span>
      {row.draft && <Badge tone="warn">초안 있음 · {formatKst(row.draft_updated_at)}</Badge>}
    </span>
  );
}

/** Server component: the document list for some groups. The calling page must have run requireAdmin(). */
export async function DocList({ title, description, groups }: { title: string; description: string; groups: readonly ContentGroup[] }) {
  let rows: ContentRow[] = [];
  let failed = false;
  try {
    rows = await listRows();
  } catch {
    failed = true;
  }
  const byKey = new Map(rows.map((r) => [`${r.key}:${r.locale}`, r]));
  const ordered = CONTENT_GROUPS.filter((g) => groups.includes(g));
  return (
    <>
      <PageHeader title={title} description={description} />
      {failed && (
        <Alert kind="error" className="mb-4">
          수정 상태를 불러오지 못했어요. 새로고침해 주세요.
        </Alert>
      )}
      <div className="grid gap-8">
        {ordered.map((g) => {
          const docs = CONTENT_DOCS.filter((d) => d.group === g);
          return (
            <section key={g} aria-labelledby={`g-${g}`}>
              <h2 id={`g-${g}`} className="mb-2 text-[19px] font-bold">
                {g}
              </h2>
              <Table caption={`${g} 문서`}>
                <THead>
                  <Tr>
                    <Th>문서</Th>
                    <Th>한국어</Th>
                    <Th>English</Th>
                    <Th>
                      <span className="sr-only">편집</span>
                    </Th>
                  </Tr>
                </THead>
                <TBody>
                  {docs.length === 0 && <EmptyRow cols={4}>아직 이 영역의 문구는 연결 전이에요. 연결되면 여기에 나타나요.</EmptyRow>}
                  {docs.map((d) => (
                    <Tr key={d.key}>
                      <Td>
                        <p className="font-bold">{d.titleKo}</p>
                        {d.description && <p className="text-[14px] text-gray">{d.description}</p>}
                        <code className="text-[12px] text-gray">{d.key}</code>
                      </Td>
                      <Td>
                        <Status row={byKey.get(`${d.key}:ko`)} />
                      </Td>
                      <Td>
                        <Status row={byKey.get(`${d.key}:en`)} />
                      </Td>
                      <Td className="whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          <LinkButton href={`/admin/content/${d.key}?locale=ko`}>한국어 편집</LinkButton>
                          <LinkButton href={`/admin/content/${d.key}?locale=en`}>English 편집</LinkButton>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </section>
          );
        })}
      </div>
    </>
  );
}
