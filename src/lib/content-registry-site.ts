import "server-only";
import { createElement } from "react";
import type { ContentDoc } from "@/lib/content-registry";
import type { Locale } from "@/lib/i18n";

/**
 * Registry entries of stage 4b agent A: site.info, site.nav, divisions.data, projects.data, faq.*, praise-tool.page.
 * Kept in its own file (spread into CONTENT_DOCS) so concurrent registry edits never collide.
 * Defaults come from src/lib/site-content.ts; the same functions feed getSiteContent()/getPraiseToolCopy(), so editor and site agree on paths.
 */

const prefix = (l: Locale) => (l === "en" ? "/en" : "");
const site = () => import("@/lib/site-content");
const homePage = async (locale: Locale) => createElement((await import("@/components/pages/home")).HomePage, { locale });
const servicePage = (slug: string) => async (locale: Locale) =>
  createElement((await import("@/components/pages/service")).ServicePage, { locale, params: Promise.resolve({ slug }) });
const praisePage = async (locale: Locale) => createElement((await import("@/components/pages/praise-tool")).PraiseToolPage, { locale });

const DIVISION_LABELS: Record<string, string> = {
  dev: "Lab98 Dev",
  ai: "Lab98 AI",
  faith: "Lab98 Faith",
  "*.role": "한 줄 역할",
  "*.headline": "헤드라인",
  "*.summary": "요약",
  "*.description": "소개 글",
  "*.services": "서비스 목록",
  "*.process": "진행 순서",
  "*.facts": "핵심 정보 칩",
  "*.cta": "문의 버튼",
  "*.cta.label": "버튼 문구",
  "*.status": "안내 배너",
  "*.facts.*.label": "칩 이름",
  "*.facts.*.value": "칩 내용",
};

const faqDoc = (key: "faq.home" | "faq.dev" | "faq.ai" | "faq.faith" | "faq.praise-tool", titleKo: string, description: string, render: ContentDoc["render"], path: string): ContentDoc => {
  const faqKey = { "faq.home": "home", "faq.dev": "dev", "faq.ai": "ai", "faq.faith": "faith", "faq.praise-tool": "praiseTool" } as const;
  return {
    key,
    titleKo,
    group: "FAQ",
    description,
    defaults: {
      ko: async () => (await site()).faqDefaults("ko", faqKey[key]),
      en: async () => (await site()).faqDefaults("en", faqKey[key]),
    },
    render,
    publicPath: (l) => `${prefix(l)}${path}`,
    labels: { "*.q": "질문", "*.a": "답변" },
  };
};

export const SITE_CONTENT_DOCS: ContentDoc[] = [
  {
    key: "site.info",
    titleKo: "사이트 공통 · 회사 정보와 슬로건",
    group: "사이트 공통",
    description: "회사 이름, 슬로건, 한 줄 소개, 답장 안내, 대표자 표기, 사업자 이름. 홈·회사 소개·바닥글·검색 정보(JSON-LD)에 쓰여요. 이메일·주소·사업자번호는 코드에서만 바꿔요.",
    defaults: {
      ko: async () => (await site()).siteInfoDefaults("ko"),
      en: async () => (await site()).siteInfoDefaults("en"),
    },
    render: homePage,
    publicPath: (l) => `${prefix(l)}/`,
    labels: {
      name: "회사(브랜드) 이름",
      slogan: "슬로건 (한 문장)",
      sloganLines: "슬로건 (줄 나눔)",
      sloganEn: "영문 슬로건 (바닥글)",
      sloganOriginal: "대표의 원래 말 (회사 소개)",
      description: "한 줄 소개 (검색·링크 미리보기)",
      replyTime: "답장 안내 문구",
      nameMeaning: "이름의 뜻 (98)",
      founder: "대표자",
      "founder.display": "대표자 표기",
      "founder.role": "대표자 직함",
      business: "사업자",
      "business.name": "사업자 이름",
      "business.representative": "대표자 이름 (사업자 정보)",
    },
  },
  {
    key: "site.nav",
    titleKo: "사이트 공통 · 메뉴 이름",
    group: "사이트 공통",
    description: "맨 위 메뉴의 항목 이름 6개. 링크 주소는 코드에서만 바꿔요.",
    defaults: {
      ko: async () => (await site()).navDefaults("ko"),
      en: async () => (await site()).navDefaults("en"),
    },
    render: async (locale) => createElement((await import("@/components/site-header")).SiteHeader, { locale }),
    publicPath: (l) => `${prefix(l)}/`,
    labels: { "*.label": "메뉴 이름" },
  },
  {
    key: "divisions.data",
    titleKo: "서비스 · 사업부 소개 (Dev / AI / Faith)",
    group: "서비스",
    description: "사업부마다 한 줄 역할, 헤드라인, 요약, 소개 글, 서비스 목록, 진행 순서, 핵심 정보 칩, 문의 버튼 문구. 홈의 서비스 카드와 각 서비스 페이지에 쓰여요.",
    defaults: {
      ko: async () => (await site()).divisionsDefaults("ko"),
      en: async () => (await site()).divisionsDefaults("en"),
    },
    render: servicePage("dev"),
    publicPath: (l) => `${prefix(l)}/services/dev`,
    labels: DIVISION_LABELS,
  },
  {
    key: "projects.data",
    titleKo: "프로젝트 · 제작 사례 소개글",
    group: "프로젝트",
    description: "프로젝트마다 제목, 한 줄 소개, 주요 기능 4가지. 홈, 프로젝트 목록, 프로젝트 상세 페이지에 쓰여요. 고객 이름·주소·스크린샷은 코드에서만 바꿔요.",
    defaults: {
      ko: async () => (await site()).projectsDefaults("ko"),
      en: async () => (await site()).projectsDefaults("en"),
    },
    render: async (locale) => createElement((await import("@/components/pages/projects")).ProjectsPage, { locale }),
    publicPath: (l) => `${prefix(l)}/projects`,
    labels: {
      nkhb: "뉴코리아 희망방송 (NKHB)",
      nkfi: "뉴코리아 파운데이션 인터내셔널 (NKFI)",
      pbf: "생명동행기금 (PBF)",
      pray4nk: "Pray4NK",
      befriends: "딱친구 (BeFriends)",
      "*.title": "프로젝트 제목",
      "*.summary": "한 줄 소개",
      "*.highlights": "주요 기능",
    },
  },
  faqDoc("faq.home", "FAQ · 홈", "홈 맨 아래 자주 묻는 질문과 검색용 FAQ 정보(JSON-LD).", homePage, "/"),
  faqDoc("faq.dev", "FAQ · Dev 서비스", "Dev 서비스 페이지의 자주 묻는 질문.", servicePage("dev"), "/services/dev"),
  faqDoc("faq.ai", "FAQ · AI 서비스", "AI 서비스 페이지의 자주 묻는 질문.", servicePage("ai"), "/services/ai"),
  faqDoc("faq.faith", "FAQ · Faith 서비스", "Faith 서비스 페이지의 자주 묻는 질문.", servicePage("faith"), "/services/faith"),
  faqDoc("faq.praise-tool", "FAQ · Praise Tool", "Praise Tool 페이지의 자주 묻는 질문.", praisePage, "/praise-tool"),
  {
    key: "praise-tool.page",
    titleKo: "Praise Tool · 소개 페이지 전체 문구",
    group: "Praise Tool",
    description:
      "Praise Tool 페이지의 첫 화면, 한눈에 보기, 주요 기능, 안심 송출, 지원 환경, 가격 안내, 출시 알림 신청 양식. 가격(100,000원)·출시일(2026-11-11)은 검색 정보와 연결돼 있어 코드에서만 바꿔요. 코드의 ‘reconstructed’ 표시는 고객 확인이 필요한 문장이라는 뜻이고, 여기서 고쳐도 표시는 그대로 남아요.",
    defaults: {
      ko: async () => (await import("@/lib/praise-tool.en")).getPraiseTool("ko"),
      en: async () => (await import("@/lib/praise-tool.en")).getPraiseTool("en"),
    },
    render: praisePage,
    publicPath: (l) => `${prefix(l)}/praise-tool`,
    skip: (path) => path === "hero.price" || path === "hero.launch" || path === "pricing.price" || path === "dday.fallback" || /^features\.groups\.\d+\.key$/.test(path),
    labels: {
      meta: "검색·링크 미리보기",
      hero: "첫 화면",
      dday: "출시 D-day 배지",
      glance: "한눈에 보기",
      features: "주요 기능",
      "features.groups": "기능 분류",
      safety: "안심하고 쓰는 송출",
      requirements: "지원 환경",
      pricing: "가격 안내",
      notify: "출시 알림 안내",
      form: "출시 알림 신청 양식",
      "form.notice": "개인정보 수집·이용 안내",
      "form.errors": "입력 오류 문구",
      "form.failure": "신청 실패 문구",
      "form.success": "신청 완료 문구",
      more: "맨 아래 문의 안내",
    },
  },
];
