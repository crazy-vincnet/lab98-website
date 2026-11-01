/** Page-level UI strings for the projects routes. Content lives in lib/content.ts. Wording: docs/copy-guide.md 5-3. */
export const experimentsCopy = {
  meta: {
    title: "프로젝트 사례",
    description: "Lab98이 만든 웹, AI, 신앙 공동체 프로젝트 사례예요. 목표, 핵심 지표, 결과를 투명하게 공개해요.",
    notFoundTitle: "프로젝트를 찾을 수 없어요",
  },
  index: {
    eyebrow: "PROJECTS",
    title: "프로젝트 사례",
    lead: "고객 프로젝트와 자체 프로젝트의 목표, 핵심 지표, 결과를 공개해요.",
    listLabel: "프로젝트 목록",
    /** Summary line noun, e.g. `6 PROJECTS · 2 LIVE …` */
    summaryNoun: "PROJECTS",
  },
  filters: {
    division: "서비스",
    status: "상태",
    all: "전체",
    results: "RESULTS",
    reset: "필터 초기화",
  },
  empty: {
    eyebrow: "NO RESULTS",
    title: "이 조건에 맞는 프로젝트가 아직 없어요.",
    body: "다른 서비스나 상태를 선택해 보세요.",
    action: "필터 초기화",
  },
  table: {
    code: "Code",
    division: "Service",
    title: "Title",
    status: "Status",
    progress: "Progress",
    started: "Started",
    progressAria: "진행률",
  },
  detail: {
    back: "← 모든 프로젝트",
    backBottom: "← 모든 프로젝트",
    meta: { division: "서비스", startedAt: "시작일", stage: "현재 단계", progress: "진행률" },
    spec: { eyebrow: "Spec sheet", title: "목표와 결과", hypothesis: "목표", metric: "핵심 지표", result: "결과", pending: "프로젝트가 끝나면 결과를 공개해요." },
    learnings: { eyebrow: "Key points", title: "핵심 포인트" },
    run: { eyebrow: "Run log", title: "진행 기록" },
    /** Actions render their own aria-hidden "→" (nudges on hover). */
    related: { eyebrow: "Related", title: "더 알아보기", noteEyebrow: "INSIGHT", noteAction: "사례 글 읽기", divisionEyebrow: "SERVICE", divisionAction: "서비스 보기" },
    pager: { label: "다른 프로젝트", prev: "← 이전 프로젝트", next: "다음 프로젝트 →" },
    contactBand: { title: "비슷한 프로젝트를 고민하고 있나요?", cta: "프로젝트 문의하기" },
  },
  terminal: {
    heading: "RUN LOG",
    command: "lab98 ship --project=",
    live: "✓ shipped. now live.",
    running: "… in progress",
    archived: "■ done. report shared.",
  },
} as const;
