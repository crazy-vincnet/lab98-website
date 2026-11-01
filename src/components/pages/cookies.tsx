import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { ORG_ID, breadcrumb, graph, webPage } from "@/lib/structured-data";
import Link from "next/link";
import { site } from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n";
import { PRIVACY_PATH } from "@/components/experiments/paths";
import { LegalDoc, LegalTable, type LegalSection } from "@/components/legal/legal-doc";
import { OpenCookieSettingsButton } from "@/components/legal/open-cookie-settings-button";

/**
 * 쿠키 정책. Facts: the site sets no cookies and loads no third-party scripts; the only browser storage is
 * the consent choice (localStorage `lab98-consent`). If analytics is added, update this page (and /privacy §9) first.
 */
const PATH = "/cookies";



const EFFECTIVE_DATE = "2026년 11월 1일"; // TODO(en): "November 1, 2026" once the English text exists
const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;

const buildSections = (L: Locale): LegalSection[] => [
  {
    id: "what",
    title: "쿠키란",
    body: <p>쿠키는 웹사이트가 방문자의 브라우저에 저장하는 작은 텍스트 파일이에요. 브라우저 저장소(localStorage)도 비슷하게 브라우저 안에 정보를 남기는 방법이에요. 이 정책에서는 둘을 함께 “쿠키 등”이라고 불러요.</p>,
  },
  {
    id: "used",
    title: "지금 Lab98이 쓰는 것",
    body: (
      <>
        <p>지금 이 웹사이트는 쿠키를 설정하지 않아요. 브라우저에 저장하는 것은 아래 한 가지뿐이에요.</p>
        <LegalTable
          caption="사용 중인 브라우저 저장 항목"
          columns={["이름", "종류", "목적", "분류", "보관 기간"]}
          rows={[
            [
              <code key="n" className="font-mono text-code">
                lab98-consent
              </code>,
              "브라우저 저장소(localStorage)",
              "쿠키 동의 선택과 선택한 날짜를 기억해 방문할 때마다 다시 묻지 않도록 해요",
              "필수",
              "직접 삭제하거나 선택을 바꿀 때까지",
            ],
          ]}
        />
        <p>이 값은 방문자의 브라우저에만 남고, 회사 서버로 보내지 않아요.</p>
      </>
    ),
  },
  {
    id: "not-used",
    title: "쓰지 않는 것",
    body: (
      <ul>
        <li>광고 쿠키, 추적 쿠키, 분석(방문 통계) 쿠키를 쓰지 않아요.</li>
        <li>분석·광고 도구 같은 외부 스크립트를 불러오지 않아요. 글꼴도 외부 서비스가 아니라 이 사이트에서 직접 제공해요.</li>
        <li>로그인이 없어서 로그인 쿠키도 없어요.</li>
      </ul>
    ),
  },
  {
    id: "analytics",
    title: "분석 쿠키를 도입하게 되면",
    body: (
      <ul>
        <li>방문 통계 도구를 도입하면 이 정책과 개인정보처리방침을 먼저 고쳐 알릴게요.</li>
        <li>그 도구는 방문자가 쿠키 설정에서 “분석” 항목에 동의한 경우에만 작동해요. 동의하지 않으면 작동하지 않아요.</li>
      </ul>
    ),
  },
  {
    id: "change",
    title: "선택 바꾸기",
    body: (
      <>
        <p>아래 버튼으로 언제든 쿠키 설정을 다시 열어 선택을 바꿀 수 있어요. 사이트 맨 아래의 “쿠키 설정”에서도 열 수 있어요.</p>
        <div>
          <OpenCookieSettingsButton className="inline-flex min-h-11 cursor-pointer items-center justify-center border-2 border-ink bg-paper px-5 py-3.5 text-[15px] font-bold leading-none text-ink transition-colors hover:bg-ink hover:text-paper">
            쿠키 설정 열기
          </OpenCookieSettingsButton>
        </div>
      </>
    ),
  },
  {
    id: "browser",
    title: "브라우저에서 삭제하는 법",
    body: (
      <>
        <p>브라우저에 저장된 쿠키 등은 브라우저 설정에서 직접 지울 수 있어요. 메뉴 이름은 버전에 따라 조금 다를 수 있어요.</p>
        <ul>
          <li>Chrome: 설정 → 개인 정보 보호 및 보안 → 서드 파티 쿠키(또는 사이트 설정) → 모든 사이트 데이터 및 권한 보기 → lab98.io 삭제</li>
          <li>Safari(Mac): 설정 → 개인정보 보호 → 웹사이트 데이터 관리 → lab98.io 선택 후 제거</li>
          <li>Safari(iPhone): 설정 → 앱 → Safari → 고급 → 웹사이트 데이터 → lab98.io 삭제</li>
          <li>Edge: 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터 관리 및 삭제 → 모든 쿠키 및 사이트 데이터 보기 → lab98.io 삭제</li>
          <li>Firefox: 설정 → 개인 정보 및 보안 → 쿠키 및 사이트 데이터 → 데이터 관리 → lab98.io 선택 후 삭제</li>
        </ul>
        <p>저장된 선택을 지우면 다음 방문 때 쿠키 동의를 다시 물어봐요.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "문의",
    body: (
      <p>
        쿠키 정책에 궁금한 점이 있으면 {mail}로 연락해 주세요. 개인정보 처리 전반은 <Link href={localePath(L, PRIVACY_PATH)}>개인정보처리방침</Link>에서 확인할 수 있어요.
      </p>
    ),
  },
];

const history = {
  ko: [{ date: "2026. 11. 01", note: "제정" }],
  en: [{ date: "2026. 11. 01", note: "Established" }],
} as const;

const docMeta: Record<Locale, { title: string; description: string }> = {
  ko: { title: "쿠키 정책", description: `${site.name} 웹사이트는 쿠키를 쓰지 않아요. 브라우저에 저장하는 동의 선택 하나와 쓰지 않는 것, 선택을 바꾸고 지우는 방법을 안내해요.` },
  en: {
    title: 'Cookie Policy',
    // TODO(en): review wording
    description: 'The Lab98 website does not use cookies. It explains the one consent choice stored in your browser, what we do not use, and how to change or clear your choice.',
  },
};

export const cookiesMetadata = (locale: Locale): Metadata => pageMetadata({ ...docMeta[locale], path: PATH, locale });

export function CookiesPage({ locale }: { locale: Locale }) {
  const { title, description } = docMeta[locale];
  const path = localePath(locale, PATH);
  const crumbs = [{ name: title, path }];
  const jsonLd = graph(webPage({ path, name: title, description, crumbs, extra: { publisher: { "@id": ORG_ID } }, locale }), breadcrumb(path, crumbs, locale));
  return (
    <>
      <JsonLd data={jsonLd} />
      <LegalDoc
        locale={locale}
        label="Cookies"
        title={title}
        // TODO(en): the intro and every section below are still the Korean text on /en
        intro={<p>Lab98 웹사이트가 브라우저에 무엇을 저장하는지, 무엇을 저장하지 않는지, 선택을 어떻게 바꾸는지 안내해요.</p>}
        effectiveDate={EFFECTIVE_DATE}
        sections={buildSections(locale)}
        history={[...history[locale]]}
      />
    </>
  );
}
