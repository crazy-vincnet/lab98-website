/** Page-level UI strings for the insights routes. Content lives in lib/content.ts. */
export const notesCopy = {
  meta: {
    title: "인사이트",
    description: "Lab98이 일하는 방식과 Dev · AI · Faith 세 사업부의 이야기를 글로 나눠요.",
    notFoundTitle: "글을 찾을 수 없어요",
    /** detail title: `{title} | Lab98 인사이트` */
    detailTitle: (title: string) => `${title} | Lab98 인사이트`,
  },
  index: {
    eyebrow: "INSIGHTS",
    title: "인사이트",
    lead: "Lab98이 어떤 생각으로 일하는지, 웹과 프로그램, AI 교육, 사역 도구를 만들며 무엇을 배웠는지 적어 둬요.",
    listLabel: "인사이트 목록",
    moreLabel: "지난 글",
  },
  list: { featured: "LATEST", read: "글 읽기", readTime: "{min}분 읽기", by: "글" },
  detail: {
    back: "← 인사이트",
    backBottom: "← 모든 인사이트",
    writtenBy: "글",
    pager: { label: "다른 인사이트", prev: "← 이전 글", next: "다음 글 →" },
    cta: {
      eyebrow: "Contact",
      title: "함께 만들고 싶은 게 있나요?",
      lead: "웹사이트나 프로그램 제작, AI 교육, 사역에 필요한 도구까지 편하게 문의해 주세요. 영업일 기준 2일 안에 답장드려요.",
      action: "문의하기",
    },
    explore: {
      label: "더 둘러보기",
      services: [
        { slug: "dev", title: "Lab98 Dev", body: "웹·프로그램 제작" },
        { slug: "ai", title: "Lab98 AI", body: "AI 교육·커뮤니티" },
        { slug: "faith", title: "Lab98 Faith", body: "교회·선교단체 프로그램" },
      ],
      praiseTool: { title: "Praise Tool", body: "예배용 가사·미디어 송출 프로그램" },
    },
  },
} as const;
