import "server-only";
import { createElement } from "react";
import type { ContentDoc } from "@/lib/content-registry";
import type { LegalDocKind } from "@/components/legal/legal-copy-types";
import type { Locale } from "@/lib/i18n";

/**
 * Registry entries of the legal documents (group "법적 문서"). Text: src/components/legal/{privacy,terms,cookies}.copy.ts (+ .en.ts).
 * The editor shows a legal warning banner for every `legal.*` key and the publish action requires a change note.
 */
const prefix = (l: Locale) => (l === "en" ? "/en" : "");

/** Cells that are only an external link (the URL must stay in code). */
const skip = (_path: string, value: string) => /^\[[^\]]+\]\(https:\/\/[^)\s]+\)$/.test(value);

const labels: Record<string, string> = {
  title: "문서 제목",
  intro: "소개 문단",
  introNote: "번역 안내 문구",
  effectiveDate: "시행일(화면에 표시)",
  version: "버전 표시 (기본값 그대로면 화면에 안 보여요)",
  sections: "조항",
  "sections.*.heading": "조항 제목",
  "sections.*.blocks": "조항 내용",
  "sections.*.blocks.*.p": "문단",
  "sections.*.blocks.*.ul": "목록",
  "sections.*.blocks.*.table": "표",
  "sections.*.blocks.*.table.caption": "표 설명(스크린리더)",
  "sections.*.blocks.*.table.head": "표 머리글",
  "sections.*.blocks.*.table.rows": "표 행",
  "sections.*.blocks.*.button": "버튼 글자",
  "sections.*.blocks.*.cookieButton": "쿠키 설정 버튼 글자",
  history: "변경 이력",
  "history.*.date": "날짜",
  "history.*.note": "내용",
};

const NOTE = " 글 안에서 **굵게**, `코드`, [글자](링크) 표시를 쓸 수 있고, {email} 같은 중괄호 표시는 그대로 두어야 해요. 수정 전 법률 검토를 권해요.";

async function renderPage(kind: LegalDocKind, locale: Locale) {
  if (kind === "privacy") return createElement((await import("@/components/pages/privacy")).PrivacyPage, { locale });
  if (kind === "terms") return createElement((await import("@/components/pages/terms")).TermsPage, { locale });
  return createElement((await import("@/components/pages/cookies")).CookiesPage, { locale });
}

const make = (kind: LegalDocKind, titleKo: string, description: string): ContentDoc => ({
  key: `legal.${kind}`,
  titleKo,
  group: "법적 문서",
  description: description + NOTE,
  defaults: {
    ko: async () => (await import("@/components/legal/legal-copies")).getLegalDocCopy(kind, "ko"),
    en: async () => (await import("@/components/legal/legal-copies")).getLegalDocCopy(kind, "en"),
  },
  render: (locale) => renderPage(kind, locale),
  publicPath: (l) => `${prefix(l)}/${kind}`,
  skip,
  labels,
});

export const LEGAL_DOCS: ContentDoc[] = [
  make("privacy", "법적 문서 · 개인정보처리방침", "개인정보처리방침 전체(처리 목적, 항목, 보유 기간, 위탁, 권리 행사 등)."),
  make("terms", "법적 문서 · 이용약관", "이용약관 전체."),
  make("cookies", "법적 문서 · 쿠키 정책", "쿠키 정책 전체."),
];
