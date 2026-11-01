/**
 * UI copy for the /about page. Swap wording here only. Wording follows docs/copy-guide.md 5-1.
 * Data-like copy (principles, steps, team) lives in ./team.ts.
 */

export const aboutCopy = {
  meta: {
    title: "회사 소개",
    description: "작게 시작해 빠르게 오픈하고, 합의한 지표로 성과를 보고하는 프로젝트 회사 Lab98의 원칙, 사업부, 팀을 소개해요.",
  },
  hero: {
    eyebrow: (name: string) => `About ${name}`,
    title: "작게 시작해, 성과로 증명하는 프로젝트 파트너",
    mission: "좋은 아이디어가 기획서에 머물지 않도록, 가장 작은 결과물부터 빠르게 만들어 실제 성과로 이어지게 해요.",
    body: "Lab98은 Web, AI, Faith 세 사업부로 고객 프로젝트와 자체 프로젝트를 만들어요. 분야는 달라도 모든 프로젝트는 1주 스프린트와 합의한 지표로 진행해요.",
    primaryCta: "프로젝트 문의하기",
    secondaryCta: "프로젝트 사례 보기",
    // Brand flourish: slogan band (copy guide 2-2 — kept as is).
    bandCommand: "$ lab98 --motto",
    bandMeta: "WEB · AI · FAITH",
    sloganLine1: "We test,",
    sloganLine2: "we ship",
  },
  numbers: {
    ariaLabel: "숫자로 보는 Lab98",
    divisions: { label: "사업부", note: "Web · AI · Faith" },
    live: { label: "운영 중인 결과물", note: "운영 중 상태" },
    running: { label: "진행 중인 프로젝트", note: "진행 중 상태" },
    done: { label: "완료한 프로젝트", note: "완료 상태" },
  },
  principles: { index: "01", eyebrow: "Principles", title: "우리가 일하는 원칙", lead: "기획서보다 먼저, 작동하는 결과물을 보여 드려요." },
  howWeWork: {
    index: "02",
    eyebrow: "How we work",
    title: "1주 스프린트, 네 단계로 일해요",
    lead: "Web, AI, Faith 모든 프로젝트가 같은 네 단계로 진행돼요. 매주 진행 상황을 함께 확인해요.",
    terminalCommand: "lab98 ship",
    terminalArgs: "--project=next",
    terminalSteps: "→ goal → build → measure → report",
    terminalDoneCode: "shipped.",
    terminalDone: "다음 스프린트를 함께 정해요.",
  },
  // TODO(content): brand story — what "98" means. Until the team writes it, this section only states
  // facts from the brand file (README v1.3): the brand line, and the dot = point color per division.
  brandStory: {
    index: "03",
    eyebrow: "Brand",
    title: "점 하나로 구분해요",
    lead: "Lab98 로고의 점은 브랜드의 포인트 색이에요. 회사를 대표할 때는 시그널 레드, 서비스마다 블루, 그린, 골드 점을 써요.",
    swatches: {
      master: { color: "SIGNAL RED", role: "회사 대표" },
      web: { color: "WEB BLUE", role: "웹사이트 · 랜딩 페이지" },
      ai: { color: "NODE GREEN", role: "AI 업무 자동화" },
      faith: { color: "LIGHT GOLD", role: "교회 · 신앙 공동체 콘텐츠" },
    },
    lineLabel: "Brand line",
    lineBody: "프로젝트 카드와 인사이트 글 앞의 점도 같은 규칙을 따라요. 점의 색만 보면 어느 서비스의 일인지 알 수 있어요.",
  },
  team: {
    index: "04",
    eyebrow: "Team",
    title: "팀 소개",
    // TODO(content): confirm the actual headcount and roles.
    lead: "기획, 디자인, 개발, 콘텐츠를 함께 다루는 작은 팀이에요. 프로젝트마다 담당자 한 명이 처음부터 끝까지 고객과 소통해요.",
    openLabel: "함께 일할 동료를 찾아요",
    openBody: "작게 만들고 빠르게 오픈하는 방식이 잘 맞는 분을 기다려요. 지금 열린 포지션이 없어도 포트폴리오를 보내 주시면 꼭 읽어 볼게요.",
    openBadge: "OPEN ROLE",
    openCta: "지원하기",
    /** mail subject for the apply link */
    applySubject: (role: string) => `[Lab98 지원] ${role}`,
  },
  divisions: { index: "05", eyebrow: "Divisions", title: "세 개의 사업부", lead: "Web, AI, Faith. 분야는 달라도 같은 방식으로 빠르게 만들고 성과로 보고해요." },
  contactBand: { title: "함께 만들 프로젝트가 있나요?", lead: "영업일 기준 2일 안에 답장드려요.", cta: "프로젝트 문의하기", secondaryCta: "프로젝트 사례 보기" },
} as const;
