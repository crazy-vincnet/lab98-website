import "server-only";
import { createElement, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { LEGAL_DOCS } from "@/lib/content-registry-legal";
import { CONTENT_DOCS_PAGES } from "@/lib/content-registry-pages";
import { SITE_CONTENT_DOCS } from "@/lib/content-registry-site";
import { CHROME_CONTENT_DOCS } from "@/lib/content-registry-chrome";

/**
 * REGISTRY OF EDITABLE COPY DOCUMENTS (docs/admin-content.md). One entry = one `key` in `content_entries`.
 * Converting a copy file = add an entry here + switch its consumers to `await getCopy(key, locale, sameDefaults)`.
 * Server-only; imports are lazy so the admin list stays light and public pages never load this file.
 */

export const CONTENT_GROUPS = [
  "사이트 공통",
  "홈",
  "서비스",
  "소개",
  "프로젝트",
  "Praise Tool",
  "FAQ",
  "인사이트 화면",
  "문의·개인정보 화면",
  "법적 문서",
  "SEO·메타",
] as const;
export type ContentGroup = (typeof CONTENT_GROUPS)[number];

/** Which admin sidebar page lists which groups (/admin/content?group=… works for any group too). */
export const GROUPS_BY_PAGE: Record<string, readonly ContentGroup[]> = {
  "/admin/content": ["사이트 공통", "홈", "서비스", "소개", "인사이트 화면", "문의·개인정보 화면", "SEO·메타"],
  "/admin/projects": ["프로젝트"],
  "/admin/praise-tool": ["Praise Tool"],
  "/admin/faq": ["FAQ"],
  "/admin/legal": ["법적 문서"],
};

export type ContentDoc = {
  /** Stable id stored in the DB: lowercase, dots allowed (`home.hero`). Never rename once published. Format: CONTENT_KEY_RE. */
  key: string;
  /** Title shown in the admin (Korean). */
  titleKo: string;
  group: ContentGroup;
  /** One line: where this text appears. */
  description?: string;
  /**
   * The code defaults per locale. MUST return exactly what the consumer passes to getCopy (same function, same subtree),
   * otherwise the editor and the site would disagree about paths. Dynamic import keeps it lazy.
   */
  defaults: { ko: () => Promise<unknown>; en: () => Promise<unknown> };
  /** The REAL public component with this document's draft applied (rendered by /admin/content/[key]/preview). */
  render: (locale: Locale) => Promise<ReactNode>;
  /** Public URL that shows this copy (for "공개 페이지 보기"). */
  publicPath: (locale: Locale) => string;
  /** Extra leaves to hide from the editor (on top of the built-in URL/id heuristic in copy-merge.isEditableLeaf). */
  skip?: (path: string, value: string) => boolean;
  /** Korean field labels by path pattern; `*` matches one segment (array index or key). e.g. { "cardFoot": "카드 하단 링크" } */
  labels?: Record<string, string>;
};

const prefix = (l: Locale) => (l === "en" ? "/en" : "");

export const CONTENT_DOCS: ContentDoc[] = [
  ...CHROME_CONTENT_DOCS, // stage 4b agent C: chrome.*, privacy-request.form, unsubscribe.form, seo.* (src/lib/content-registry-chrome.ts)
  ...SITE_CONTENT_DOCS, // stage 4b agent A: site.info, site.nav, divisions.data, projects.data, faq.*, praise-tool.page (src/lib/content-registry-site.ts)
  {
    key: "home.hero",
    titleKo: "홈 · 첫 화면(히어로)",
    group: "홈",
    description: "홈 맨 위의 작은 라벨, 소개 문장, 버튼 문구, 검은 블록 캡션.",
    defaults: {
      ko: async () => (await import("@/components/home/copy.en")).getHomeCopy("ko").heroCopy,
      en: async () => (await import("@/components/home/copy.en")).getHomeCopy("en").heroCopy,
    },
    render: async (locale) => createElement((await import("@/components/pages/home")).HomePage, { locale }),
    publicPath: (l) => `${prefix(l)}/`,
    labels: {
      label: "맨 위 작은 라벨",
      lead: "소개 문장",
      ctaPrimary: "주요 버튼",
      ctaSecondary: "보조 버튼",
      blockDivisionsLabel: "검은 블록 · 서비스 라벨",
      blockCaption: "검은 블록 · 캡션",
      motionPause: "애니메이션 멈춤 버튼",
      motionPlay: "애니메이션 재생 버튼",
      motionSr: "애니메이션 버튼 설명(스크린리더)",
    },
  },
  {
    key: "chrome.footer",
    titleKo: "사이트 공통 · 바닥글",
    group: "사이트 공통",
    description: "모든 페이지 맨 아래 바닥글의 제목, 링크 이름, 약관 링크 이름.",
    defaults: {
      ko: async () => (await import("@/components/chrome/copy.en")).getChromeCopy("ko").footer,
      en: async () => (await import("@/components/chrome/copy.en")).getChromeCopy("en").footer,
    },
    render: async (locale) => createElement((await import("@/components/site-footer")).SiteFooter, { locale }),
    publicPath: (l) => `${prefix(l)}/`,
    labels: { legalNavAria: "약관 메뉴 설명(스크린리더)" },
  },
  // Page-level copy (home sections, services, about, projects, insights): src/lib/content-registry-pages.ts
  ...CONTENT_DOCS_PAGES,
  // Legal documents (privacy, terms, cookies): src/lib/content-registry-legal.ts
  ...LEGAL_DOCS,
];

export const getDoc = (key: string) => CONTENT_DOCS.find((d) => d.key === key);

/*
 * TODO for the converter agents: one registry entry + consumer switch each (see docs/admin-content.md, "Converting a copy file").
 * Default module paths (ko source / en twin) and the accessor to reuse as `defaults`:
 *
 */
