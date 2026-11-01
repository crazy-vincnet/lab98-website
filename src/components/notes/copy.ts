/** Page-level UI strings for the insights routes. Content lives in lib/content.ts. Wording: docs/copy-guide.md 5-4. */
export const notesCopy = {
  meta: {
    title: "인사이트",
    description: "프로젝트 사례, 일하는 방식, 웹 · AI · 신앙 공동체 분야의 실무 노하우를 공유해요.",
    notFoundTitle: "글을 찾을 수 없어요",
    /** detail title: `{title} | Lab98 인사이트` */
    detailTitle: (title: string) => `${title} | Lab98 인사이트`,
  },
  index: {
    eyebrow: "INSIGHTS",
    title: "인사이트",
    lead: "프로젝트 사례, 일하는 방식, 분야별 실무 노하우를 정리해 공유해요.",
    listLabel: "인사이트 목록",
    summaryNoun: "INSIGHTS",
    latest: "LATEST",
  },
  filters: { division: "서비스", all: "전체", results: "INSIGHTS" },
  empty: {
    eyebrow: "COMING SOON",
    title: "이 주제의 글은 준비 중이에요.",
    body: "다른 주제를 둘러보세요.",
    action: "전체 글 보기",
  },
  /** `read` renders its own aria-hidden "→" (nudges on hover). */
  list: { featured: "LATEST INSIGHT", read: "글 읽기", readTime: (min: number) => `${min}분 읽기`, min: "MIN" },
  detail: {
    back: "← 모든 인사이트",
    backBottom: "← 모든 인사이트",
    writtenBy: "글:",
    experimentCard: { label: "관련 프로젝트" },
    pager: { label: "다른 인사이트", prev: "← 이전 글", next: "다음 글 →" },
    contactBand: { title: "이 글과 비슷한 고민이 있나요?", cta: "프로젝트 문의하기" },
  },
} as const;
