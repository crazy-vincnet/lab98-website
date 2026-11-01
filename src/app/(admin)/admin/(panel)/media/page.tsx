import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/admin/alert";
import { Badge } from "@/components/admin/badge";
import { Card } from "@/components/admin/card";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CopyButton } from "@/components/admin/copy-button";
import { AltForm } from "@/components/admin/media/alt-form";
import { UploadForm } from "@/components/admin/media/upload-form";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKst } from "@/lib/admin/format";
import { getMediaUsage, listMedia, USE_LABEL } from "@/lib/admin/media";
import { deleteMedia } from "./actions";

export const metadata: Metadata = { title: "미디어" };

const kb = (n: number | null) => (n == null ? "-" : n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`);

export default async function MediaPage() {
  await requireAdmin();
  let items: Awaited<ReturnType<typeof listMedia>> = [];
  let failed = false;
  try {
    items = await listMedia();
  } catch {
    failed = true;
  }
  const usage = failed ? new Map() : await getMediaUsage(items).catch(() => new Map<string, never[]>());

  return (
    <>
      <PageHeader title="미디어" description="이미지를 올리고 대체 텍스트를 관리해요. 글에서 쓰고 있는 이미지는 지울 수 없어요." />
      <div className="grid gap-6">
        <Card title="이미지 올리기">
          <UploadForm />
        </Card>

        {failed && <Alert kind="error">이미지 목록을 불러오지 못했어요. 새로고침해 주세요.</Alert>}

        <Card title={`올린 이미지 ${items.length}개`}>
          {items.length === 0 ? (
            <p className="py-6 text-center text-gray">아직 올린 이미지가 없어요.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((m) => {
                const uses = usage.get(m.id) ?? [];
                return (
                  <li key={m.id} className="flex flex-col border border-line">
                    <div className="flex h-44 items-center justify-center bg-concrete">
                      {/* eslint-disable-next-line @next/next/no-img-element -- storage URL */}
                      <img src={m.url} alt={m.alt_ko} loading="lazy" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="grid flex-1 content-start gap-3 p-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge>{m.width && m.height ? `${m.width}×${m.height}` : "크기 모름"}</Badge>
                        <Badge>{kb(m.size)}</Badge>
                        {!m.alt_en && <Badge tone="warn">영어 대체 텍스트 없음</Badge>}
                        {uses.length > 0 ? <Badge tone="info">글 {new Set(uses.map((u: { postId: string }) => u.postId)).size}개에서 사용</Badge> : <Badge>안 쓰는 중</Badge>}
                      </div>
                      <p className="text-[15px] leading-snug">{m.alt_ko}</p>
                      <p className="text-[13px] text-gray">{formatKst(m.created_at)}</p>
                      {uses.length > 0 && (
                        <ul className="grid gap-1 text-[14px]">
                          {uses.map((u: { postId: string; title: string; locale: string; as: keyof typeof USE_LABEL }) => (
                            <li key={`${u.postId}-${u.as}`}>
                              <Link href={`/admin/blog/${u.postId}`} className="underline underline-offset-4">
                                {u.title}
                              </Link>{" "}
                              <span className="text-gray">
                                ({u.locale === "en" ? "영어" : "한국어"} · {USE_LABEL[u.as]})
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <CopyButton value={m.url} label="주소 복사" />
                      </div>
                      <details className="border-t border-line pt-3">
                        <summary className="min-h-11 cursor-pointer py-2 text-[15px] font-bold">대체 텍스트 고치기</summary>
                        <div className="pt-2">
                          <AltForm id={m.id} altKo={m.alt_ko} altEn={m.alt_en} />
                        </div>
                      </details>
                      <form action={deleteMedia} className="border-t border-line pt-3">
                        <input type="hidden" name="id" value={m.id} />
                        {uses.length > 0 ? (
                          <p className="text-[14px] text-gray">글에서 쓰고 있어서 지울 수 없어요.</p>
                        ) : (
                          <ConfirmButton question="이 이미지를 지울까요?" confirmLabel="네, 지워요">
                            이미지 지우기
                          </ConfirmButton>
                        )}
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
