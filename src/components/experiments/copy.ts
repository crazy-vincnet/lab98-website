/** Page-level UI strings for the projects routes. Content lives in lib/content.ts. */
export const projectsCopy = {
  meta: {
    title: "프로젝트",
    description: "Lab98 Dev가 기획부터 디자인, 개발까지 맡아 만든 기관 웹사이트예요. 모든 결과물은 커스텀으로 제작하고 소스 코드까지 넘겨 드려요.",
    notFoundTitle: "프로젝트를 찾을 수 없어요",
  },
  index: {
    eyebrow: "PROJECTS",
    title: "Lab98 Dev가 만든 사이트",
    lead: (count: number) => `${count}개 기관의 웹사이트를 기획부터 디자인, 개발까지 맡았어요.`,
    leadMore: "모든 결과물은 템플릿 없이 커스텀으로 제작하고, 오픈과 함께 소스 코드까지 넘겨 드려요.",
    listLabel: "프로젝트 목록",
    count: (count: number) => `${count} PROJECTS`,
  },
  detail: {
    back: "← 프로젝트",
    backBottom: "← 모든 프로젝트",
    meta: { division: "분야", scope: "범위", type: "유형", languages: "언어" },
    visit: "사이트 방문하기",
    visitAria: (client: string) => `${client} 웹사이트 방문하기 (새 창)`,
    shots: { eyebrow: "Screens", title: "데스크톱과 모바일 화면" },
    highlights: { eyebrow: "Features", title: "주요 기능" },
    pager: { label: "다른 프로젝트", prev: "← 이전 프로젝트", next: "다음 프로젝트 →" },
    alt: {
      desktop: (client: string) => `${client} 웹사이트 데스크톱 첫 화면`,
      mobile: (client: string) => `${client} 웹사이트 모바일 첫 화면`,
    },
  },
  cta: {
    eyebrow: "Contact",
    title: "우리 기관에 맞는 사이트가 필요하다면",
    lead: "기획부터 디자인, 개발까지 맞춤으로 만들고 소스 코드까지 넘겨 드려요. 제작은 200만 원부터 시작해요.",
    action: "Dev 프로젝트 문의하기",
  },
} as const;
