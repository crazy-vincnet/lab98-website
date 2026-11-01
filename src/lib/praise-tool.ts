/**
 * Praise Tool product page copy (/praise-tool). Source: client brief, 2026-11-01.
 * Parts of the brief were truncated when pasted; every item completed by us is marked `// reconstructed`
 * and must be confirmed with the client before launch. Product descriptions keep the client's 합니다체;
 * UI labels and the signup form use the site's 해요체.
 */

/** One feature line. `title` is the bold lead-in; some brief lines have none. */
export type PtItem = { title?: string; body: string };
export type PtGroup = { key: string; title: string; items: PtItem[] };

export const praiseTool = {
  meta: {
    title: "Praise Tool — 예배를 위한 가사·미디어 송출 프로그램",
    description:
      "찬양 가사, 설교 슬라이드, 성경 구절, 영상을 하나의 프로그램에서 준비하고 송출해요. 관객 화면·무대 모니터·방송용 NDI 동시 출력, macOS·Windows 지원. 2026년 11월 11일 출시 예정.",
  },

  hero: {
    eyebrow: "Lab98 Faith · 첫 제품",
    title: "Praise Tool",
    sub: "예배를 위한 가사·미디어 송출 프로그램",
    lead: "찬양 가사, 설교 슬라이드, 성경 구절, 영상을 하나의 프로그램에서 준비하고 송출합니다. 관객 화면, 무대 모니터, 방송용 NDI까지 동시에 내보내니 예배 한 번을 이 프로그램 하나로 진행할 수 있습니다.",
    badges: ["macOS · Windows", "한국어 · English · 中文 · 日本語"],
    priceLabel: "가격",
    price: "100,000원",
    license: "영구 라이선스",
    licenseNote: "한 번 구매하면 계속 사용",
    launchLabel: "출시",
    launch: "2026년 11월 11일 출시 예정",
    ctaNotify: "출시 알림 받기",
    ctaFeatures: "주요 기능 보기",
    screenshot: "스크린샷 준비 중",
    screenshotAlt: "Praise Tool 운영 화면 스크린샷 자리",
  },

  /** D-day badge (Asia/Seoul). */
  dday: {
    label: "출시까지",
    today: "오늘 출시",
    released: "출시됨",
    /** Shown before the browser computes the real value. */
    fallback: "11.11",
  },

  glance: {
    eyebrow: "At a glance",
    title: "한눈에 보기",
    items: [
      { title: "가사 붙여 넣기 한 번으로 슬라이드 완성", body: "빈 줄 기준으로 슬라이드가 나뉘고, 1절, 후렴, 브릿지, [Verse 1] 같은 제목은 자동으로 인식됩니다." },
      { title: "여러 화면 동시 송출", body: "관객 화면, 가사만 나오는 방송용 화면, 무대 모니터를 각각 따로 지정합니다." },
      { title: "방송 연동", body: "NDI와 Syphon(macOS)으로 OBS, vMix, Wirecast 등에 바로 보냅니다." },
      { title: "폰으로 넘기기", body: "같은 Wi-Fi의 스마트폰으로 슬라이드를 조작하고, Stream Deck에서도 제어할 수 있습니다." },
      { title: "안전한 송출", body: "자동으로 백업하고 프로그램이 갑자기 꺼져도 마지막 송출 상태를 복구합니다." }, // reconstructed
    ] satisfies PtItem[],
  },

  features: {
    eyebrow: "Features",
    title: "주요 기능",
    lead: "가사 준비부터 송출, 방송 연동, 예배 관리까지 예배에 필요한 기능을 담았어요.",
    groups: [
      {
        key: "lyrics",
        title: "가사 준비",
        items: [
          { title: "붙여 넣기와 가져오기", body: "웹에서 복사해 온 가사의 이상한 공백도 정리해 줍니다. 텍스트, CCLI SongSelect, OpenLyrics 형식의 곡을 가져올 수 있습니다." }, // reconstructed
          { title: "곡 순서(Arrangement)", body: "슬라이드를 복사하지 않고 1절 – 후렴 – 2절 – 후렴 – 브릿지 – 후렴처럼 반복 순서를 만듭니다." }, // reconstructed
          { title: "두 언어 가사", body: "줄 앞에 >를 붙이면 바로 위 줄의 번역이 됩니다. 번역 줄은 원문 아래에 작게 표시됩니다." }, // reconstructed
          { title: "코드와 조옮김", body: "[G]처럼 가사에 코드를 적으면 무대 모니터에만 보이고 관객 화면에는 나오지 않습니다. 코드는 조옮김할 수 있습니다." }, // reconstructed
          { title: "곡 정보와 검색", body: "작사·작곡자, 키, 템포, CCLI 번호, 저작권, 태그를 저장하고 제목·가사·정보로 검색합니다." },
        ],
      },
      {
        key: "design",
        title: "디자인",
        items: [
          { title: "슬라이드 디자인", body: "PPT처럼 글자와 도형을 16:9 화면에 자유롭게 배치해 슬라이드를 꾸밉니다." }, // reconstructed
          { title: "테마", body: "자주 쓰는 디자인을 테마로 저장해 선택한 슬라이드에 적용합니다. 다른 컴퓨터로 내보내고 가져올 수도 있습니다." }, // reconstructed
          { title: "설교·광고 템플릿", body: "제목과 본문 틀을 갖춘 템플릿으로 설교·광고 슬라이드를 만듭니다." }, // reconstructed
          { title: "배경과 전환 효과", body: "단색, 이미지, 반복 영상 배경과 페이드·슬라이드·컷 전환을 지원합니다." }, // reconstructed
        ],
      },
      {
        key: "bible",
        title: "성경 구절",
        items: [
          { title: "구절 바로 찾기", body: "요한복음 3:16-18, 요 3:16처럼 입력하면 그 구절이 나옵니다." }, // reconstructed
          { title: "단어 검색", body: "‘사랑’, ‘믿음’처럼 단어로 검색할 수도 있습니다." },
          { title: "두 번째 성경", body: "두 번째 성경을 고르면 그 구절이 함께 표시됩니다." }, // reconstructed
          { title: "성경 파일 추가", body: "성경 본문은 들어 있지 않습니다. 갖고 계신 성경 파일(텍스트, CSV, JSON, Zefania XML, OSIS XML)을 추가해서 쓰시면 됩니다." }, // reconstructed
        ],
      },
      {
        key: "output",
        title: "송출과 화면",
        items: [
          { title: "화면 역할 지정", body: "연결된 디스플레이마다 관객 화면, 관객 화면(가사만), 무대 모니터 역할을 지정합니다. 설정은 기억되고, 케이블을 뽑았다 다시 꽂으면 창이 저절로 돌아옵니다." }, // reconstructed
          { title: "무대 모니터", body: "현재 가사와 다음 슬라이드, 큰 시계, 타이머, 무대 메모, 코드가 표시됩니다. 레이아웃은 직접 바꿀 수 있습니다." }, // reconstructed
          { title: "레이어 구조", body: "배경, 미디어, 가사, 카운트다운, 로고, 메시지가 겹겹이 쌓입니다. 레이어마다 따로 끄거나 한 번에 모두 끌 수 있습니다." }, // reconstructed
          { title: "미디어", body: "이미지, 영상, 오디오를 클릭 한 번으로 송출합니다. 곡에 MR(반주)을 붙여 두고 재생할 수 있습니다." },
          { title: "카운트다운과 로고", body: "“10분 후”나 “11:00까지” 카운트다운을 띄우고, 구석 로고와 하단 자막 메시지를 표시합니다." },
          { title: "리허설 모드(R)", body: "관객 화면은 그대로 둔 채 운영 화면에서만 슬라이드를 미리 넘겨 봅니다." },
        ],
      },
      {
        key: "broadcast",
        title: "방송·외부 장비 연동",
        items: [
          { title: "NDI 출력", body: "1920×1080, 30fps로 화면 전체를 보내는 모드와 투명 배경에 가사만 보내는 모드(방송 자막용)가 있습니다. 미디어 소리도 NDI 오디오로 함께 나갑니다." }, // reconstructed
          { title: "Syphon 출력(macOS)", body: "같은 Mac의 다른 프로그램으로 화면을 보냅니다." }, // reconstructed
          { title: "폰 리모트", body: "같은 Wi-Fi의 스마트폰에서 이전·다음, 검은 화면, 슬라이드 바로가기를 사용합니다. 예배 순서 목록도 볼 수 있습니다." }, // reconstructed
          { title: "Stream Deck / Bitfocus Companion", body: "HTTP 명령으로 버튼을 만들고 버튼에 현재 상태를 표시합니다." },
          { title: "클리커와 풋페달", body: "별도 설정 없이 바로 쓰고 키는 원하는 대로 바꿀 수 있습니다." },
          { title: "두 대의 컴퓨터 연동", body: "두 번째 컴퓨터가 메인 컴퓨터의 송출을 그대로 따라갑니다. 필요한 미디어 파일도 자동으로 가져옵니다." }, // reconstructed
        ],
      },
      {
        key: "service",
        title: "예배 준비와 관리",
        items: [
          { title: "플레이리스트", body: "예배 순서대로 곡을 담고, 곡이 바뀌어도 이어서 넘깁니다." },
          { title: "예배 템플릿", body: "“주일 1부”를 템플릿으로 저장해 두고 고르기만 하면 같은 구성으로 새 예배가 생깁니다." }, // reconstructed
          { title: "순서지 인쇄·PDF", body: "키, 템포 등을 담은 순서표를 만들고 가사도 함께 넣을 수 있습니다." }, // reconstructed
          { title: "곡 사용 기록과 CCLI 리포트", body: "송출한 곡은 자동으로 기록됩니다. 기간을 정해 CSV로 내보낼 수 있습니다." }, // reconstructed
          { title: "곡 라이브러리", body: "곡을 여러 라이브러리로 나눠 관리할 수 있습니다." }, // reconstructed
        ],
      },
    ] satisfies PtGroup[],
  },

  safety: {
    eyebrow: "Reliability",
    title: "안심하고 쓰는 송출",
    lead: "예배 중에는 멈추면 안 되니까, 문제가 생겨도 화면과 데이터를 지키도록 만들었어요.",
    items: [
      { title: "자동 백업", body: "실행할 때와 변경 사항이 있을 때 자동으로 백업합니다. 최근 30개를 보관하고 언제든 되돌릴 수 있습니다." }, // reconstructed
      { title: "손상 복구", body: "라이브러리 파일이 손상되면 백업으로 자동 복구합니다." }, // reconstructed
      { title: "송출 상태 복구", body: "프로그램이 갑자기 꺼져도 다음 실행 때 “마지막 송출 상태로 복구할까요?”라고 묻습니다. 답하기 전까지는 관객 화면에 아무것도 나가지 않습니다." }, // reconstructed
      { title: "일부 오류만 격리", body: "한 패널에 오류가 생겨도 프로그램 전체가 꺼지지 않습니다. 관객 화면은 검은 화면으로 바뀐 뒤 스스로 다시 시도합니다." }, // reconstructed
      { title: "내 데이터는 내 폴더에", body: "곡을 비롯한 데이터가 모두 Praise Tool 폴더에 있어서 폴더째 복사하면 백업과 이전이 끝납니다." }, // reconstructed
      { title: "안전한 리모트", body: "폰 리모트는 접속 키가 들어간 링크로만 접속할 수 있습니다." }, // reconstructed
    ] satisfies PtItem[],
  },

  requirements: {
    eyebrow: "Requirements",
    title: "지원 환경",
    caption: "Praise Tool 지원 환경",
    head: ["항목", "지원"],
    rows: [
      { label: "macOS", value: "Apple Silicon, Intel" }, // reconstructed
      { label: "Windows", value: "설치 프로그램 제공" }, // reconstructed
      { label: "언어", value: "한국어(기본), English, 中文, 日本語" }, // reconstructed
      { label: "업데이트", value: "앱 안에서 자동 업데이트" }, // reconstructed
    ],
    note: "NDI는 macOS Intel 버전에서 지원되지 않습니다.",
  },

  pricing: {
    eyebrow: "Pricing",
    title: "가격",
    plan: "영구 라이선스",
    price: "100,000원",
    note: "한 번 구매하면 계속 사용할 수 있어요.",
  },

  notify: {
    eyebrow: "Launch alert",
    title: "출시 알림 신청",
    lead: "11월 11일 출시되면 이메일로 한 번 알려 드릴게요. 광고 메일은 보내지 않아요.",
  },

  form: {
    ariaLabel: "Praise Tool 출시 알림 신청",
    emailLabel: "이메일",
    emailPlaceholder: "you@church.org",
    orgLabel: "교회·단체명 (선택)",
    orgPlaceholder: "○○교회 청년부",
    notice: {
      title: "개인정보 수집·이용 안내 (필수)",
      rows: [
        { term: "목적", desc: "Praise Tool 출시 안내 메일 1회 발송" },
        {
          term: "항목",
          desc: "이메일, (선택) 교회·단체명",
          note: "스팸 방지를 위해 접속 IP를 복원할 수 없는 값(해시)으로 바꿔 함께 저장해요.",
        },
        { term: "보유 기간", desc: "안내 발송 후 바로 삭제 (늦어도 출시일로부터 30일)" },
        { term: "거부 안내", desc: "동의하지 않으셔도 돼요. 다만 동의하지 않으면 출시 알림을 받을 수 없어요." },
      ],
    },
    consentLabel: "위 개인정보 수집·이용에 동의해요 (필수)",
    policyBefore: "자세한 내용은",
    policyLink: "개인정보처리방침",
    policyAfter: "에서 확인할 수 있어요.",
    policyNewTab: "새 탭에서 열려요",
    submit: "출시 알림 신청하기",
    submitting: "신청하는 중…",
    errors: {
      emailRequired: "알림받을 이메일을 입력해 주세요.",
      emailInvalid: "이메일 형식을 확인해 주세요. 예: you@church.org",
      orgTooLong: "교회·단체명은 100자 안으로 적어 주세요.",
      consentRequired: "개인정보 수집·이용에 동의해 주셔야 신청할 수 있어요.",
    },
    failure: {
      rateLimited: "짧은 시간에 신청이 많이 들어와 잠시 막아 두었어요. 10분 뒤 다시 시도해 주시거나",
      server: "신청하지 못했어요. 잠시 뒤 다시 시도해 주시거나",
      fallbackAfter: "로 메일을 보내 주세요.",
    },
    success: {
      eyebrow: "신청 완료",
      title: "신청됐어요. 11월 11일 출시되면 이메일로 알려 드릴게요.",
      already: "이미 신청하셨어요. 출시되면 알려 드릴게요.",
      fallbackBefore: "궁금한 점은",
      fallbackAfter: "로 물어봐 주세요.",
      reset: "다른 이메일로 신청하기",
    },
  },

  more: {
    text: "우리 교회에 맞는 기능이나 도입 상담이 필요하신가요?",
    contact: "문의하기",
    division: "Lab98 Faith 서비스 보기",
  },
} as const;
