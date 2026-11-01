/**
 * Home page UI strings + route paths, in one place. Wording follows docs/copy-guide.md (해요체, benefit first).
 * Data-driven copy (divisions, projects, notes, site) stays in src/lib/content.ts.
 */
import type { DivisionSlug, Project } from "@/lib/content";
import { CONTACT_HREF, HOME_ANCHORS, INSIGHTS_PATH, PRAISE_TOOL_PATH, PROJECTS_PATH, divisionHref } from "@/components/experiments/paths";

export const routes = {
  /** /about has no constant in paths.ts (owned by the about route). */
  about: "/about",
  division: divisionHref,
  projects: PROJECTS_PATH,
  insights: INSIGHTS_PATH,
  praiseTool: PRAISE_TOOL_PATH,
  praiseToolNotify: `${PRAISE_TOOL_PATH}#notify`,
  contact: CONTACT_HREF,
  process: `/#${HOME_ANCHORS.process}`,
} as const;

/** In-page anchors (section ids) on the home page. */
export const anchors = HOME_ANCHORS;

/** Contact-form interest chip labels. */
export const interestLabel: Record<"master" | DivisionSlug, string> = {
  master: "아직 정하지 않았어요",
  dev: "Dev · 웹·프로그램 제작",
  ai: "AI 교육",
  faith: "Faith · 교회·선교단체 프로그램",
};

/** Short organization name: Latin acronym when there is one (NKHB), otherwise the Korean name (생명동행기금). */
export function clientShort(p: Pick<Project, "client" | "clientEn">) {
  return p.clientEn && /^[A-Z0-9]+$/.test(p.clientEn) ? p.clientEn : p.client;
}

export const heroCopy = {
  label: "Lab98 · Dev · AI · Faith",
  lead: "웹·프로그램 제작부터 AI 교육, 교회를 위한 소프트웨어까지. 사람이 더 중요한 일에 집중하도록 쓰기 편한 도구를 만들어요.",
  ctaPrimary: "프로젝트 문의",
  ctaSecondary: "만든 것 보기",
  blockDivisionsLabel: "서비스",
  blockCaption: "Tools for people",
  /** Hero motion toggle (WCAG 2.2.2). Visible text is mono Latin; the sr-only part explains it. */
  motionPause: "Pause",
  motionPlay: "Play",
  motionSr: "히어로 애니메이션 멈추기·재생",
} as const;

export const trustCopy = {
  label: "Lab98과 일하면 좋은 점",
  code: { title: "코드까지 드려요", body: "결과물과 함께 소스 코드를 넘겨 드려요" },
  price: { title: "200만 원부터 맞춤 제작", body: "템플릿 없이 처음부터" },
  clients: "{n}개 기관과 함께했어요",
} as const;

export const praiseCopy = {
  name: "Praise Tool",
  launch: "11월 11일 출시",
  line: "예배를 위한 가사·미디어 송출 프로그램 · Mac·Windows · 10만 원 영구 라이선스",
  notify: "출시 알림 받기",
  more: "자세히 보기",
  /** D-day badge states. Server / no-JS render shows `fallback`. */
  fallback: "출시 예정",
  today: "오늘 출시",
  after: "지금 만나 보세요",
} as const;

export const servicesCopy = {
  index: "01",
  eyebrow: "Services",
  title: "필요한 도구를 만들고, 잘 쓰도록 도와요",
  lead: "웹과 프로그램을 맞춤으로 만들고, AI를 제대로 쓰는 법을 알려 드려요. 교회와 선교단체에 필요한 프로그램은 운영까지 함께해요.",
  /** Card hook line per division; falls back to the division headline. */
  hook: { dev: "200만 원부터 · 코드 제공" } as Partial<Record<DivisionSlug, string>>,
  cardFoot: "{short} 서비스 보기",
} as const;

export const projectsCopy = {
  index: "02",
  eyebrow: "Projects",
  title: "만든 것들",
  lead: "방송 듣기, 기도 서명, 후원 신청, 보험 지원 조회까지. 기관마다 꼭 필요한 기능을 기획부터 디자인, 개발까지 맡아 만들었어요.",
  more: "프로젝트 모두 보기",
  clientsLabel: "함께한 기관",
  newTab: "(새 창)",
} as const;

export const processCopy = {
  index: "03",
  eyebrow: "How we work",
  title: "미팅부터 코드 공유까지, 여섯 단계로 만들어요",
  lead: "시안으로 먼저 확인하고 만들어서 방향이 어긋나지 않아요. 오픈할 때는 소스 코드를 함께 넘겨 드려요. 나중에 어디서 관리하든 막힐 일이 없어요.",
  highlight: "Lab98의 약속",
} as const;

export const founderCopy = {
  index: "04",
  eyebrow: "About",
  more: "회사 소개 보기",
} as const;

export const insightsCopy = {
  index: "05",
  eyebrow: "Insights",
  title: "일하며 배운 것들",
  lead: "만든 과정과 생각을 쉬운 글로 정리해 나눠요.",
  more: "인사이트 모두 보기",
} as const;

export const contactCopy = {
  index: "06",
  eyebrow: "Contact",
  title: ["함께 만들", "프로젝트가 있나요?"],
  /** followed by site.replyTime */
  lead: "웹·프로그램 제작, AI 교육, 교회 프로그램 문의 모두 편하게 남겨 주세요.",
  infoEmail: "Email",
  infoReply: "Reply",
  form: {
    ariaLabel: "프로젝트 문의",
    interestLegend: "문의 분야",
    nameLabel: "이름 또는 회사명 (선택)",
    namePlaceholder: "홍길동 / OO교회",
    emailLabel: "답장받을 이메일",
    emailPlaceholder: "you@company.com",
    messageLabel: "문의 내용",
    messagePlaceholder: "만들고 싶은 것과 원하는 일정, 예산 범위를 알려 주세요. 정리되지 않아도 괜찮아요.",
    submit: "문의 보내기",
    submitting: "보내는 중…",
    notice: {
      title: "개인정보 수집·이용 안내 (필수)",
      rows: [
        { term: "목적", desc: "문의 확인과 답변, 견적·상담" },
        {
          term: "항목",
          desc: "이메일, 문의 내용, 문의 분야, (선택) 이름 또는 회사명",
          note: "스팸 방지를 위해 접속 IP를 복원할 수 없는 값(해시)으로 바꿔 함께 저장해요.",
        },
        { term: "보유 기간", desc: "문의 종료 후 1년" },
        { term: "거부 안내", desc: "동의하지 않으셔도 돼요. 다만 동의하지 않으면 폼으로 문의를 받을 수 없어요. 이 경우 hello@lab98.io로 직접 메일 주세요." },
      ],
    },
    consentLabel: "위 개인정보 수집·이용에 동의해요 (필수)",
    policyBefore: "자세한 내용은",
    policyLink: "개인정보처리방침",
    policyAfter: "에서 확인할 수 있어요.",
    policyNewTab: "새 탭에서 열려요",
    errors: {
      emailRequired: "답장받을 이메일을 입력해 주세요.",
      emailInvalid: "이메일 형식을 확인해 주세요. 예: you@company.com",
      messageRequired: "문의 내용을 한 줄 이상 적어 주세요.",
      messageTooLong: "2,000자 안으로 줄여 주세요. 자료는 답장 메일로 보내 주셔도 돼요.",
      nameTooLong: "이름 또는 회사명은 100자 안으로 적어 주세요.",
      consentRequired: "개인정보 수집·이용에 동의해 주셔야 문의를 보낼 수 있어요.",
    },
    // Shown above the form when sending fails; followed by the email address.
    failure: {
      rateLimited: "짧은 시간에 문의가 많이 들어와 잠시 막아 두었어요. 10분 뒤 다시 보내 주시거나",
      server: "문의를 보내지 못했어요. 잠시 뒤 다시 시도해 주시거나",
      fallbackAfter: "로 직접 메일을 보내 주세요.",
    },
    success: {
      eyebrow: "문의가 접수됐어요",
      title: "문의해 주셔서 감사해요. 영업일 기준 2일 안에 입력하신 이메일로 답장드릴게요.",
      fallbackBefore: "급한 일이라면",
      fallbackAfter: "로 바로 연락 주셔도 돼요.",
      reset: "새 문의 쓰기",
    },
  },
} as const;

/** Everything the home components read, as one bundle (see copy.en.ts for the English twin + getHomeCopy). */
export const homeCopy = { heroCopy, trustCopy, praiseCopy, servicesCopy, projectsCopy, processCopy, founderCopy, insightsCopy, contactCopy, interestLabel };
