/**
 * Site chrome copy (header, footer, skip link, cookie banner, legal-page labels, 404). Korean source.
 * English twin: ./copy.en.ts (fully translated). Import `getChromeCopy(locale)` from there.
 */
import type { SiteInfo } from "@/lib/content";

export const chromeCopy = {
  skipToMain: "본문으로 건너뛰기",
  header: {
    homeAria: "Lab98 홈",
    cta: "프로젝트 문의",
    navAria: "주요 메뉴",
    mobileNavAria: "모바일 메뉴",
    menuOpen: "메뉴 열기",
    menuClose: "메뉴 닫기",
    switcherAria: "언어 선택",
  },
  footer: {
    company: "Company",
    services: "Services",
    follow: "Follow",
    companyLinks: { about: "회사 소개", process: "일하는 방식", projects: "프로젝트", praiseTool: "Praise Tool", insights: "인사이트", contact: "문의" },
    legalNavAria: "약관 및 정책",
    legal: { privacy: "개인정보처리방침", terms: "이용약관", cookies: "쿠키 정책", cookieSettings: "쿠키 설정", privacyRequest: "개인정보 요청", unsubscribe: "수신거부" },
    businessLine: (site: Pick<SiteInfo, "name" | "business">) =>
      [
        `${site.name}은 ${site.business.name}의 브랜드예요`,
        `대표 ${site.business.representative}`,
        `사업자등록번호 ${site.business.registrationNumber}`,
        site.business.address && `주소 ${site.business.address}`,
      ].filter(Boolean) as string[],
  },
  legalDoc: {
    effective: "시행일",
    bizLine: (biz: SiteInfo["business"]) => ({
      prefix: `상호 ${biz.name} · 대표 ${biz.representative} · 사업자등록번호 ${biz.registrationNumber}`,
      address: biz.address ? ` · 주소 ${biz.address}` : "",
      contact: " · 문의 ",
    }),
    toc: "목차",
    history: "변경 이력",
  },
  cookieBanner: {
    region: "쿠키 안내",
    title: "쿠키 안내",
    body: "Lab98은 지금 광고·추적 쿠키를 쓰지 않아요. 앞으로 방문 통계 도구를 쓰게 되면, 동의하신 경우에만 사용할게요.",
    essentialOnly: "필수만 사용",
    allowAnalytics: "통계 쿠키 허용",
    settings: "설정",
    policy: "쿠키 정책",
    panelTitle: "쿠키 설정",
    essential: { name: "필수", state: "항상 사용", desc: "쿠키 동의 선택을 기억하는 저장소예요." },
    analytics: { name: "통계", desc: "방문 통계 — 지금은 사용하는 도구가 없어요." },
    save: "선택 저장",
    close: "닫기",
    saved: { essential: "필수만 사용하도록 저장했어요.", analytics: "통계 쿠키를 허용하도록 저장했어요." },
  },
  notFound: {
    metaTitle: "페이지를 찾을 수 없어요",
    metaDescription: "주소가 바뀌었거나 더 이상 운영하지 않는 페이지예요.",
    label: "404 · Not shipped",
    title: "찾으시는 페이지가 없어요",
    lead: "주소가 바뀌었거나 더 이상 운영하지 않는 페이지예요. 아래에서 원하는 곳으로 이동해 주세요.",
    home: "홈으로 가기",
    projects: "프로젝트 사례 보기",
  },
} as const;
