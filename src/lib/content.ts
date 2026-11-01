/**
 * Site content. Everything here is EXAMPLE content (placeholder) until the
 * Lab98 team replaces it with real data. Keep UI code free of hard-coded copy
 * that belongs here, so swapping content never touches components.
 */

export type DivisionSlug = "web" | "ai" | "faith";
export type Division = "master" | DivisionSlug;

export const site = {
  name: "Lab98",
  slogan: "We test, we ship.",
  tagline: "작게 실험하고 빠르게 배워요",
  description:
    "Lab98은 웹사이트, AI 업무 자동화, 신앙 공동체 콘텐츠 프로젝트를 1주 단위 스프린트로 기획하고 만들어요. 빠르게 오픈하고, 합의한 지표로 성과를 확인해요.",
  url: "https://lab98.co",
  // TODO(content): confirm the public contact address before launch.
  email: "youngjae1009@gmail.com",
  replyTime: "영업일 기준 2일 안에 답장드려요", // TODO(content)
  social: [
    { label: "Instagram", href: "#" }, // TODO(content)
    { label: "YouTube", href: "#" }, // TODO(content)
  ],
} as const;

export const nav = [
  { label: "회사 소개", href: "/about" },
  { label: "서비스", href: "/#services" },
  { label: "프로젝트", href: "/projects" },
  { label: "인사이트", href: "/insights" },
  { label: "문의", href: "/#contact" },
] as const;

/** Brand asset paths (public/brand). `inverse` = for dark backgrounds. */
export function symbolSrc(d: Division, inverse = false) {
  return `/brand/symbol/lab98-${d}-symbol${inverse ? "-inverse" : ""}.svg`;
}
export function lockupSrc(d: Division, inverse = false) {
  return `/brand/lockup/lab98-${d}-lockup${inverse ? "-inverse" : ""}.svg`;
}

/**
 * Tailwind class names per division, written out in full so Tailwind can
 * detect them. `text` = small text on white, `textDark` = small text on ink.
 */
export const divisionTheme: Record<Division, { bg: string; text: string; textDark: string; border: string; name: string }> = {
  master: { bg: "bg-red", text: "text-red-text", textDark: "text-red-text-dark", border: "border-red", name: "Lab98" },
  web: { bg: "bg-web", text: "text-web-text", textDark: "text-web-text-dark", border: "border-web", name: "Web" },
  ai: { bg: "bg-ai", text: "text-ai-text", textDark: "text-ai-text-dark", border: "border-ai", name: "AI" },
  faith: { bg: "bg-faith", text: "text-faith-text", textDark: "text-faith-text-dark", border: "border-faith", name: "Faith" },
};

export type DivisionInfo = {
  slug: DivisionSlug;
  name: string; // "Lab98 Web"
  short: string; // "Web"
  headline: string;
  summary: string;
  description: string;
  services: { title: string; body: string }[];
  /** what a typical 1-week sprint looks like in this division */
  sampleCycle: string[];
};

// TODO(content): division copy is a draft written from the brand file.
export const divisions: DivisionInfo[] = [
  {
    slug: "web",
    name: "Lab98 Web",
    short: "Web",
    headline: "웹사이트와 랜딩 페이지, 일주일이면 오픈해요",
    summary: "브랜드 사이트와 랜딩 페이지를 1주 스프린트로 기획, 디자인, 개발해요. 오픈한 뒤에는 방문과 문의 데이터를 보며 계속 개선해요.",
    description:
      "오래 준비한 완성본보다 핵심 메시지를 담은 첫 버전을 먼저 오픈해요. 시작할 때 목표 지표를 함께 정하고, 실제 방문자 데이터로 다음 개선 범위를 제안해요. 출시를 앞둔 스타트업, 행사와 캠페인 담당자에게 특히 잘 맞아요.",
    services: [
      { title: "랜딩 페이지", body: "제품, 행사, 캠페인 하나를 소개하는 한 페이지 사이트를 7일 안에 오픈해요." },
      { title: "브랜드 사이트", body: "회사 소개, 서비스, 문의 폼까지 갖춘 사이트를 단계별로 오픈하고 운영까지 함께해요." },
      { title: "전환율 개선", body: "문구, 버튼, 페이지 구성을 A/B 테스트해 문의와 신청 전환을 높여요." },
    ],
    sampleCycle: ["월 · 목표 지표와 핵심 메시지 합의", "화–목 · 디자인과 개발, 중간 공유", "금 · 오픈", "다음 주 · 데이터 리포트와 개선 제안"],
  },
  {
    slug: "ai",
    name: "Lab98 AI",
    short: "AI",
    headline: "반복 업무에 쓰는 시간, AI로 줄여 드려요",
    summary: "회의록 정리, 문서 검색, 보고서 초안처럼 매주 반복되는 업무를 AI 도구로 자동화해요. 업무 하나부터 시작해 2–4주 안에 현업에서 쓰게 해요.",
    description:
      "대규모 AI 도입 대신 효과가 가장 분명한 업무 하나를 골라 자동화해요. 담당자가 최종 검토하는 단계를 설계에 넣어 믿고 쓸 수 있게 만들고, 줄어든 업무 시간을 숫자로 보고해요.",
    services: [
      { title: "업무 자동화", body: "회의록 정리, 보고서 초안처럼 반복되는 문서 작업을 자동화해 담당자의 시간을 돌려드려요." },
      { title: "사내 문서 검색", body: "흩어진 사내 문서를 연결해 질문 하나로 필요한 자료를 찾게 해요." },
      { title: "AI 프로토타입", body: "검토 중인 AI 아이디어를 1주 안에 직접 써 볼 수 있는 시제품으로 만들어, 도입 여부를 판단하도록 도와요." },
    ],
    sampleCycle: ["월 · 자동화할 업무와 목표 시간 합의", "화–목 · 프로토타입 개발", "금 · 실제 담당자 사용 테스트", "다음 주 · 절감 시간 리포트"],
  },
  {
    slug: "faith",
    name: "Lab98 Faith",
    short: "Faith",
    headline: "공동체가 매일 쓰는 콘텐츠와 도구를 만들어요",
    summary: "교회와 신앙 공동체를 위한 묵상 콘텐츠, 챌린지 프로그램, 모임 페이지를 만들어요. 작게 시작하고 참여율로 효과를 확인해요.",
    description:
      "교회, 선교단체, 소모임이 부담 없이 시작할 수 있는 규모로 기획해요. 묵상 콘텐츠, 함께 읽기 챌린지, 모임 신청 페이지처럼 성도가 매일 쓰는 것부터 만들고, 참여율과 완주율을 보며 다음 운영을 함께 설계해요.",
    services: [
      { title: "묵상 콘텐츠", body: "하루 10분 묵상을 돕는 카드뉴스와 묵상 노트를 기획하고 제작해요." },
      { title: "공동체 챌린지", body: "30일 함께 읽기처럼 서로 응원하며 이어 가는 프로그램을 설계하고 운영을 도와요." },
      { title: "공동체 웹", body: "교회와 모임을 위한 소개 페이지, 행사와 모임 신청 폼을 빠르게 만들어요." },
    ],
    sampleCycle: ["월 · 공동체 목표와 참여 지표 합의", "화–목 · 콘텐츠와 도구 제작", "금 · 공동체에 오픈", "다음 주 · 참여율 리포트"],
  },
];

export function getDivision(slug: string) {
  return divisions.find((d) => d.slug === slug);
}

export type ExperimentStatus = "live" | "running" | "archived";

export type Experiment = {
  code: string; // URL slug = lowercase display code, e.g. "ai-042"
  label: string; // display code, e.g. "AI-042"
  division: DivisionSlug;
  title: string;
  summary: string;
  status: ExperimentStatus;
  /** 0–100 */
  progress: number;
  progressLabel: string; // "WEEK 4 / 4"
  stage: string; // "베타 오픈"
  startedAt: string; // ISO date
  hypothesis: string;
  successMetric: string;
  result?: string;
  learnings: string[];
  relatedNote?: string; // note slug
};

// TODO(content): all projects below are examples.
export const experiments: Experiment[] = [
  {
    code: "ai-042",
    label: "AI-042",
    division: "ai",
    title: "회의록 자동 정리 도구",
    summary: "교육 스타트업 A사 운영팀의 회의록 정리 시간을 회의 1건당 32분에서 9분으로 줄였어요.",
    status: "live",
    progress: 100,
    progressLabel: "WEEK 4 / 4",
    stage: "베타 운영 중",
    startedAt: "2026-10-01",
    hypothesis: "운영팀이 회의록 정리에 쓰는 시간을 절반 이하로 줄여요.",
    successMetric: "회의 1건당 정리 시간 30분 → 15분 이하",
    result: "4주 만에 회의 1건당 평균 정리 시간이 32분에서 9분으로 줄었어요.",
    learnings: ["담당자가 마지막에 검토하는 단계를 넣자 팀이 결과를 믿고 쓰기 시작했어요.", "출력 형식을 결정 사항 · 할 일 · 담당자로 고정하니 품질이 안정됐어요."],
    relatedNote: "meeting-notes-in-9-minutes",
  },
  {
    code: "web-007",
    label: "WEB-007",
    division: "web",
    title: "신제품 사전 신청 랜딩 페이지",
    summary: "소비재 브랜드 B사의 신제품 사전 신청 페이지를 기획부터 오픈까지 7일 안에 만들고 있어요.",
    status: "running",
    progress: 57,
    progressLabel: "DAY 4 / 7",
    stage: "디자인 중",
    startedAt: "2026-10-27",
    hypothesis: "핵심 메시지 하나에 집중해 7일 안에 오픈하고 사전 신청을 받아요.",
    successMetric: "7일 안에 오픈 · 방문자 신청 전환율 2% 이상",
    learnings: ["첫날 핵심 메시지를 한 문장으로 합의하자 이후 일정이 흔들리지 않았어요."],
  },
  {
    code: "faith-030",
    label: "FAITH-030",
    division: "faith",
    title: "30일 묵상 챌린지 운영",
    summary: "지역 교회 공동체가 하루 10분 묵상을 30일 동안 이어 가도록 알림과 묵상 노트를 함께 운영하고 있어요.",
    status: "running",
    progress: 40,
    progressLabel: "DAY 12 / 30",
    stage: "챌린지 진행 중",
    startedAt: "2026-10-20",
    hypothesis: "매일 같은 시간에 짧은 알림을 보내 30일 완주율을 높여요.",
    successMetric: "30일 완주율 40% 이상",
    learnings: ["중간 점검 결과, 아침 7시 알림의 응답률이 가장 높았어요."],
    relatedNote: "ten-minutes-a-day",
  },
  {
    code: "ai-012",
    label: "AI-012",
    division: "ai",
    title: "사내 문서 검색 도입 검증",
    summary: "IT 서비스 기업 C사의 사내 검색 도입 전 2주 검증. 문서 정비가 먼저라는 결론으로 방향을 바꿨어요.",
    status: "archived",
    progress: 100,
    progressLabel: "완료",
    stage: "검증 완료",
    startedAt: "2026-08-04",
    hypothesis: "직원이 질문 하나로 원하는 문서를 3번 안에 찾게 해요.",
    successMetric: "검색 성공률 80% 이상",
    result: "검색 성공률 64%로 목표에 못 미쳤어요. 원인이 문서 품질이라는 걸 2주 만에 확인해, 본격 도입 전에 문서 정비부터 하기로 했어요.",
    learnings: ["검색 도구보다 문서를 정리하는 운영 습관이 먼저였어요.", "2주짜리 검증으로 시작한 덕분에 큰 비용 없이 방향을 바꿀 수 있었어요."],
    relatedNote: "why-we-archived-ai-012",
  },
  {
    code: "web-005",
    label: "WEB-005",
    division: "web",
    title: "문의 버튼 문구 A/B 테스트",
    summary: "B2B 서비스 기업 D사 웹사이트의 문의 버튼 문구를 바꿔 클릭률을 31% 높였어요.",
    status: "archived",
    progress: 100,
    progressLabel: "완료",
    stage: "프로젝트 완료",
    startedAt: "2026-07-14",
    hypothesis: "방문자가 부담 없이 누를 수 있는 문구로 문의 버튼 클릭률을 높여요.",
    successMetric: "버튼 클릭률 20% 상승",
    result: "‘아이디어 보내기’가 ‘문의하기’보다 클릭률이 31% 높았어요.",
    learnings: ["행동을 요구하는 문구보다 방문자가 얻는 결과를 말하는 문구가 더 잘 작동했어요."],
  },
  {
    code: "faith-021",
    label: "FAITH-021",
    division: "faith",
    title: "모임 신청 페이지 템플릿",
    summary: "작은 교회와 소모임 담당자가 10분 안에 모임 신청 페이지를 만들 수 있는 템플릿을 만들어 공개했어요.",
    status: "live",
    progress: 100,
    progressLabel: "WEEK 3 / 3",
    stage: "공개 운영 중",
    startedAt: "2026-09-08",
    hypothesis: "개발 경험이 없는 담당자도 10분 안에 신청 페이지를 만들게 해요.",
    successMetric: "첫 페이지 제작 시간 중앙값 10분 이하",
    result: "제작 시간 중앙값 8분. 가장 오래 걸린 사진 올리기 단계를 개선하고 있어요.",
    learnings: ["선택지를 줄일수록 담당자가 더 빨리 완성했어요."],
  },
];

export function getExperiment(code: string) {
  return experiments.find((e) => e.code === code);
}

export type NoteBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; text: string };

export type Note = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO date
  division: Division;
  experiment?: string; // project code slug (Experiment.code)
  readingMinutes: number;
  author: string;
  body: NoteBlock[];
};

// TODO(content): all notes below are examples.
export const notes: Note[] = [
  {
    slug: "meeting-notes-in-9-minutes",
    title: "회의록 정리 시간을 32분에서 9분으로 줄인 방법",
    excerpt: "AI-042 사례. 교육 스타트업 A사와 4주 동안 일하며 확인한 것, 자동화보다 중요했던 건 ‘사람의 최종 검토’ 단계였어요.",
    date: "2026-10-29",
    division: "ai",
    experiment: "ai-042",
    readingMinutes: 4,
    author: "Lab98 AI",
    body: [
      { type: "p", text: "회의가 끝나면 누군가는 회의록을 정리해야 해요. 교육 스타트업 A사 운영팀은 이 일에 회의 1건당 평균 32분을 쓰고 있었어요." },
      { type: "h2", text: "프로젝트 목표" },
      { type: "quote", text: "운영팀이 회의록 정리에 쓰는 시간을 절반 이하로 줄여요." },
      { type: "h2", text: "무엇을 만들었나" },
      { type: "list", items: ["회의 녹취를 넣으면 결정 사항 · 할 일 · 담당자로 나눠 주는 정리 도구", "담당자가 결과를 확인하고 고치는 검토 화면", "정리에 걸린 시간을 자동으로 기록하는 측정 기능"] },
      { type: "code", text: "$ lab98 ship --project=ai-042\n→ build: 7 days · measure: 12 users\n✓ shipped." },
      { type: "h2", text: "핵심 인사이트" },
      { type: "p", text: "자동화만으로는 팀이 결과를 믿지 않았어요. 담당자가 마지막에 30초 동안 확인하는 단계를 넣자 사용률이 크게 올랐어요. AI 도입을 검토하고 있다면, 사람의 검토 단계를 처음부터 설계에 넣기를 권해요." },
    ],
  },
  {
    slug: "ten-minutes-a-day",
    title: "묵상 습관, 결심보다 환경이 먼저예요",
    excerpt: "FAITH-030 진행 기록. 지역 교회 공동체와 30일 묵상 챌린지를 운영하며 확인하고 있는 것을 공유해요.",
    date: "2026-10-20",
    division: "faith",
    experiment: "faith-030",
    readingMinutes: 3,
    author: "Lab98 Faith",
    body: [
      { type: "p", text: "좋은 습관은 결심보다 환경에서 시작된다고 믿어요. 그래서 지역 교회 공동체와 함께 하루 10분만 내면 되는 묵상 챌린지를 설계했어요." },
      { type: "h2", text: "무엇을 확인하고 있나요" },
      { type: "list", items: ["알림 시간에 따라 참여율이 달라질까요?", "함께하는 사람이 있으면 더 오래 이어 갈까요?"] },
      { type: "p", text: "챌린지가 끝나는 30일 뒤에 결과를 이 글에 이어서 공유할게요." },
    ],
  },
  {
    slug: "why-we-archived-ai-012",
    title: "2주 검증으로 방향을 바꾼 사내 검색 프로젝트",
    excerpt: "AI-012 사례. 목표에 못 미친 결과도 공유해요. 2주 만에 확인한 덕분에 큰 도입 비용을 아낄 수 있었어요.",
    date: "2026-09-02",
    division: "ai",
    experiment: "ai-012",
    readingMinutes: 5,
    author: "Lab98 AI",
    body: [
      { type: "p", text: "C사와 합의한 검색 성공률 목표는 80%였고, 결과는 64%였어요. 목표에는 닿지 못했지만 본격 도입 전 2주 만에 이 사실을 확인할 수 있었어요." },
      { type: "h2", text: "문제는 도구가 아니었어요" },
      { type: "p", text: "제목이 없는 문서, 같은 내용의 여러 버전이 검색 품질을 떨어뜨렸어요. 도구를 바꾸기 전에 문서를 정리하는 운영 습관이 먼저였어요. 그래서 C사와 함께 문서 정비를 다음 단계로 정했어요." },
      { type: "quote", text: "작게 검증하면, 큰 비용을 쓰기 전에 방향을 바꿀 수 있어요." },
    ],
  },
  {
    slug: "how-we-run-experiments",
    title: "Lab98이 프로젝트를 진행하는 방식",
    excerpt: "목표 합의 · 1주 제작 · 지표 확인 · 리포트. 모든 프로젝트가 거치는 네 단계를 소개해요.",
    date: "2026-08-18",
    division: "master",
    readingMinutes: 6,
    author: "Lab98",
    body: [
      { type: "p", text: "Lab98의 모든 프로젝트는 프로젝트 코드와 한 문장 목표로 시작해요. 코드와 목표가 있으면 고객과 우리 모두 무엇을 이루려 했는지 잊지 않아요." },
      { type: "h2", text: "네 단계" },
      { type: "list", items: ["목표 합의 — 한 문장 목표와 숫자로 된 핵심 지표", "1주 안에 만들기 — 바로 쓸 수 있는 가장 작은 결과물", "지표로 확인하기 — 실제 사용자 데이터", "리포트하고 다음으로 — 잘 안 된 것까지 투명하게"] },
      { type: "p", text: "Web, AI, Faith 세 사업부가 모두 이 방식으로 일해요. 그래서 어느 사업부와 일하든 진행 상황을 같은 방식으로 확인할 수 있어요." },
    ],
  },
];

export function getNote(slug: string) {
  return notes.find((n) => n.slug === slug);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}. ${m}. ${d}`;
}
