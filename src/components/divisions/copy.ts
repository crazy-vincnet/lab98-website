/**
 * UI copy + route paths for the service (division) pages (and shared bits reused by /about).
 * Division data itself (headline, services, process, facts…) lives in src/lib/content.ts —
 * this file only holds section labels and per-division framing copy.
 */
import { PRAISE_TOOL_LAUNCH, site, type DivisionSlug } from "@/lib/content";
import { CONTACT_HREF, PRAISE_TOOL_PATH, PROJECTS_PATH, divisionHref } from "@/components/experiments/paths";

export const routes = {
  contact: CONTACT_HREF,
  projects: PROJECTS_PATH,
  division: divisionHref,
  praiseTool: PRAISE_TOOL_PATH,
  praiseToolNotify: `${PRAISE_TOOL_PATH}#notify`,
} as const;

const [launchY, launchM, launchD] = PRAISE_TOOL_LAUNCH.split("-").map(Number);

export const divisionCopy = {
  hero: {
    /** eyebrow = "LAB98 DEV · 서비스": Latin code in mono, Korean word set without tracking */
    eyebrowCode: (short: string) => `LAB98 ${short.toUpperCase()}`,
    eyebrowKo: "서비스",
    /** Secondary hero link per division (jumps to the most useful section on the page). */
    secondary: {
      dev: { label: "만든 사이트 보기", href: "#projects" },
      ai: { label: "진행 방식 보기", href: "#process" },
      faith: { label: "Praise Tool 보기", href: "#praise-tool" },
    } satisfies Record<DivisionSlug, { label: string; href: string }>,
    blockServices: "SERVICES",
    factsLabel: "한눈에 보기",
  },
  /** Description section framing, per division. */
  about: {
    eyebrow: "Why",
    byDivision: {
      dev: { title: "템플릿 없이, 일하는 방식에 맞춰 만들어요" },
      ai: { title: "왜 AI 교육인가요" },
      faith: { title: "반복되는 일은 덜고, 사람에게 더 집중하도록" },
    } satisfies Record<DivisionSlug, { title: string }>,
    /** AI only: "not this, but this" contrast drawn from the division description. */
    aiContrast: {
      not: { note: "이런 교육이 아니에요", label: "AI가 사람을 대신하는 것" },
      is: { note: "Lab98 AI가 돕는 일", label: "사람이 AI를 도구로 잘 쓰는 것" },
    },
  },
  services: { eyebrow: "What we do", title: "이런 일을 해요" },
  /** Which service carries `division.status` (matched by title). */
  statusService: { ai: "AI 커뮤니티 플랫폼" } as Partial<Record<DivisionSlug, string>>,
  status: { eyebrow: "Notice" },
  process: {
    eyebrow: "Process",
    byDivision: {
      dev: { title: "여섯 단계로 진행해요", lead: "미팅부터 마무리까지, 단계마다 직접 확인하시면서 진행해요." },
      ai: { title: "이렇게 시작해요", lead: "문의 한 번이면 대상과 목적에 맞춘 교육을 제안해 드려요." },
      faith: { title: "이렇게 함께해요", lead: "현장 이야기를 듣는 데서 시작해 배포 뒤 운영까지 이어 가요." },
    } satisfies Record<DivisionSlug, { title: string; lead: string }>,
    /** Step emphasised as the division's differentiator (matched by title). */
    highlight: {
      dev: {
        step: "배포 및 코드 공유",
        badge: "Lab98의 차이",
        note: "만든 결과물은 고객의 것이에요. 소스 코드를 함께 드려서 나중에 어디서 관리하더라도 막히지 않아요.",
      },
    } as Partial<Record<DivisionSlug, { step: string; badge: string; note: string }>>,
  },
  projects: {
    eyebrow: "Projects",
    title: "Dev가 만든 사이트",
    lead: "기획부터 디자인, 개발까지 맡은 웹사이트예요. 기관마다 필요한 기능을 함께 만들었어요.",
    allCta: "모든 프로젝트 보기",
  },
  praiseTool: {
    eyebrow: "첫 제품 · Praise Tool",
    title: "예배를 위한 가사·미디어 송출 프로그램",
    lead: "찬양 가사와 설교 슬라이드, 성경 구절, 영상을 한 프로그램에서 준비하고 송출해요.",
    facts: [
      { label: "지원", value: "Mac · Windows" },
      { label: "가격", value: "10만 원 영구 라이선스" },
      { label: "출시", value: `${launchY}년 ${launchM}월 ${launchD}일` },
    ],
    primaryCta: "Praise Tool 자세히 보기",
    secondaryCta: "출시 알림 받기",
  },
  others: { eyebrow: "Other services", title: "다른 사업부도 둘러보세요", lead: "분야는 달라도 기준은 같아요. 기술이 사람을 돕는지 먼저 봐요." },
  divisionCard: { cta: (short: string) => `${short} 서비스 보기` },
  contactBand: {
    eyebrow: "Contact",
    title: "함께 만들 일이 있나요?",
    lead: `만들고 싶은 웹사이트나 프로그램, 필요한 교육이나 도구가 있다면 편하게 문의해 주세요. ${site.replyTime}.`,
    cta: "문의하기",
    /** Per-division band title (CTA label comes from division.cta.label). */
    byDivision: {
      dev: { title: "만들고 싶은 웹사이트나 프로그램이 있나요?" },
      ai: { title: "AI 교육이 필요한 팀이나 학교가 있나요?" },
      faith: { title: "사역에 필요한 도구가 있나요?" },
    } satisfies Record<DivisionSlug, { title: string }>,
    divisionLead: `궁금한 점부터 편하게 물어봐 주세요. ${site.replyTime}.`,
  },
} as const;
