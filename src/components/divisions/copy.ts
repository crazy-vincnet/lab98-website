/**
 * UI copy + route paths for the service (division) pages (and shared bits reused by /about).
 * Swap wording or rename routes here only — components read everything from this file.
 * Wording follows docs/copy-guide.md 5-2 / 5-6.
 */
import type { DivisionSlug } from "@/lib/content";
import { CONTACT_HREF, PROJECTS_PATH, divisionHref, insightHref, projectHref } from "@/components/experiments/paths";

export const routes = {
  contact: CONTACT_HREF,
  projects: PROJECTS_PATH,
  project: projectHref,
  insight: insightHref,
  division: divisionHref,
} as const;

export const divisionCopy = {
  /** Page meta per service (copy guide 5-6). Titles are absolute (they carry their own brand suffix). */
  meta: {
    web: {
      title: "웹사이트 · 랜딩 페이지 제작 | Lab98 Web",
      description: "브랜드 사이트와 랜딩 페이지를 1주 스프린트로 기획, 디자인, 개발해요. 오픈한 뒤에는 데이터로 문의와 신청 전환을 개선해요.",
    },
    ai: {
      title: "AI 업무 자동화 | Lab98 AI",
      description: "회의록 정리, 사내 문서 검색, 보고서 초안처럼 반복되는 업무를 AI로 자동화해요. 업무 하나부터 시작해 2–4주 안에 현업에서 쓰게 해요.",
    },
    faith: {
      title: "교회 · 신앙 공동체 콘텐츠와 도구 | Lab98 Faith",
      description: "교회와 신앙 공동체를 위한 묵상 콘텐츠, 챌린지 프로그램, 모임 신청 페이지를 만들어요. 작게 시작하고 참여율로 효과를 확인해요.",
    },
  } satisfies Record<DivisionSlug, { title: string; description: string }>,
  hero: {
    /** eyebrow = "LAB98 WEB · 서비스": Latin code in mono, Korean word set without tracking */
    eyebrowCode: (short: string) => `LAB98 ${short.toUpperCase()}`,
    eyebrowKo: "서비스",
    primaryCta: (short: string) => `${short} 프로젝트 문의하기`,
    secondaryCta: (short: string) => `${short} 사례 보기`,
    blockServices: "SERVICES",
    blockProjects: "PROJECTS",
  },
  services: { index: "01", eyebrow: "What we do", title: "제공 서비스", lead: "필요한 범위만 골라 시작할 수 있어요." },
  cycle: {
    index: "02",
    eyebrow: "Weekly sprint",
    title: "1주 스프린트는 이렇게 진행돼요",
    lead: "매주 같은 리듬으로 진행해 일정과 결과를 예측할 수 있어요.",
    terminalCommand: "lab98 sprint",
    terminalSteps: "→ goal · build · measure · report",
    terminalDone: "매주 같은 리듬으로 진행해요.", // Korean: rendered in font-sans inside the terminal
    /** mono labels for the Korean day prefixes in divisions[].sampleCycle */
    dayCodes: { 월: "MON", 화: "TUE", 수: "WED", 목: "THU", 금: "FRI", "화–목": "TUE–THU", "다음 주": "NEXT WEEK" } as Record<string, string>,
  },
  projects: {
    index: "03",
    eyebrow: "Projects",
    title: (short: string) => `${short} 프로젝트 사례`,
    lead: "모든 프로젝트는 코드, 목표, 핵심 지표로 관리해요. 무엇을 목표로 했고 어떤 결과를 냈는지 공개해요.",
    empty: "이 서비스의 공개 사례를 준비하고 있어요. 비슷한 프로젝트 경험은 문의 주시면 자세히 알려 드릴게요.",
    allCta: "모든 프로젝트 보기",
  },
  insights: { index: "04", eyebrow: "Insights", title: "관련 인사이트", lead: "프로젝트에서 얻은 인사이트를 글로 정리해 공유해요." },
  others: { index: (n: number) => String(n).padStart(2, "0"), eyebrow: "Other services", title: "다른 서비스도 둘러보세요", lead: "분야는 달라도 같은 방식으로 빠르게 만들고 성과로 보고해요." },
  divisionCard: { cta: (short: string) => `${short} 서비스 보기` },
  contactBand: {
    eyebrow: "Contact",
    title: "함께 만들 프로젝트가 있나요?",
    lead: "새 프로젝트 문의, 견적 요청, 협업 제안 모두 환영해요. 영업일 기준 2일 안에 답장드려요.",
    cta: "프로젝트 문의하기",
    /** Per-service CTA band (copy guide 5-2). */
    byDivision: {
      web: { title: "오픈 일정이 정해진 사이트가 있나요?", lead: "핵심 메시지 하나만 있으면 1주 안에 첫 버전을 보여 드려요.", cta: "Web 프로젝트 문의하기" },
      ai: { title: "매주 반복되는 업무가 있나요?", lead: "업무 하나를 골라 주시면 절감할 수 있는 시간부터 함께 계산해 드려요.", cta: "AI 자동화 문의하기" },
      faith: { title: "공동체와 함께 시작하고 싶은 일이 있나요?", lead: "작은 모임 규모부터 부담 없이 시작할 수 있어요.", cta: "Faith 프로젝트 문의하기" },
    } satisfies Record<DivisionSlug, { title: string; lead: string; cta: string }>,
  },
} as const;
