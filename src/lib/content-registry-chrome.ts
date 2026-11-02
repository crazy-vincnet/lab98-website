import "server-only";
import { createElement, Fragment } from "react";
import type { ContentDoc } from "@/lib/content-registry";
import type { Locale } from "@/lib/i18n";

/**
 * Registry entries of stage 4b agent C: site chrome (header, cookie banner, legal-page labels, 404, skip link),
 * the two privacy forms and the SEO/meta documents. Spread into CONTENT_DOCS by content-registry.ts.
 */
const prefix = (l: Locale) => (l === "en" ? "/en" : "");
const chromeDefaults = (pick: (c: ReturnType<typeof import("@/components/chrome/copy.en").getChromeCopy>) => unknown) => ({
  ko: async () => pick((await import("@/components/chrome/copy.en")).getChromeCopy("ko")),
  en: async () => pick((await import("@/components/chrome/copy.en")).getChromeCopy("en")),
});

/** Preview of the seo.* documents: a read-only search-result snippet (the page itself cannot show <title>). */
const seoPreview = (key: string) => async (locale: Locale) =>
  createElement((await import("@/components/admin/content/seo-snippet-preview")).SeoSnippetPreview, { docKey: key, locale });

const seoDefaults = <T,>(pick: (m: typeof import("@/components/seo/seo-copy"), l: Locale) => T) => ({
  ko: async () => pick(await import("@/components/seo/seo-copy"), "ko"),
  en: async () => pick(await import("@/components/seo/seo-copy"), "en"),
});

const seoNote = " 검색 결과 제목·설명과 공유(카카오톡·SNS) 미리보기에 쓰여요. 고친 내용은 ‘공개하기’ 후 검색엔진이 다시 읽을 때 반영돼요.";
const seoLabels = { title: "제목", description: "설명" };

export const CHROME_CONTENT_DOCS: ContentDoc[] = [
  {
    key: "chrome.header",
    titleKo: "사이트 공통 · 머리글",
    group: "사이트 공통",
    description: "모든 페이지 맨 위 머리글의 문의 버튼, 메뉴 열기·닫기, 스크린리더용 설명. (메뉴 이름은 ‘사이트 메뉴’ 문서)",
    defaults: chromeDefaults((c) => c.header),
    render: async (locale) => createElement((await import("@/components/site-header")).SiteHeader, { locale }),
    publicPath: (l) => `${prefix(l)}/`,
    labels: {
      homeAria: "로고 링크 설명(스크린리더)",
      cta: "문의 버튼",
      navAria: "주요 메뉴 설명(스크린리더)",
      mobileNavAria: "모바일 메뉴 설명(스크린리더)",
      menuOpen: "메뉴 열기 버튼 설명",
      menuClose: "메뉴 닫기 버튼 설명",
      switcherAria: "언어 선택 설명(스크린리더)",
    },
  },
  {
    key: "chrome.skip",
    titleKo: "사이트 공통 · 본문 바로가기",
    group: "사이트 공통",
    description: "키보드로 Tab을 누르면 맨 처음 나타나는 ‘본문으로 건너뛰기’ 링크.",
    defaults: {
      ko: async () => (await import("@/components/skip-link")).skipDefaults("ko"),
      en: async () => (await import("@/components/skip-link")).skipDefaults("en"),
    },
    render: async (locale) => createElement((await import("@/components/skip-link")).SkipLink, { locale, demo: true }),
    publicPath: (l) => `${prefix(l)}/`,
    labels: { skipToMain: "바로가기 링크 글자" },
  },
  {
    key: "chrome.cookieBanner",
    titleKo: "사이트 공통 · 쿠키 안내 배너",
    group: "사이트 공통",
    description: "화면 아래 쿠키 안내 배너와 ‘쿠키 설정’ 패널의 모든 문구.",
    defaults: chromeDefaults((c) => c.cookieBanner),
    render: async (locale) => {
      // The banner only shows while no choice is stored in this browser: the footer's "쿠키 설정" button reopens it.
      const [{ CookieBanner }, { SiteFooter }] = await Promise.all([import("@/components/consent/cookie-banner"), import("@/components/site-footer")]);
      return createElement(Fragment, null, createElement(CookieBanner, { locale }), createElement(SiteFooter, { locale }));
    },
    publicPath: (l) => `${prefix(l)}/`,
    labels: {
      region: "배너 영역 설명(스크린리더)",
      title: "배너 제목",
      body: "배너 안내 문장",
      essentialOnly: "‘필수만 사용’ 버튼",
      allowAnalytics: "‘통계 쿠키 허용’ 버튼",
      settings: "‘설정’ 버튼",
      policy: "쿠키 정책 링크 글자",
      panelTitle: "설정 패널 제목",
      "essential.name": "필수 쿠키 · 이름",
      "essential.state": "필수 쿠키 · 상태",
      "essential.desc": "필수 쿠키 · 설명",
      "analytics.name": "통계 쿠키 · 이름",
      "analytics.desc": "통계 쿠키 · 설명",
      save: "‘선택 저장’ 버튼",
      close: "‘닫기’ 버튼",
      "saved.essential": "저장 알림 · 필수만",
      "saved.analytics": "저장 알림 · 통계 허용",
    },
  },
  {
    key: "chrome.legalDoc",
    titleKo: "사이트 공통 · 약관 문서 공통 라벨",
    group: "사이트 공통",
    description: "개인정보처리방침·이용약관·쿠키 정책 맨 위/아래의 ‘시행일’, ‘목차’, ‘변경 이력’, 사업자 정보 줄.",
    defaults: chromeDefaults((c) => c.legalDoc),
    render: async (locale) => createElement((await import("@/components/pages/privacy")).PrivacyPage, { locale }),
    publicPath: (l) => `${prefix(l)}/privacy`,
    labels: {
      effective: "‘시행일’ 라벨",
      bizPrefix: "사업자 정보 줄 ({name} 상호, {representative} 대표, {registrationNumber} 사업자등록번호)",
      bizAddress: "사업자 정보 줄 · 주소 ({address}) — 주소가 있을 때만 나와요",
      bizContact: "사업자 정보 줄 · 문의 앞 글자",
      toc: "‘목차’ 제목",
      history: "‘변경 이력’ 제목",
    },
  },
  {
    key: "chrome.notFound",
    titleKo: "사이트 공통 · 404 페이지",
    group: "사이트 공통",
    description: "없는 주소로 들어왔을 때 보이는 화면과 탭 제목·검색 설명.",
    defaults: chromeDefaults((c) => c.notFound),
    render: async (locale) => createElement((await import("@/components/pages/not-found")).NotFoundView, { locale }),
    publicPath: (l) => `${prefix(l)}/page-that-does-not-exist`,
    labels: {
      metaTitle: "탭 제목(브라우저 제목)",
      metaDescription: "검색 설명(meta description)",
      label: "작은 라벨",
      title: "큰 제목",
      lead: "안내 문장",
      home: "‘홈으로’ 버튼",
      projects: "‘프로젝트 보기’ 버튼",
    },
  },
  {
    key: "privacy-request.form",
    titleKo: "개인정보 요청 페이지",
    group: "문의·개인정보 화면",
    description: "/privacy/request 페이지 전체: 제목, 권리 설명, 처리 방법, 양식 문구, 오류·완료 메시지, 탭 제목·검색 설명. {days}는 처리 기한(일)이에요.",
    defaults: {
      ko: async () => (await import("@/components/privacy-request/copy.en")).getPrivacyRequestCopy("ko"),
      en: async () => (await import("@/components/privacy-request/copy.en")).getPrivacyRequestCopy("en"),
    },
    render: async (locale) => createElement((await import("@/components/pages/privacy-request")).PrivacyRequestPage, { locale }),
    publicPath: (l) => `${prefix(l)}/privacy/request`,
    // The request-type `value`s are ids the server action understands: only their labels are editable.
    skip: (path) => /^form\.types\.\d+\.value$/.test(path),
    labels: {
      "meta.title": "탭 제목",
      "meta.description": "검색 설명(meta description)",
      "rights.*.term": "권리 이름",
      "rights.*.desc": "권리 설명",
      "how.*": "처리 방법 단계",
      "inline.before": "아래 안내 문장 · 앞부분",
      "inline.middle": "아래 안내 문장 · 가운데",
      "inline.after": "아래 안내 문장 · 끝",
      "form.types.*.label": "요청 유형 이름",
      "form.detailsPlaceholder.access": "내용 안내 · 열람",
      "form.detailsPlaceholder.correct": "내용 안내 · 정정",
      "form.detailsPlaceholder.delete": "내용 안내 · 삭제",
      "form.detailsPlaceholder.suspend": "내용 안내 · 처리정지",
      "form.detailsPlaceholder.withdraw": "내용 안내 · 동의 철회",
    },
  },
  {
    key: "unsubscribe.form",
    titleKo: "이메일 수신거부 페이지",
    group: "문의·개인정보 화면",
    description: "/unsubscribe 페이지 전체: 제목, 안내, 양식 문구, 오류·완료 메시지, 탭 제목·검색 설명.",
    defaults: {
      ko: async () => (await import("@/components/unsubscribe/copy.en")).getUnsubscribeCopy("ko"),
      en: async () => (await import("@/components/unsubscribe/copy.en")).getUnsubscribeCopy("en"),
    },
    render: async (locale) => createElement((await import("@/components/pages/unsubscribe")).UnsubscribePage, { locale }),
    publicPath: (l) => `${prefix(l)}/unsubscribe`,
    labels: {
      "meta.title": "탭 제목",
      "meta.description": "검색 설명(meta description)",
      "points.*": "안내 항목",
      "inline.before": "아래 안내 문장 · 앞부분",
      "inline.middle": "아래 안내 문장 · 가운데",
      "inline.after": "아래 안내 문장 · 끝",
      "form.submitConfirm": "양식 · 확인 메일 받기 버튼 (링크 없이 주소를 입력한 경우)",
      "form.verified.badge": "양식 · 링크로 확인된 주소 표시",
      "form.verified.hint": "양식 · 확인된 주소 안내",
      "form.confirmNotice": "양식 · 확인 메일 안내",
      "form.invalidLink": "양식 · 잘못된 링크 안내",
      "form.failure.mail": "오류 · 확인 메일 일시 중단",
      "form.sent.*": "확인 메일 발송 완료 화면",
    },
  },

  // --- SEO·메타 (preview = search-result snippet) ---
  {
    key: "seo.home",
    titleKo: "검색·공유 · 홈",
    group: "SEO·메타",
    description: "홈(/)의 검색 결과 제목·설명." + seoNote,
    defaults: seoDefaults((m, l) => m.seoPageDefaults("home", l)),
    render: seoPreview("seo.home"),
    publicPath: (l) => `${prefix(l)}/`,
    labels: seoLabels,
  },
  {
    key: "seo.about",
    titleKo: "검색·공유 · 회사 소개",
    group: "SEO·메타",
    description: "/about의 검색 결과 제목·설명. 제목 뒤에는 ‘| Lab98’이 자동으로 붙어요." + seoNote,
    defaults: seoDefaults((m, l) => m.seoPageDefaults("about", l)),
    render: seoPreview("seo.about"),
    publicPath: (l) => `${prefix(l)}/about`,
    labels: seoLabels,
  },
  {
    key: "seo.projects",
    titleKo: "검색·공유 · 프로젝트",
    group: "SEO·메타",
    description: "/projects의 검색 결과 제목·설명. {clients}는 대표 고객사 3곳, {count}는 사례 수예요. 제목 뒤에는 ‘| Lab98’이 자동으로 붙어요." + seoNote,
    defaults: seoDefaults((m, l) => m.seoPageDefaults("projects", l)),
    render: seoPreview("seo.projects"),
    publicPath: (l) => `${prefix(l)}/projects`,
    labels: seoLabels,
  },
  {
    key: "seo.insights",
    titleKo: "검색·공유 · 인사이트",
    group: "SEO·메타",
    description: "/insights의 검색 결과 제목·설명. 제목 뒤에는 ‘| Lab98’이 자동으로 붙어요." + seoNote,
    defaults: seoDefaults((m, l) => m.seoPageDefaults("insights", l)),
    render: seoPreview("seo.insights"),
    publicPath: (l) => `${prefix(l)}/insights`,
    labels: seoLabels,
  },
  {
    key: "seo.praise-tool",
    titleKo: "검색·공유 · Praise Tool",
    group: "SEO·메타",
    description: "/praise-tool의 검색 결과 제목·설명." + seoNote,
    defaults: seoDefaults((m, l) => m.seoPageDefaults("praise-tool", l)),
    render: seoPreview("seo.praise-tool"),
    publicPath: (l) => `${prefix(l)}/praise-tool`,
    labels: seoLabels,
  },
  {
    key: "seo.services",
    titleKo: "검색·공유 · 서비스 페이지(Dev·AI·Faith)",
    group: "SEO·메타",
    description: "/services/dev, /services/ai, /services/faith의 검색 결과 제목·설명." + seoNote,
    defaults: seoDefaults((m, l) => m.seoServicesDefaults(l)),
    render: seoPreview("seo.services"),
    publicPath: (l) => `${prefix(l)}/services/dev`,
    labels: { "*.title": "제목", "*.description": "설명", dev: "Dev (홈페이지·프로그램 제작)", ai: "AI (AI 교육)", faith: "Faith (교회 프로그램)" },
  },
  {
    key: "seo.root",
    titleKo: "검색·공유 · 사이트 기본값",
    group: "SEO·메타",
    description: "제목을 따로 정하지 않은 페이지의 기본 제목과 사이트 검색 키워드. 키워드는 항목 수와 순서가 고정이에요.",
    defaults: seoDefaults((m, l) => m.seoRootDefaults(l)),
    render: seoPreview("seo.root"),
    publicPath: (l) => `${prefix(l)}/`,
    labels: { titleDefault: "기본 제목", keywords: "검색 키워드", "keywords.*": "키워드" },
  },
  {
    key: "seo.og",
    titleKo: "검색·공유 · 공유 카드 이미지 문구",
    group: "SEO·메타",
    description:
      "링크를 공유할 때(카카오톡·SNS) 나오는 카드 이미지에 찍히는 글자. 한국어는 페이지마다 카드가 있고, 영어는 모든 페이지가 카드 한 장을 같이 써요. 카드 속 사업부·프로젝트·글 제목은 각 문서에서 고쳐요.",
    defaults: seoDefaults((m, l) => m.seoOgDefaults(l)),
    render: seoPreview("seo.og"),
    publicPath: (l) => `${prefix(l)}/`,
    labels: {
      "about.subtitle": "회사 소개 카드 · 부제 ({slogan}은 슬로건)",
      "projects.title": "프로젝트 카드 · 제목",
      "projects.subtitle": "프로젝트 카드 · 부제",
      "insights.title": "인사이트 카드 · 제목",
      "insights.subtitle": "인사이트 카드 · 부제",
      "praiseTool.subtitle": "Praise Tool 카드 · 첫째 줄",
      "praiseTool.launch": "Praise Tool 카드 · 둘째 줄 ({date}은 출시일)",
      "home.subtitle": "공유 카드 · 부제",
    },
  },
];
