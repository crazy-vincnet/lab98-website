import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getRow } from "@/lib/admin/content";
import { getDoc } from "@/lib/content-registry";
import { toFlatOverrides } from "@/lib/copy-merge";
import { CONTENT_KEY_RE, enableCopyPreview } from "@/lib/copy-store";
import { isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = { title: "문구 미리보기" };

/**
 * Renders the REAL public component of a registry document with the saved DRAFT applied (falls back to published when there is no draft).
 * Preview is switched on only here, after requireAdmin(), through enableCopyPreview(): never via a public query parameter.
 */
export default async function ContentPreviewPage({ params, searchParams }: PageProps<"/admin/content/[key]/preview">) {
  const admin = await requireAdmin();
  const { key } = await params;
  const sp = await searchParams;
  const doc = CONTENT_KEY_RE.test(key) ? getDoc(key) : undefined;
  if (!doc) notFound();
  const locale: Locale = isLocale(sp.locale) ? sp.locale : "ko";
  const row = await getRow(key, locale);
  enableCopyPreview(admin, key, locale, toFlatOverrides(row?.draft ?? row?.data));
  const node = await doc.render(locale);
  return (
    <div lang={locale}>
      <div className="sticky top-0 z-[100] border-b-2 border-ink bg-[#fdf1cf] px-4 py-2 text-[14px]" lang="ko">
        <strong>{row?.draft ? "초안 미리보기" : "공개 중인 내용"}</strong> · 저장한 초안이 적용된 화면이에요. 방문자에게는 ‘공개하기’ 전까지 보이지 않아요.
      </div>
      {node}
    </div>
  );
}
