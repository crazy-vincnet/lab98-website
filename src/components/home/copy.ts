/**
 * Home page UI strings + route paths, in one place. Wording follows docs/copy-guide.md.
 * Data-driven copy (divisions, experiments, notes, site) stays in src/lib/content.ts.
 *
 * Two-part headings are [first, second] and render inline as one line of text;
 * `text-balance` handles wrapping (no forced breaks → no orphan words).
 */
import type { DivisionSlug } from "@/lib/content";
import { CONTACT_HREF, HOME_ANCHORS, INSIGHTS_PATH, PROJECTS_PATH, divisionHref, insightHref, projectHref } from "@/components/experiments/paths";

export const routes = {
  division: divisionHref,
  experiments: PROJECTS_PATH,
  experiment: projectHref,
  notes: INSIGHTS_PATH,
  note: insightHref,
  contact: CONTACT_HREF,
} as const;

/** In-page anchors (section ids) on the home page. */
export const anchors = HOME_ANCHORS;

/** "{short} · {what}" labels for the three services (contact options, footer). */
export const serviceLabel: Record<DivisionSlug, string> = {
  web: "Web · 웹사이트",
  ai: "AI · 업무 자동화",
  faith: "Faith · 공동체 콘텐츠",
};

// TODO(content): wording approved in docs/copy-guide.md v1 (2026-10-31).
export const heroCopy = {
  /** follows site.tagline (bold) */
  lead: "Lab98은 웹사이트, AI 업무 자동화, 신앙 공동체 콘텐츠 프로젝트를 1주 단위로 만들어 빠르게 오픈하는 회사예요.",
  ctaPrimary: "프로젝트 문의하기",
  ctaSecondary: "프로젝트 사례 보기",
  srRunning: "진행 중인 프로젝트",
  blockDivisionsLabel: "서비스",
  blockCaption: "Now shipping",
  /** Hero motion toggle (WCAG 2.2.2). Visible text is mono Latin; the sr-only part explains it. */
  motionPause: "Pause",
  motionPlay: "Play",
  motionSr: "히어로 애니메이션 멈추기·재생",
} as const;

export const aboutCopy = {
  index: "01",
  eyebrow: "About",
  title: ["기획서보다 먼저,", "작동하는 결과물을 보여 드려요."],
  lead: "Lab98은 웹, AI, 신앙 공동체 분야의 프로젝트를 만드는 회사예요. 1주 안에 결과를 볼 수 있는 크기로 나눠 만들고, 시작할 때 합의한 지표로 성과를 보고해요.",
  principles: [
    { title: "작게 시작해요", body: "프로젝트를 1주 안에 결과를 볼 수 있는 단위로 나눠, 초기 비용과 위험을 줄여요." },
    { title: "빠르게 오픈해요", body: "긴 문서 대신 실제로 작동하는 결과물을 먼저 보여 드리고, 피드백으로 다듬어요." },
    { title: "성과로 보고해요", body: "시작할 때 핵심 지표를 함께 정하고, 결과를 숫자로 투명하게 공유해요." },
  ],
} as const;

export const divisionsCopy = {
  index: "02",
  eyebrow: "Services",
  title: "세 개의 사업부, 하나의 일하는 방식",
  lead: "웹사이트, AI 자동화, 신앙 공동체 콘텐츠. 분야는 달라도 같은 방식으로 빠르게 만들고 성과로 보고해요.",
  cardFoot: (short: string) => `${short} 서비스 보기`,
} as const;

export const experimentsCopy = {
  index: "03",
  eyebrow: "Projects",
  title: "프로젝트 사례",
  lead: "모든 프로젝트는 코드, 목표, 핵심 지표로 관리해요. 무엇을 목표로 했고 어떤 결과를 냈는지 공개해요.",
  more: "모든 프로젝트 보기",
} as const;

export const processCopy = {
  index: "04",
  eyebrow: "How we work",
  title: "1주 스프린트, 네 단계로 일해요",
  lead: "어느 사업부와 일하든 모든 프로젝트는 같은 네 단계로 진행돼요. 매주 진행 상황을 함께 확인해요.",
  steps: [
    { key: "GOAL", title: "목표 합의하기", body: "이루고 싶은 것을 한 문장으로 정리하고, 성공을 판단할 핵심 지표를 함께 정해요." },
    { key: "BUILD", title: "1주 안에 만들기", body: "목표를 확인할 수 있는 가장 작은 결과물을 1주 안에 만들어 오픈해요." },
    { key: "MEASURE", title: "지표로 확인하기", body: "실제 사용자 데이터를 합의한 지표와 비교해 성과를 확인해요." },
    { key: "REPORT", title: "리포트하고 다음으로", body: "결과와 다음 단계 제안을 리포트로 드리고, 다음 스프린트를 함께 정해요." },
  ],
  terminalCommand: (code: string) => `lab98 ship --project=${code}`,
  terminalDone: "✓ shipped. next sprint queued.",
} as const;

export const notesCopy = {
  index: "05",
  eyebrow: "Insights",
  title: "프로젝트에서 얻은 인사이트",
  lead: "프로젝트 사례, 일하는 방식, 분야별 실무 노하우를 정리해 공유해요.",
  more: "모든 인사이트 보기",
} as const;

export const contactCopy = {
  index: "06",
  eyebrow: "Contact",
  title: ["함께 만들", "프로젝트가 있나요?"],
  /** followed by site.replyTime */
  lead: "새 프로젝트 문의, 견적 요청, 협업 제안 모두 환영해요.",
  infoEmail: "Email",
  infoWeb: "Web",
  form: {
    ariaLabel: "프로젝트 문의",
    interestLegend: "문의 분야",
    interestAll: "아직 정하지 않았어요",
    nameLabel: "이름 또는 회사명 (선택)",
    namePlaceholder: "홍길동 / A사 마케팅팀",
    emailLabel: "답장받을 이메일",
    emailPlaceholder: "you@company.com",
    messageLabel: "문의 내용",
    messagePlaceholder: "해결하고 싶은 문제와 원하는 일정, 예산 범위를 알려 주세요. 정리되지 않아도 괜찮아요.",
    messageMax: 2000,
    submit: "문의 보내기",
    submitHint: "문의 보내기를 누르면 메일 앱이 열려요",
    privacy: "보내 주신 정보는 답장을 위해서만 사용해요.",
    errors: {
      emailRequired: "답장받을 이메일을 입력해 주세요.",
      emailInvalid: "이메일 형식을 확인해 주세요. 예: you@company.com",
      messageRequired: "문의 내용을 한 줄 이상 적어 주세요.",
      messageTooLong: "2,000자 안으로 줄여 주세요. 자료는 답장 메일로 보내 주셔도 돼요.",
    },
    mail: {
      subject: (interest: string, from: string) => `[Lab98 문의] ${interest} · ${from}`,
      body: (interest: string, name: string, from: string, message: string) =>
        `문의 분야: ${interest}\n${name ? `이름 또는 회사명: ${name}\n` : ""}답장받을 이메일: ${from}\n\n${message}\n`,
    },
    // Submitting opens the visitor's mail app (no backend yet), so the success state
    // asks them to press send there; wording otherwise follows copy guide 6-2.
    success: {
      eyebrow: "메일 앱을 열었어요",
      title: "메일 앱에서 보내기를 누르면 문의가 접수돼요. 영업일 기준 2일 안에 입력하신 이메일로 답장드릴게요.",
      fallbackBefore: "메일 앱이 열리지 않았다면",
      fallbackAfter: "로 직접 보내 주세요.",
      reset: "새로 쓰기",
    },
  },
} as const;
