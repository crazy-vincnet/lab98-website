import type { Metadata } from "next";
import { Alert } from "@/components/admin/alert";
import { Card } from "@/components/admin/card";
import { CopyButton } from "@/components/admin/copy-button";
import { PageHeader } from "@/components/admin/page-header";
import { SearchChecks, VerificationForm } from "@/components/admin/search-forms";
import { requireAdmin } from "@/lib/admin/auth";
import { site } from "@/lib/content";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { SEARCH_SETTINGS_KEY } from "@/lib/site-settings";

export const metadata: Metadata = { title: "SEO·검색 등록" };

const ext = "underline underline-offset-4";

export default async function SearchPage() {
  await requireAdmin();
  const { data } = await getInsforgeAdmin().database.from("site_settings").select("value").eq("key", SEARCH_SETTINGS_KEY).limit(1);
  const saved = (Array.isArray(data) ? data[0]?.value : null) as { google?: string; naver?: string } | null;
  const sitemapUrl = `${site.url}/sitemap.xml`;

  return (
    <>
      <PageHeader title="SEO·검색 등록" description="구글과 네이버에 사이트를 등록할 때 필요한 값과 점검 도구예요." />
      <div className="grid gap-6">
        <Card title="1. 소유권 인증 코드">
          <div className="grid gap-4">
            <VerificationForm google={saved?.google ?? ""} naver={saved?.naver ?? ""} />
            <Alert>저장하면 다시 배포하지 않아도 홈페이지의 &lt;meta&gt; 태그가 바뀌어요. 아래 점검으로 확인할 수 있어요.</Alert>
          </div>
        </Card>

        <Card title="2. 사이트맵 주소">
          <div className="flex flex-wrap items-center gap-3">
            <code className="break-all bg-concrete px-2 py-1 font-mono text-[15px]">{sitemapUrl}</code>
            <CopyButton value={sitemapUrl} label="주소 복사" />
          </div>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
            <a className={ext} href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Google Search Console 열기</a>
            <a className={ext} href="https://searchadvisor.naver.com" target="_blank" rel="noopener noreferrer">네이버 서치어드바이저 열기</a>
          </p>
        </Card>

        <Card title="3. 지금 상태 점검">
          <SearchChecks />
        </Card>

        <Card title="4. 등록 방법">
          <div className="grid gap-3">
            <details className="border border-line p-3" open>
              <summary className="cursor-pointer text-[16px] font-bold">Google Search Console</summary>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
                <li>Search Console에 구글 계정으로 로그인해요.</li>
                <li>왼쪽 위 속성 선택에서 <b>속성 추가</b>를 눌러요.</li>
                <li><b>URL 접두어</b>를 고르고 <code className="font-mono">{site.url}/</code>를 넣어요.</li>
                <li>소유권 확인 방법에서 <b>HTML 태그</b>를 펼쳐 &lt;meta&gt; 태그를 복사해요.</li>
                <li>위 &quot;구글 인증 코드&quot; 칸에 붙여 넣고 <b>저장</b>해요. 코드만 남겨서 저장돼요.</li>
                <li>&quot;지금 점검하기&quot;에서 구글 태그가 <b>정상</b>인지 확인해요.</li>
                <li>Search Console로 돌아와 <b>확인</b>을 눌러요.</li>
                <li>왼쪽 메뉴 <b>Sitemaps</b>에서 <code className="font-mono">sitemap.xml</code>을 제출해요.</li>
              </ol>
            </details>
            <details className="border border-line p-3">
              <summary className="cursor-pointer text-[16px] font-bold">네이버 서치어드바이저</summary>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
                <li>서치어드바이저에 네이버 계정으로 로그인해요.</li>
                <li><b>웹마스터 도구</b>에서 <b>사이트 등록</b>을 눌러 <code className="font-mono">{site.url}</code>를 넣어요.</li>
                <li>소유확인 방법 중 <b>HTML 태그</b>를 골라 &lt;meta&gt; 태그를 복사해요.</li>
                <li>위 &quot;네이버 인증 코드&quot; 칸에 붙여 넣고 <b>저장</b>해요.</li>
                <li>&quot;지금 점검하기&quot;에서 네이버 태그가 <b>정상</b>인지 확인해요.</li>
                <li>서치어드바이저로 돌아와 <b>소유확인</b>을 눌러요.</li>
                <li><b>요청 &gt; 사이트맵 제출</b>에서 <code className="font-mono">{sitemapUrl}</code>을 넣어요.</li>
                <li><b>요청 &gt; RSS 제출</b>에는 <code className="font-mono">{site.url}/insights/rss.xml</code>을 넣을 수 있어요.</li>
              </ol>
            </details>
            <p className="text-[14px] text-gray">등록 뒤 검색에 나오기까지 며칠에서 몇 주가 걸릴 수 있어요.</p>
          </div>
        </Card>
      </div>
    </>
  );
}
