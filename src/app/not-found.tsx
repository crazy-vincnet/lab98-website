import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";
import { PROJECTS_PATH } from "@/components/experiments/paths";

// Copy: docs/copy-guide.md §5-5
export const metadata: Metadata = { title: "페이지를 찾을 수 없어요", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="wrap py-20 md:py-32">
      <p className="label text-gray">404 · Not shipped</p>
      <div className="mt-8 max-w-[560px] border-2 border-ink bg-ink p-5 font-mono text-code text-ink-text">
        <p>
          $ <span className="text-paper">lab98 open ./page</span>
        </p>
        <p className="text-red-text-dark">✕ page not found</p>
      </div>
      <h1 className="mt-10 text-h1 text-balance">찾으시는 페이지가 없어요</h1>
      <p className="mt-5 max-w-[560px] text-lead text-gray text-pretty">
        주소가 바뀌었거나 더 이상 운영하지 않는 페이지예요. 아래에서 원하는 곳으로 이동해 주세요.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <ButtonLink href="/">홈으로 가기</ButtonLink>
        <ButtonLink href={PROJECTS_PATH} variant="secondary">
          프로젝트 사례 보기
        </ButtonLink>
      </div>
    </section>
  );
}
