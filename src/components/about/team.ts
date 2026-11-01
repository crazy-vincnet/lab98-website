/**
 * Team data for the About page.
 * TODO(content): add a short bio for each member and confirm the open roles before launch.
 */

export type TeamMember = {
  kind: "member";
  nameKo: string;
  nameEn: string;
  role: string;
  title: string;
  /** shown in the monogram block instead of a photo */
  initials: string;
};

export type OpenRole = {
  kind: "open";
  role: string;
  body: string;
};

export const team: (TeamMember | OpenRole)[] = [
  { kind: "member", nameKo: "전영재", nameEn: "Vincent Jeon", role: "대표", title: "Founder", initials: "VJ" },
  { kind: "open", role: "프로덕트 디자이너", body: "작게 나눈 프로젝트를 빠르게 화면으로 옮기는 일을 함께해요." }, // TODO(content)
  { kind: "open", role: "풀스택 개발자", body: "1주 안에 작동하는 결과물을 함께 만들어요." }, // TODO(content)
  { kind: "open", role: "콘텐츠 에디터", body: "프로젝트에서 얻은 인사이트를 읽기 좋은 글로 정리해요." }, // TODO(content)
];

export const principles = [
  { code: "SMALL", title: "작게 시작해요", body: "프로젝트를 1주 안에 결과를 볼 수 있는 단위로 나눠, 초기 비용과 위험을 줄여요. 작게 시작하면 방향을 바꾸기도 쉬워요." },
  { code: "SHIP", title: "빠르게 오픈해요", body: "긴 문서 대신 실제로 작동하는 결과물을 먼저 보여 드리고, 피드백으로 다듬어요. 직접 써 보면 결정이 빨라져요." },
  { code: "REPORT", title: "성과로 보고해요", body: "시작할 때 핵심 지표를 함께 정하고, 결과를 숫자로 투명하게 공유해요. 목표에 못 미친 결과도 다음 결정에 쓸 수 있게 정리해 드려요." },
];

export const steps = [
  { code: "GOAL", title: "목표 합의하기", body: "이루고 싶은 것을 한 문장으로 정리하고, 성공을 판단할 핵심 지표를 함께 정해요." },
  { code: "BUILD", title: "1주 안에 만들기", body: "목표를 확인할 수 있는 가장 작은 결과물을 1주 안에 만들어 오픈해요." },
  { code: "MEASURE", title: "지표로 확인하기", body: "실제 사용자 데이터를 합의한 지표와 비교해 성과를 확인해요." },
  { code: "REPORT", title: "리포트하고 다음으로", body: "결과와 다음 단계 제안을 리포트로 드리고, 다음 스프린트를 함께 정해요." },
];
