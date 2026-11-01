/**
 * Site content — real Lab98 data (confirmed with the founder, 2026-11-01).
 * Keep UI code free of hard-coded copy that belongs here, so swapping content never touches components.
 */

import type { Locale } from "@/lib/i18n";

export type DivisionSlug = "dev" | "ai" | "faith";
export type Division = "master" | DivisionSlug;

/** Widened shape of `site` so the English dictionary (content.en.ts) can satisfy it. */
export type SiteInfo = {
  name: string;
  slogan: string;
  sloganLines: readonly string[];
  sloganEn: string;
  sloganOriginal: string;
  description: string;
  url: string;
  email: string;
  replyTime: string;
  social: readonly { label: string; href: string }[];
  founder: { name: string; nameEn: string; display: string; role: string; born: number };
  nameMeaning: string;
  business: { name: string; representative: string; registrationNumber: string; address: string };
};

export type NavItem = { label: string; href: string };

/** Korean content (default locale). English lives in content.en.ts; pick with getContent(locale). */
export const site = {
  name: "Lab98",
  /** Home hero slogan (polished). */
  slogan: "기술은 도구일 뿐, 주인공은 사람입니다.",
  sloganLines: ["기술은 도구일 뿐,", "주인공은 사람입니다."],
  sloganEn: "Technology is the tool. People are the point.",
  /** The founder's original words — shown on About and in the first insight post. */
  sloganOriginal: "기술은 인간을 편하게! 기술은 주인이 아닌 그저 도구입니다.",
  description:
    "Lab98은 웹사이트·쇼핑몰·Mac/Windows 프로그램 제작(Dev), AI 교육과 커뮤니티(AI), 교회와 선교단체를 위한 프로그램(Faith)을 다루는 회사예요. 사람이 더 중요한 일에 집중하도록 쓰기 편한 도구를 만들어요.",
  url: "https://lab98.io",
  email: "hello@lab98.io",
  replyTime: "영업일 기준 2일 안에 답장드려요",
  /** No accounts yet — UI hides the Follow column while this is empty. */
  social: [] as { label: string; href: string }[],
  founder: { name: "전영재", nameEn: "Vincent Jeon", display: "전영재(Vincent Jeon)", role: "Founder · Developer", born: 1998 },
  /** "98" = the founder's birth year. */
  nameMeaning: "Lab98의 98은 파운더 전영재(Vincent Jeon)가 태어난 해, 1998년이에요.",
  business: {
    /** Lab98 is a brand of this registered business. */
    name: "제이제이드림(JJdream)",
    representative: "전영재",
    registrationNumber: "793-65-00566",
    address: "", // TODO(content): founder will provide
  },
} as const;

export const nav = [
  { label: "회사 소개", href: "/about" },
  { label: "서비스", href: "/#services" },
  { label: "프로젝트", href: "/projects" },
  { label: "Praise Tool", href: "/praise-tool" },
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
  dev: { bg: "bg-dev", text: "text-dev-text", textDark: "text-dev-text-dark", border: "border-dev", name: "Dev" },
  ai: { bg: "bg-ai", text: "text-ai-text", textDark: "text-ai-text-dark", border: "border-ai", name: "AI" },
  faith: { bg: "bg-faith", text: "text-faith-text", textDark: "text-faith-text-dark", border: "border-faith", name: "Faith" },
};

export type DivisionInfo = {
  slug: DivisionSlug;
  name: string; // "Lab98 Dev"
  short: string; // "Dev"
  /** One-line role, e.g. "웹·프로그램 제작" */
  role: string;
  headline: string;
  summary: string;
  description: string;
  /** What this division makes / offers. */
  services: { title: string; body: string }[];
  /** How a project runs (Dev) or how to start (AI/Faith). */
  process: { title: string; body: string }[];
  /** Short facts shown as chips/badges. */
  facts: { label: string; value: string }[];
  /** Primary call to action. */
  cta: { label: string; interest: Division };
  /** Optional status note (e.g. community platform coming soon). */
  status?: { label: string; body: string };
};

export const divisions: DivisionInfo[] = [
  {
    slug: "dev",
    name: "Lab98 Dev",
    short: "Dev",
    role: "웹·프로그램 제작",
    headline: "필요한 웹과 프로그램을 처음부터 맞춤으로 만들어요",
    summary: "회사 홈페이지, 쇼핑몰, Mac·Windows 프로그램을 템플릿 없이 커스텀으로 제작해요. 오픈과 함께 소스 코드까지 넘겨 드려요.",
    description:
      "모든 결과물은 고객이 일하는 방식에 맞춰 처음부터 설계해요. 미팅에서 해결할 문제를 함께 정리하고, 시안으로 먼저 확인한 뒤 만들어요. 배포할 때 소스 코드도 드리니까 나중에 어디서 관리하더라도 막히지 않아요.",
    services: [
      { title: "회사 홈페이지", body: "회사와 기관을 소개하고 문의·후원·신청도 받는 홈페이지를 기획부터 디자인, 개발까지 맡아요." },
      { title: "쇼핑몰", body: "상품 소개부터 주문까지, 운영하는 방식에 맞춘 쇼핑몰을 만들어요." },
      { title: "Mac·Windows 프로그램", body: "반복되는 업무를 덜어 주는 데스크톱 프로그램을 Mac과 Windows용으로 만들어요." },
    ],
    process: [
      { title: "미팅", body: "해결하고 싶은 문제와 목표, 일정을 함께 정리해요." },
      { title: "시안", body: "화면과 구조를 먼저 보여 드리고 방향을 확정해요." },
      { title: "제작", body: "확정한 시안으로 실제 결과물을 만들어요." },
      { title: "수정", body: "직접 써 보시고 필요한 부분을 고쳐요." },
      { title: "배포 및 코드 공유", body: "오픈과 함께 소스 코드를 넘겨 드려요." },
      { title: "마무리", body: "운영 방법까지 안내해 드려요." },
    ],
    facts: [
      { label: "시작 가격", value: "200만 원부터" },
      { label: "제작 방식", value: "100% 커스텀" },
      { label: "결과물", value: "소스 코드 제공" },
    ],
    cta: { label: "Dev 프로젝트 문의하기", interest: "dev" },
  },
  {
    slug: "ai",
    name: "Lab98 AI",
    short: "AI",
    role: "AI 교육·커뮤니티",
    headline: "AI, 써 보긴 했는데 막막하다면",
    summary: "온라인·오프라인 강의와 학교·기업 교육으로 AI를 제대로 쓰는 법을 알려 드려요. 배운 뒤에도 함께 나누는 커뮤니티 플랫폼을 만들고 있어요.",
    description:
      "AI라는 좋은 도구가 생겼지만 막연히 어려워하거나 몇 번 써 보고 그만두는 분이 많아요. 그래서 Lab98 AI를 시작했어요. 제대로 된 AI 교육 프로그램으로, AI가 사람을 대신하는 게 아니라 사람이 AI를 도구로 잘 쓰도록 도와요.",
    services: [
      { title: "온라인·오프라인 강의", body: "처음 시작하는 분부터 업무에 바로 쓰고 싶은 분까지, 수준에 맞춘 강의를 열어요." },
      { title: "학교 교육", body: "학생과 교사가 AI를 바르게 잘 쓰도록 돕는 교육 프로그램을 진행해요." },
      { title: "기업 교육", body: "팀의 실제 업무를 예제로 삼아 내일부터 쓸 수 있는 AI 활용법을 알려 드려요." },
      { title: "AI 커뮤니티 플랫폼", body: "배운 것을 서로 묻고 나누는 자체 커뮤니티 플랫폼을 만들고 있어요." },
    ],
    process: [
      { title: "교육 문의", body: "대상과 인원, 원하는 주제를 알려 주세요." },
      { title: "맞춤 설계", body: "수준과 목적에 맞춰 커리큘럼을 제안해요." },
      { title: "교육 진행", body: "온라인 또는 오프라인으로 실습 중심 교육을 진행해요." },
      { title: "커뮤니티", body: "교육 후에도 커뮤니티에서 계속 묻고 나눌 수 있어요." },
    ],
    facts: [
      { label: "형태", value: "온라인 · 오프라인" },
      { label: "대상", value: "개인 · 학교 · 기업" },
      { label: "커뮤니티", value: "오픈 예정" },
    ],
    cta: { label: "AI 교육 문의하기", interest: "ai" },
    status: { label: "오픈 예정", body: "Lab98 AI 커뮤니티 플랫폼을 만들고 있어요. 열리면 가장 먼저 알려 드릴게요." },
  },
  {
    slug: "faith",
    name: "Lab98 Faith",
    short: "Faith",
    role: "교회·선교단체 프로그램",
    headline: "사역에 필요한 프로그램, 만들고 운영까지 함께해요",
    summary: "교회와 선교단체, 그리스도인에게 필요한 프로그램을 제작하고 배포하고 운영해요. 첫 제품은 예배용 가사·미디어 송출 프로그램 Praise Tool이에요.",
    description:
      "사역 현장에는 매주 반복되는 일이 많아요. 그 일을 덜어 주는 도구가 있으면 사람에게 더 집중할 수 있어요. Lab98 Faith는 교회와 선교단체가 실제로 쓰는 프로그램을 만들고, 배포한 뒤에도 운영과 업데이트를 이어 가요.",
    services: [
      { title: "예배·사역 프로그램", body: "예배 송출, 사역 관리처럼 현장에서 매주 쓰는 프로그램을 만들어요." },
      { title: "배포와 운영", body: "설치부터 업데이트, 문제 해결까지 배포한 뒤의 운영도 함께해요." },
      { title: "맞춤 제작", body: "교회와 선교단체에 꼭 필요한 기능이 무엇인지 듣고 맞춤 프로그램을 만들어요." },
    ],
    process: [
      { title: "필요 듣기", body: "사역 현장에서 반복되는 일과 불편한 점을 들어요." },
      { title: "제작", body: "현장에서 바로 쓸 수 있는 프로그램으로 만들어요." },
      { title: "배포", body: "Mac·Windows에서 쉽게 설치하고 쓸 수 있게 배포해요." },
      { title: "운영", body: "업데이트와 지원으로 계속 함께해요." },
    ],
    facts: [
      { label: "대상", value: "교회 · 선교단체 · 그리스도인" },
      { label: "첫 제품", value: "Praise Tool" },
      { label: "출시", value: "2026. 11. 11" },
    ],
    cta: { label: "Faith 프로그램 문의하기", interest: "faith" },
  },
];

export function getDivision(slug: string) {
  return divisions.find((d) => d.slug === slug);
}

export type Project = {
  slug: string; // URL slug
  division: DivisionSlug;
  client: string; // organization name
  clientEn?: string;
  title: string; // what we built
  summary: string; // one line: what the organization does
  url: string; // live site
  scope: string; // "기획 · 디자인 · 개발"
  type: string; // "웹사이트"
  highlights: { title: string; body: string }[];
  languages?: string[];
  /** Screenshots in /public/projects */
  images: { desktop: string; mobile: string };
};

const SCOPE = "기획 · 디자인 · 개발";

export const projects: Project[] = [
  {
    slug: "nkhb",
    division: "dev",
    client: "뉴코리아 희망방송",
    clientEn: "NKHB",
    title: "뉴코리아 희망방송(NKHB) 웹사이트",
    summary: "라디오 전파로 북한 주민에게 진실과 희망, 복음을 전하는 대북 라디오 방송이에요.",
    url: "https://www.nkhb.org/",
    scope: SCOPE,
    type: "웹사이트",
    highlights: [
      { title: "웹에서 바로 듣는 방송", body: "사이트에서 오늘의 방송을 바로 들려주고, 소개 영상으로 방송의 배경을 전해요." },
      { title: "희망의 편지", body: "방문자가 사이트에서 북한 주민에게 보낼 희망의 편지를 써요." },
      { title: "후원 설계", body: "월 정기 후원 금액을 고르거나 방송 제작 단위(30분부터 1달까지)로 후원하게 해서 참여 방법을 분명하게 했어요." },
      { title: "방송 시간·주파수 안내", body: "방송 구성, 기대 효과, 방송 시간과 주파수를 한눈에 볼 수 있게 정리했어요." },
    ],
    languages: ["한국어", "English"],
    images: { desktop: "/projects/nkhb-desktop.webp", mobile: "/projects/nkhb-mobile.webp" },
  },
  {
    slug: "nkfi",
    division: "dev",
    client: "뉴코리아 파운데이션 인터내셔널",
    clientEn: "NKFI",
    title: "NKFI · New Korea Foundation International 웹사이트",
    summary: "탈북 난민의 회복과 통일한국을 준비하는 국제 NGO예요.",
    url: "https://newkoreafi.org/",
    scope: SCOPE,
    type: "웹사이트",
    highlights: [
      { title: "4대 핵심 사역", body: "동원·훈련·네트워킹·구호, 네 가지 사역을 한눈에 이해하도록 구성했어요." },
      { title: "소식 게시판과 뉴스레터", body: "NKFI 소식 게시판과 뉴스레터 구독으로 후원자와 꾸준히 소통해요." },
      { title: "국내·해외 후원 안내", body: "국내, 해외, 온라인 후원 방법을 나눠 안내하고 한국·미국 사무소 연락처를 담았어요." },
      { title: "한국어·영어", body: "국제 NGO에 맞게 한국어와 영어로 운영해요." },
    ],
    languages: ["한국어", "English"],
    images: { desktop: "/projects/nkfi-desktop.webp", mobile: "/projects/nkfi-mobile.webp" },
  },
  {
    slug: "pbf",
    division: "dev",
    client: "생명동행기금",
    clientEn: "Provision Bridge Fund",
    title: "생명동행기금 · Provision Bridge Fund 웹사이트",
    summary: "후원자와 사역자를 이어, 선교사가 보험 걱정 없이 사역에 집중하도록 돕는 기금이에요.",
    url: "https://pbfmission.com/",
    scope: SCOPE,
    type: "웹사이트",
    highlights: [
      { title: "후원 신청", body: "매칭·지정 후원과 정기 후원을 사이트에서 바로 신청할 수 있어요." },
      { title: "보험 지원 신청과 진행 조회", body: "사역자가 보험 지원을 신청하고 진행 상황도 직접 조회해요." },
      { title: "법적 동의 절차", body: "개인정보·민감정보 처리와 제3자 제공 동의를 절차에 맞게 설계했어요." },
      { title: "FAQ와 자료실", body: "자주 묻는 질문, 후원금 운영 안내, 팸플릿 PDF 다운로드를 갖췄어요." },
    ],
    languages: ["한국어"],
    images: { desktop: "/projects/pbf-desktop.webp", mobile: "/projects/pbf-mobile.webp" },
  },
  {
    slug: "pray4nk",
    division: "dev",
    client: "Pray4NK",
    title: "Pray4NK · 느헤미야 100만 기도서명 웹사이트",
    summary: "북한을 위한 느헤미야 100만 기도서명 운동이에요. 81개국에서 함께 기도하고 있어요.",
    url: "https://pray4nk.org/",
    scope: SCOPE,
    type: "웹사이트",
    highlights: [
      { title: "온라인 기도 서명", body: "30초면 끝나는 기도 서명과 실시간 서명 현황으로 참여를 이끌어요." },
      { title: "기도 지도", body: "전 세계에서 함께 기도하는 사람들을 지도로 보여 줘요." },
      { title: "이달의 기도 제목", body: "매달 기도 제목을 올리고 지난 기도 제목은 모아 둬요." },
      { title: "기도 편지 구독", body: "월간 기도 편지 구독으로 기도하는 사람들과 계속 연결돼요." },
    ],
    languages: ["한국어", "English"],
    images: { desktop: "/projects/pray4nk-desktop.webp", mobile: "/projects/pray4nk-mobile.webp" },
  },
  {
    slug: "befriends",
    division: "dev",
    client: "딱친구",
    clientEn: "BeFriends",
    title: "딱친구 BeFriends 웹사이트",
    summary: "남과 북의 사람들이 서로를 이해하고 친구가 되도록 잇는 사회통합 플랫폼이에요.",
    url: "https://befriends8.org/",
    scope: SCOPE,
    type: "웹사이트",
    highlights: [
      { title: "프로그램 소개", body: "딱친구 워크숍, 다가치 프로젝트, 1박 2일 프로그램을 페이지마다 따로 소개해요." },
      { title: "프로그램별 소식", body: "소식 게시판을 프로그램마다 나눠 만들었어요." },
      { title: "유형별 문의", body: "프로그램·협력·후원 문의를 유형별로 나눠 받아요." },
      { title: "워크숍 참가 신청", body: "워크숍 참가 신청을 사이트에서 바로 받아요." },
    ],
    languages: ["한국어"],
    images: { desktop: "/projects/befriends-desktop.webp", mobile: "/projects/befriends-mobile.webp" },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** Partner organizations, for the home trust strip. */
export const clients = projects.map((p) => ({ name: p.clientEn ? `${p.client} (${p.clientEn})` : p.client, short: p.clientEn ?? p.client, url: p.url }));

export type NoteBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "olist"; items: string[] };

export type Note = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO date
  division: Division;
  readingMinutes: number;
  author: string;
  body: NoteBlock[];
};

export const notes: Note[] = [
  {
    slug: "starting-lab98",
    title: "기술은 주인이 아니라 도구예요: Lab98을 시작하며",
    excerpt: "Lab98을 왜 시작했는지, 세 사업부(Dev·AI·Faith)가 무엇을 하는지, 앞으로 어디로 가려는지 정리했어요.",
    date: "2026-11-01",
    division: "master",
    readingMinutes: 5,
    author: "전영재(Vincent Jeon)",
    body: [
      { type: "p", text: "안녕하세요. Lab98을 시작한 전영재(Vincent Jeon)예요. 회사를 소개하는 첫 글이라 우리가 어떤 생각으로 일하는지부터 이야기해 보려고 해요." },
      { type: "h2", text: "기술은 인간을 편하게" },
      { type: "p", text: "Lab98의 슬로건은 이 한 문장이에요." },
      { type: "quote", text: "기술은 인간을 편하게! 기술은 주인이 아닌 그저 도구입니다." },
      { type: "p", text: "개발을 하다 보면 기술 자체가 목적이 되는 순간을 자주 봐요. 새로운 도구를 쓰기 위해 일하는 방식을 억지로 바꾸고 복잡한 시스템 때문에 오히려 사람이 더 바빠지기도 해요. 저는 그 반대가 맞다고 생각해요. 기술은 사람의 일을 덜어 주고 더 중요한 일에 집중하게 돕는 도구여야 해요." },
      { type: "p", text: "그래서 Lab98은 \"무엇을 만들 수 있는가\"보다 \"이걸 쓰는 사람이 더 편해지는가\"를 먼저 물어요." },
      { type: "h2", text: "이름에 담긴 98" },
      { type: "p", text: "Lab98의 98은 제가 태어난 해, 1998년이에요. 거창한 의미를 붙이기보다는 제 이름을 걸고 하는 일이라는 뜻을 담고 싶었어요. 결과물 하나하나에 책임을 지겠다는 약속이에요." },
      { type: "h2", text: "Lab98이 하는 세 가지 일" },
      { type: "p", text: "Lab98은 세 개의 사업부로 일해요. 분야는 달라도 기준은 같아요. 기술이 사람을 돕는지 먼저 봐요." },
      { type: "h3", text: "1. Lab98 Dev: 웹과 프로그램 제작" },
      { type: "p", text: "회사 홈페이지, 쇼핑몰, Mac·Windows 프로그램을 만들어요. 모든 결과물은 템플릿 없이 고객에게 맞춰 처음부터 커스텀으로 만들어요. 진행은 이렇게 해요." },
      {
        type: "olist",
        items: [
          "미팅: 해결하고 싶은 문제와 목표를 함께 정리해요.",
          "시안: 화면과 구조를 먼저 보여 드려요.",
          "제작: 확정된 시안으로 실제 결과물을 만들어요.",
          "수정: 직접 써 보시고 필요한 부분을 고쳐요.",
          "배포 및 코드 공유: 오픈과 함께 소스 코드도 넘겨 드려요.",
          "마무리: 운영 방법까지 안내하고 마무리해요.",
        ],
      },
      { type: "p", text: "특히 코드 공유를 중요하게 생각해요. 만든 결과물은 고객의 것이어야 하고 나중에 다른 곳에서 이어서 관리하더라도 막히지 않아야 해요. 제작은 200만 원부터 시작해요." },
      { type: "p", text: "지금까지 뉴코리아 희망방송(NKHB), NKFI, 생명동행기금, Pray4NK, 딱친구 BeFriends의 웹사이트를 기획부터 디자인, 개발까지 맡았어요. 방송 듣기, 기도 서명, 후원 신청, 보험 지원 신청과 조회처럼 각 기관에 꼭 필요한 기능을 함께 만들었어요." },
      { type: "h3", text: "2. Lab98 AI: AI 교육과 커뮤니티" },
      { type: "p", text: "AI 사업부를 시작한 이유는 단순해요. 주변을 보면 AI를 제대로 쓰지 못하는 분들이 정말 많다고 느꼈어요. 좋은 도구가 생겼는데, 막연하게 어렵거나 무섭게 느끼거나 몇 번 써 보고 그만두는 경우가 많았어요." },
      { type: "p", text: "그래서 제대로 된 AI 교육 프로그램을 만들려고 해요. 온라인·오프라인 강의, 학교 교육, 기업 교육으로 시작해요. 배운 뒤에도 함께 질문하고 나눌 수 있도록 자체 커뮤니티 플랫폼도 만들고 있어요. 커뮤니티는 곧 열 예정이에요." },
      { type: "p", text: "여기서도 기준은 같아요. AI가 사람을 대신하는 게 아니라, 사람이 AI를 도구로 잘 쓰게 돕는 거예요." },
      { type: "h3", text: "3. Lab98 Faith: 교회와 선교단체를 위한 프로그램" },
      { type: "p", text: "교회와 선교단체, 그리스도인에게 필요한 프로그램을 만들고 배포하고 운영까지 함께해요. 사역 현장에는 반복되는 일이 많아요. 그 일을 덜어 주는 도구가 있으면 사람에게 더 집중할 수 있어요." },
      { type: "p", text: "첫 제품은 Praise Tool이에요. 찬양 가사와 설교 슬라이드, 성경 구절, 영상을 한 프로그램에서 준비하고 송출하는 예배용 프로그램이에요. 관객 화면, 무대 모니터, 방송용 NDI까지 동시에 내보낼 수 있어요. Mac과 Windows를 지원하고 2026년 11월 11일에 출시할 예정이에요. 가격은 10만 원이고 한 번 구매하면 계속 쓰는 영구 라이선스예요." },
      { type: "h2", text: "지금의 Lab98" },
      { type: "p", text: "지금 Lab98은 개발자이자 파운더인 저 혼자 시작했어요. 작은 팀이라 장점도 있어요. 고객과 직접 이야기하고, 기획부터 개발까지 한 사람이 끝까지 책임져요." },
      { type: "p", text: "함께할 사람도 찾고 있어요." },
      { type: "list", items: ["디자이너: 사용하는 사람이 편한 화면을 함께 고민할 분", "풀스택 개발자: 웹과 프로그램을 함께 만들어 갈 분", "작가: 기술과 사역 이야기를 쉬운 글로 풀어 줄 분"] },
      { type: "h2", text: "함께 만들어요" },
      { type: "p", text: "만들고 싶은 웹사이트나 프로그램이 있다면, AI 교육이 필요하다면, 사역에 필요한 도구가 있다면 편하게 문의해 주세요. 영업일 기준 2일 안에 답장드릴게요." },
      { type: "p", text: "기술은 주인이 아니라 도구예요. Lab98은 그 도구를 잘 만들고 잘 쓰도록 돕는 회사가 되려고 해요." },
    ],
  },
];

export function getNote(slug: string) {
  return notes.find((n) => n.slug === slug);
}

export function formatDate(iso: string, locale: Locale = "ko") {
  const [y, m, d] = iso.split("-");
  if (locale === "en") return `${EN_MONTHS[Number(m) - 1] ?? m} ${Number(d)}, ${y}`; // "Nov 1, 2026" (no Date: prerender-safe)
  return `${y}. ${m}. ${d}`;
}
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Praise Tool launch date (KST). Single source for countdowns and copy. */
export const PRAISE_TOOL_LAUNCH = "2026-11-11";

/* ---------------------------------------------------------------- FAQ */

export type Faq = { q: string; a: string };
export type FaqKey = "home" | "dev" | "ai" | "faith" | "praiseTool";

const devInfo = divisions.find((d) => d.slug === "dev")!;
/** "뉴코리아 희망방송(NKHB), 뉴코리아 파운데이션 인터내셔널(NKFI), …" */
const projectNames = projects.map((p) => (p.clientEn && /^[A-Z]+$/.test(p.clientEn) ? `${p.client}(${p.clientEn})` : p.client)).join(", ");

/**
 * Visible FAQ sections (home, service pages, Praise Tool). Rendered as-is and mirrored 1:1 in FAQPage JSON-LD
 * and /llms-full.txt, so every answer must stay verifiable from the facts above (no prices other than the ones
 * published, no dates that aren't confirmed).
 */
export const faqs: Record<FaqKey, Faq[]> = {
  home: [
    {
      q: "Lab98은 어떤 회사인가요?",
      a: "웹사이트·쇼핑몰·Mac/Windows 프로그램을 만드는 Dev, AI 교육을 하는 AI, 교회와 선교단체 프로그램을 만드는 Faith, 세 사업부로 일하는 회사예요. 사업자는 제이제이드림(JJdream)이고 Lab98은 그 브랜드예요.",
    },
    { q: "Lab98의 98은 무슨 뜻인가요?", a: site.nameMeaning },
    {
      q: "누가 만드나요?",
      a: `개발자이자 파운더인 ${site.founder.display}이 시작했어요. 고객과 직접 이야기하고 기획부터 개발까지 끝까지 맡아요.`,
    },
    { q: "지금까지 어떤 곳의 웹사이트를 만들었나요?", a: `${projectNames}의 웹사이트를 기획부터 디자인, 개발까지 맡았어요.` },
    { q: "문의하면 언제 답장을 받나요?", a: `문의 양식이나 ${site.email}로 연락 주시면 ${site.replyTime}.` },
  ],
  dev: [
    { q: "홈페이지 제작 비용은 얼마인가요?", a: "200만 원부터 시작해요. 만들 범위를 들은 뒤 정확한 견적을 알려 드려요." },
    { q: "쇼핑몰도 만들 수 있나요?", a: "네, 상품 소개부터 주문까지 운영하는 방식에 맞춘 쇼핑몰을 만들어요. 템플릿 없이 처음부터 맞춤으로 제작해요." },
    { q: "Mac·Windows 프로그램도 만드나요?", a: "네, 반복되는 업무를 덜어 주는 데스크톱 프로그램을 Mac과 Windows용으로 만들어요." },
    {
      q: "어떤 순서로 진행되나요?",
      a: `${devInfo.process.map((s) => s.title).join(" → ")}, ${devInfo.process.length}단계로 진행해요. 시안으로 화면과 구조를 먼저 확인한 뒤 만들어요.`,
    },
    { q: "제작이 끝나면 소스 코드를 받을 수 있나요?", a: "네, 배포할 때 소스 코드를 함께 넘겨 드려요. 나중에 다른 곳에서 관리하더라도 막히지 않아요." },
    { q: "어떤 곳의 사이트를 만들었나요?", a: `${projectNames}의 웹사이트를 만들었어요. 프로젝트 페이지에서 화면과 주요 기능을 볼 수 있어요.` },
  ],
  ai: [
    { q: "AI 교육은 어떤 방식으로 하나요?", a: "온라인과 오프라인 강의로 진행하고, 실습 중심이에요. 처음 시작하는 분부터 업무에 바로 쓰고 싶은 분까지 수준에 맞춰요." },
    { q: "학교나 기업 단체 교육도 하나요?", a: "네, 학교 교육과 기업 교육을 진행해요. 기업 교육은 팀의 실제 업무를 예제로 삼아 다음 날부터 쓸 수 있게 알려 드려요." },
    { q: "교육 내용은 어떻게 정하나요?", a: "대상과 인원, 원하는 주제를 알려 주시면 수준과 목적에 맞춰 커리큘럼을 제안해요." },
    { q: "AI 교육 비용은 얼마인가요?", a: "공개된 가격표는 없어요. 대상과 인원, 주제를 들은 뒤 따로 안내해 드려요." },
    { q: "AI 커뮤니티는 언제 열리나요?", a: "지금 만들고 있고, 오픈 예정이에요. 열리면 가장 먼저 알려 드릴게요." },
  ],
  faith: [
    {
      q: "Lab98 Faith는 무엇을 만드나요?",
      a: "교회와 선교단체, 그리스도인에게 필요한 프로그램을 만들고 배포하고 운영해요. 첫 제품은 예배용 가사·미디어 송출 프로그램 Praise Tool이에요.",
    },
    { q: "교회 맞춤 프로그램도 의뢰할 수 있나요?", a: "네, 사역 현장에서 반복되는 일과 불편한 점을 듣고 꼭 필요한 기능을 담아 맞춤 프로그램을 만들어요." },
    { q: "만든 뒤에도 관리해 주나요?", a: "설치부터 업데이트, 문제 해결까지 배포한 뒤의 운영도 함께해요." },
    { q: "어떤 컴퓨터에서 쓸 수 있나요?", a: "Mac과 Windows에서 쉽게 설치하고 쓸 수 있게 배포해요." },
    { q: "Praise Tool은 언제 출시되나요?", a: "2026년 11월 11일에 출시해요. 가격은 10만 원이고, 한 번 구매하면 계속 쓰는 영구 라이선스예요." },
  ],
  praiseTool: [
    {
      q: "Praise Tool은 어떤 프로그램인가요?",
      a: "찬양 가사, 설교 슬라이드, 성경 구절, 영상을 한 프로그램에서 준비하고 송출하는 예배용 프로그램이에요. 관객 화면, 무대 모니터, 방송용 NDI로 동시에 내보낼 수 있어요.",
    },
    { q: "언제 출시되고 가격은 얼마인가요?", a: "2026년 11월 11일에 출시해요. 가격은 100,000원이고, 한 번 구매하면 계속 쓰는 영구 라이선스예요." },
    { q: "어떤 운영체제를 지원하나요?", a: "macOS와 Windows를 모두 지원해요. 프로그램 화면은 한국어, English, 中文, 日本語로 쓸 수 있어요." },
    { q: "NDI를 지원하나요?", a: "네, NDI로 OBS, vMix, Wirecast 같은 방송 프로그램에 바로 보낼 수 있어요. 다만 macOS Intel 버전에서는 NDI를 쓸 수 없어요." },
    { q: "스마트폰으로 슬라이드를 넘길 수 있나요?", a: "네, 같은 Wi-Fi에 연결된 스마트폰으로 슬라이드를 넘겨요. Stream Deck으로도 제어할 수 있어요." },
    { q: "출시 알림은 어떻게 받나요?", a: "이 페이지의 출시 알림 신청에 이메일을 남겨 주세요. 출시되면 한 번만 알려 드리고, 광고 메일은 보내지 않아요." },
  ],
};
