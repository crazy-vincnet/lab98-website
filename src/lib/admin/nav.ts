/** Sidebar sections. `ready: false` pages render <ComingSoon/>; the stage that builds a page flips it to true. */
export type NavItem = { href: string; label: string; ready: boolean; hint?: string };
export type NavGroup = { title: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  { title: "", items: [{ href: "/admin", label: "대시보드", ready: true }] },
  {
    title: "받은 요청",
    items: [
      { href: "/admin/inquiries", label: "문의", ready: true, hint: "홈페이지로 들어온 문의를 보고 답장해요." },
      { href: "/admin/launch", label: "Praise Tool 알림", ready: true, hint: "출시 알림을 신청한 분들을 보고 메일을 보내요." },
      { href: "/admin/privacy", label: "개인정보 요청", ready: true, hint: "열람·정정·삭제 요청을 확인하고 처리해요." },
      { href: "/admin/optouts", label: "수신거부", ready: true, hint: "메일 수신거부 목록을 확인해요." },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      { href: "/admin/blog", label: "블로그", ready: true, hint: "글을 쓰고 예약·발행해요." },
      { href: "/admin/content", label: "사이트·홈·서비스·소개 문구", ready: true, hint: "공통 문구와 홈, 서비스, 소개 페이지 글을 고쳐요." },
      { href: "/admin/projects", label: "프로젝트", ready: true, hint: "프로젝트 목록과 상세를 고쳐요." },
      { href: "/admin/praise-tool", label: "Praise Tool 페이지", ready: true, hint: "Praise Tool 소개 페이지 문구를 고쳐요." },
      { href: "/admin/faq", label: "FAQ", ready: true, hint: "자주 묻는 질문을 추가하고 고쳐요." },
      { href: "/admin/legal", label: "법적 문서", ready: true, hint: "개인정보처리방침, 이용약관, 쿠키 안내를 고쳐요." },
      { href: "/admin/media", label: "미디어", ready: true, hint: "이미지를 올리고 대체 텍스트를 관리해요." },
    ],
  },
  {
    title: "설정",
    items: [
      { href: "/admin/search", label: "SEO·검색 등록", ready: true },
      { href: "/admin/audit", label: "감사 로그", ready: true },
    ],
  },
];

export const ADMIN_NAV_FLAT = ADMIN_NAV.flatMap((g) => g.items);

export const navItem = (href: string) => ADMIN_NAV_FLAT.find((i) => i.href === href);
