/**
 * UI copy for the /about page. Swap wording here only.
 * Facts (slogan, founder, name meaning, divisions) come from src/lib/content.ts.
 */
import { site } from "@/lib/content";

export const aboutCopy = {
  meta: {
    title: "회사 소개",
    description: `${site.name}은 사람을 돕는 기술을 만드는 회사예요. 웹·프로그램 제작(Dev), AI 교육(AI), 교회와 선교단체를 위한 프로그램(Faith)을 소개해요.`,
  },
  hero: {
    eyebrow: "About",
    title: "사람을 돕는 기술을 만드는 회사, Lab98",
    primaryCta: "문의하기",
    secondaryCta: "프로젝트 보기",
  },
  founderWords: {
    eyebrow: "Founder's words",
    attribution: `— ${site.founder.display}, Founder`,
    brandLineLabel: "Brand line",
  },
  name: {
    index: "01",
    eyebrow: "Our name",
    title: "이름에 담긴 98",
    promise: "제 이름을 걸고 하는 일, 결과물 하나하나에 책임을 지겠다는 약속이에요.",
  },
  divisions: {
    index: "02",
    eyebrow: "Divisions",
    title: "세 사업부",
    lead: "분야는 달라도 기준은 같아요. 기술이 사람을 돕는지 먼저 봐요.",
    swatchesLabel: "점 하나로 구분해요",
    swatchesBody: "Lab98 로고의 점은 포인트 색이에요. 회사를 대표할 때는 시그널 레드, 사업부마다 블루, 그린, 골드 점을 써요.",
    /** Brand color names (brand file). Roles come from divisions[].role. */
    swatchColor: { master: "SIGNAL RED", dev: "DEV BLUE", ai: "NODE GREEN", faith: "LIGHT GOLD" },
    masterRole: "회사 대표",
  },
  principles: {
    index: "03",
    eyebrow: "Principles",
    title: "일하는 원칙",
    items: [
      { code: "TOOL", title: "기술은 도구예요", body: "무엇을 만들 수 있는지보다, 이걸 쓰는 사람이 더 편해지는지를 먼저 물어요." },
      { code: "CODE", title: "코드까지 드려요", body: "만든 결과물은 고객의 것이에요. 오픈과 함께 소스 코드를 넘겨 드려서 나중에 어디서 관리하더라도 막히지 않아요." },
      { code: "OWN", title: "끝까지 책임져요", body: "기획부터 개발까지 한 사람이 맡아요. 지금은 파운더가 직접 고객과 이야기하고 만들어요." },
    ],
  },
  team: {
    index: "04",
    eyebrow: "Team",
    title: "함께 만드는 사람들",
    lead: "파운더 혼자 시작했고, 지금 함께할 멤버를 찾고 있어요.",
    monogram: "VJ",
    openBadge: "OPEN ROLE",
    openCta: "지원하기",
    roles: [
      { role: "디자이너", body: "사용하는 사람이 편한 화면을 함께 고민할 분" },
      { role: "풀스택 개발자", body: "웹과 프로그램을 함께 만들어 갈 분" },
      { role: "작가", body: "기술과 사역 이야기를 쉬운 글로 풀어 줄 분" },
    ],
    /** mail subject for the apply link */
    applySubject: `[${site.name} 지원] {role}`,
  },
  contactBand: {
    title: "함께 만들 일이 있나요?",
    lead: `만들고 싶은 웹사이트나 프로그램, AI 교육, 사역에 필요한 도구까지 편하게 문의해 주세요. ${site.replyTime}.`,
    cta: "문의하기",
    secondaryCta: "프로젝트 보기",
  },
} as const;
