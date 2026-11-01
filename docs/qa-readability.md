# QA — 가독성 · 접근성 (Readability & a11y)

- 대상: http://localhost:3100 프로덕션 빌드 (BUILD_ID 2026-10-31 17:23 UTC), 10개 라우트 × desktop 1440×900 / mobile 390×844
- 방법: Playwright + axe-core 4.10.2 + 자체 스캔(모든 보이는 텍스트 노드의 실효 배경을 조상까지 합성해 WCAG 대비 계산, 홈·실험·노트·사업부·소개 페이지의 모든 `main a` hover 후 재측정, Tab 순회, 모바일 메뉴 키보드 조작, `reducedMotion: 'reduce'` 비교, Range rect 기반 줄 길이/고아 단어 측정, 스크린샷 육안 확인)
- 스크립트·원본 데이터: `/tmp/claude-0/-home-user/0ea757c8-ef2a-4c76-8b91-e27e31595487/scratchpad/qa-read/` (`audit.js`, `dyn.js`, `hov2.js`, `lines.js`, `sem.js`, `audit.json`, `dyn.json`, `shots/`, `crops/`)
- 주의: 측정 중 `src/`가 빌드 이후 수정되고 있었음(예: `site-header.tsx` 17:24 수정). 아래 결과는 **서빙 중인 빌드** 기준이며, 수정 위치는 **현재 소스** 기준. 소스에서 이미 바뀐 것으로 보이는 항목은 따로 표시함.

## 판정

1. 전반적으로 양호함. 토큰 설계(`*-text`, `*-text-dark`, `ink-text`, `gray`) 덕분에 본문·라벨 텍스트는 흰 배경, 콘크리트 배경, 잉크 배경과 hover 반전 상태까지 모두 AA를 통과함. 실제 AA 텍스트 실패는 2건(빨강 CTA, placeholder)과 대형 글리프 1건뿐임.
2. 가장 큰 위험은 대비가 아니라 **모바일 메뉴의 키보드 처리**(Esc 미지원, 포커스 트랩 없음)와 **자동 반복 모션**(ticker 48s 무한, 타이핑 터미널, 2.5s 색 순환)에 일시정지 수단이 없는 점임. `prefers-reduced-motion`은 올바르게 처리됨.
3. 한글 본문 줄 길이(데스크톱 41–53자/줄)와 행간(1.5–1.8)은 적정함. 다만 mono 라벨·터미널 안의 한글은 폴백 폰트와 넓은 공백 때문에 띄엄띄엄 읽힘.

**대비 실패 수(고유 항목): 총 6건 — High 1 · Medium 1 · Low 4** (텍스트 AA 실패 3, 비텍스트 2, 장식 1)
axe `color-contrast` 위반: 1건(홈 CTA, desktop·mobile). axe `aria-progressbar-name`: 7개 페이지에서 총 11개 노드.

## 1. 대비 실패 (Contrast failures)

| # | 페이지/뷰포트 | 요소 | fg | bg | 비율 | 기준 | 수정 |
|---|---|---|---|---|---|---|---|
| C1 **High** | `/` desktop+mobile (hero CTA “진행 중인 실험 보기 →”. 소스에서는 같은 accent 버튼이 현재 문의 CTA로 쓰임) | `a.inline-flex…border-red.bg-red.text-paper` 16px/700 | #FFFFFF | #E8322B | **4.27** | 4.5 | `src/components/ui.tsx:33` accent 변형을 `border-red bg-red` → `border-red-text bg-red-text`로 변경(#DE3029, **4.60**, 눈으로 거의 구분 안 됨). 여유를 원하면 `--color-red-fill: #D42C25`(**5.02**)를 새로 추가해 사용. `bg-red`는 점·장식 용도로만 유지 |
| C2 **Medium** | 문의 폼이 있는 모든 페이지(`/`, `/about`, `/divisions/*`), 두 뷰포트 | `input/textarea::placeholder` “you@company.com”, “어떤 아이디어를…” | #8A8A85 (`muted`) | #FFFFFF (hover 시 #F5F5F3) | **3.47** (hover **3.24**) | 4.5 | `src/components/home/contact-form.tsx:25` `placeholder:text-muted` → `placeholder:text-gray`(6.51)로 변경. 입력값과 구분하려면 새 토큰 `--color-placeholder: #737370`(흰 배경 **4.76**)을 추가. `globals.css`의 `muted` 주석대로 muted는 텍스트에 쓰지 않음 |
| C3 Low | `/about` 팀 그리드 “+” (함께할 동료 카드), 두 뷰포트 | `span.font-logo.text-[96px].text-muted` | #8A8A85 | #E6E6E3 (concrete) | **2.77** | 3 (대형) | `src/components/about/about-sections.tsx:195` `text-muted` → `text-gray`(concrete 위 **5.21**). 흐린 느낌을 원하면 `#6B6B66`(concrete 위 4.28, 대형 기준 통과) |
| C4 Low (장식) | `/` ticker 구분자 “/”, ×24 | `span.pl-5.text-ink-line` (ticker 전체 `aria-hidden`) | #3A3A38 | #111111 | 1.66 | 장식은 예외 | 순수 장식이라 WCAG 예외임. 그래도 보이게 하려면 `src/components/home/hero.tsx:77` `text-ink-line` → `text-[#6A6A66]`(3.48) 또는 `text-ink-text/60` |
| C5 Low (비텍스트) | `/experiments` 표 hover, 사업부·상세 페이지의 archived 진행바 | archived 진행바 채움 `bg-muted`를 트랙 `bg-concrete` 위에 사용 | #8A8A85 | #E6E6E3 | **2.77** (표 hover, 트랙 ink-line 위 3.29) | 3 | 현재 archived 항목은 모두 100%라 실제로 드러나지는 않음. 진행 중에 중단된 실험이 생기면 실패함. `src/components/ui.tsx:107`, `experiment-index.tsx:131,166`, `home/sections.tsx:135`의 `bg-muted` → `bg-gray`(concrete 위 5.21) |
| C6 Low (비텍스트) | 모든 진행바(흰 카드 위) | 트랙 `bg-concrete`와 카드 `bg-paper` | #E6E6E3 | #FFFFFF | 1.25 | 3 (트랙 범위를 알아야 할 때) | 바로 옆에 `DAY 4 / 7` 텍스트가 있어 정보는 전달됨. 트랙 끝을 보이게 하려면 `ui.tsx:106` 등 트랙에 `outline outline-1 outline-line` 또는 `bg-line`(1.43)을 쓰고, 권장안은 트랙 우측 끝 2px `border-r-2 border-ink` |

**통과했지만 여유가 적은 조합 (참고)**: `text-ai-text` #0C8560 / 흰 배경 4.63, `text-faith-text` #9A6D00 / 흰 배경 4.60, `text-red-text` #DE3029 / 흰 배경 4.60. 세 가지 모두 **concrete 배경에서는 실패**함(3.70 / 3.68 / 3.68). 현재 콘크리트 섹션에서 쓰는 곳은 없지만, 앞으로 사업부 색 텍스트를 concrete 위에 올리면 안 됨(`globals.css` 주석에 “*-text는 white 전용” 명시 권장).
`text-gray`/concrete 5.21, `ink-text`/ink 7.45, `ink-text`/ink-2 6.51, `*-text-dark`/ink ≥ 6.7, 포커스 링 #E8322B는 흰 배경 4.27 / concrete 3.41 / ink 4.43 / ink-2 3.87로 모두 비텍스트 3:1을 통과함.
홈 카드 hover 반전(사업부 카드, 실험 카드, 노트 행, `/experiments` 표 행, 사업부 페이지 카드)은 hover 후 재측정해도 실패가 없었음. 측정 중 잡힌 hero 터미널 상태 줄 1.1–1.9:1은 opacity 페이드 중의 일시 값이라 실패로 세지 않음.

## 2. 가독성 (Readability)

| 심각도 | 위치 | 문제 | 수정 |
|---|---|---|---|
| Medium | `/` hero: ticker(`home/hero.tsx:68`), 타이핑 터미널(`home/hero-terminal.tsx`), Lab98 블록 색 순환(`home/hero-block.tsx:38`, 2.5s) | 세 가지 모션이 h1과 리드 문단 바로 옆에서 **무한 반복**됨. ticker는 hover로만 멈추고 키보드·터치로는 멈출 수 없으며, 터미널과 색 순환은 멈출 방법이 없음(WCAG 2.2.2 Pause, Stop, Hide: 5초 넘게 자동 재생). 리드 문단을 읽는 동안 시선이 계속 끌려감. 참고로 `reducedMotion: 'reduce'`에서는 세 가지 모두 정지 상태로 렌더링되고 `rise`·`blink`도 꺼짐을 확인함(정상) | (a) ticker: `group-focus-within:[animation-play-state:paused]`를 추가하고 일시정지/재생 토글 버튼(⏸, `aria-pressed`)을 둠. (b) 터미널: 모든 항목을 한 바퀴 돈 뒤 첫 항목에서 멈춤(`idx === items.length-1` 이후 hold 유지). (c) 색 순환: 2회 순환 후 master로 고정하거나, 같은 토글에 연결 |
| Medium | 전역 mono 텍스트 안의 한글: 터미널(`→ hypothesis: 회의록 정리에…`), 카드 단계 라벨(“디자인 단계 →”, “베타 오픈”, “종료”), `.label` 한글 eyebrow(“사업부”, “이 노트의 실험”, “← 모든 실험”), 폼 안내(“보내기를 누르면 메일 앱이 열려요”) | JetBrains Mono에 한글 글리프가 없어 OS 폴백 폰트로 렌더링됨(이 환경에서는 WenQuanYi Zen Hei Mono, Mac은 Apple SD Gothic Neo). 브랜드 서체와 달라지고, mono 공백(0.6em)과 `tracking 0.04–0.06em`이 더해져 어절 사이가 크게 벌어짐(“회의록␣␣정리에␣␣쓰는”). 12–13px에서는 특히 읽기 어려움 | `src/app/globals.css` `--font-mono`를 `"JetBrains Mono", "IBM Plex Sans KR", ui-monospace, monospace`로 바꿔 한글을 브랜드 산세리프로 렌더링. 한글이 주인 라벨에는 `.label:lang(ko)`나 별도 유틸(`.label-ko { letter-spacing: 0; font-family: var(--font-sans) }`)을 적용. 터미널의 한글 값 부분은 `<span className="font-sans">`로 감쌈(`home/sections.tsx`, `divisions/division-sections.tsx`) |
| Low | 모바일 헤더(서빙 빌드) | “베타 신청” 버튼이 390px에서 두 줄(“베타/신청”)로 줄바꿈되고 헤더 높이를 꽉 채워, 로고·햄버거와 겹쳐 보임. 모바일 메뉴 안에도 같은 CTA가 있음 | 현재 소스 `site-header.tsx:39`에 이미 `max-sm:hidden`이 있으므로 **재빌드 후 확인**. 남겨둔다면 `whitespace-nowrap` 추가 |
| Low | `/`, `/about`, `/divisions/*` 모바일 사업부 카드(AI) 설명 | 마지막 줄 고아 단어 “해요.”(3자). 실험 카드의 “나눠 / 줘요.”도 같은 문제 | `globals.css` base에 `p, li { text-wrap: pretty; }` 추가. 제목에는 `h1,h2,h3 { text-wrap: balance; }` |
| Info (통과) | 본문 전반 | 데스크톱 본문 41–53자/줄(max-w 560–640px), 모바일 24–35자/줄. 행간 1.5–1.8, 노트 본문 1.8. `word-break: keep-all`이라 한글 어절 중간 분리 없음(육안 확인). 양쪽 정렬·가운데 정렬 긴 문단 없음. 바쁜 배경 위 텍스트 없음 | 유지 |

## 3. 접근성 (A11y)

| 심각도 | 위치 | 문제 | 수정 |
|---|---|---|---|
| **High** | 모바일 메뉴 `src/components/site-header.tsx` | 메뉴를 열면 전체 화면 오버레이가 덮지만 (1) **Esc로 닫히지 않음**(측정: Esc 후 `hidden=false`), (2) **포커스가 갇히지 않음**: “베타 신청” 다음 Tab이 오버레이에 가려진 본문 링크(“진행 중인 실험 보기”, WEB/AI/FAITH…)로 넘어가 보이지 않는 곳에 포커스가 생김, (3) 열 때 포커스가 첫 항목으로 가지 않고 닫을 때 토글로 돌아오지 않음 | 열려 있을 때 `main`과 `footer`에 `inert`(또는 `aria-hidden` + `tabindex=-1`)를 걸고, `keydown` Escape → `setOpen(false)` + `buttonRef.focus()`를 처리. 열 때 첫 링크로 포커스를 옮기고, 경로가 바뀔 때도 닫음 |
| Medium | `/divisions/*`, `/experiments/exp-042`, `/experiments/ai-012`, `/notes/meeting-notes-in-9-minutes` | axe `aria-progressbar-name`: `Progress` 컴포넌트(`src/components/ui.tsx:104-109`)에 이름이 없음. 또 모든 진행바에 `aria-valuetext`가 없어 스크린리더는 “57%”라고 읽고 화면에는 “DAY 4 / 7”이 보임 | `Progress({ value, muted, label, valueText })`로 바꾸고 `aria-label={label}`, `aria-valuetext={valueText}`를 넣음(예: `"EXP-042 진행률"`, `"WEEK 4 / 4"`). `experiment-index.tsx:129,165`, `home/sections.tsx:126`에도 `aria-valuetext={e.progressLabel}` 추가 |
| Medium | 모바일 터치 영역 < 44×44 | hero 블록 WEB/AI/FAITH 24–48×**24** (`home/hero-block.tsx:69` `px-1 py-1`); 푸터 링크 95×**25** (`site-footer.tsx:46`); “모든 노트 보기 →” 116×**32** (`home/sections.tsx:253`); 문의 폼 관심 분야 칩 71–90×**39** (`home/contact-form.tsx:110` `py-2.5`); 실험 상세 “Lab98 AI” 86×**24**; 이메일 링크 204×25; 햄버거 버튼이 flex 수축으로 **39**×44 (`site-header.tsx` `size-11`). `/experiments`·`/notes` 필터 칩(44px)과 모바일 메뉴 항목(74px)은 통과 | hero 블록 링크 `px-2 py-3 -my-2`(또는 `min-h-11 inline-flex items-center`); 푸터 링크 `inline-block py-2.5`(+ 간격 축소); “모든 노트 보기” `py-2.5`; 칩 `py-3`(→44); 햄버거 버튼에 `shrink-0`. 2.5.8 AA(24px)는 대부분 통과하지만 브리프 기준 44px에는 못 미침 |
| Medium | `/experiments` 데스크톱 표 (`experiments/experiment-index.tsx:95-150`) | 시각적으로는 6열 표인데 `div` 그리드이고 헤더 행이 `aria-hidden`이라 열 관계가 전달되지 않음. 행 전체가 하나의 링크라 링크 이름이 모든 셀을 이어 붙인 약 100자(“EXP-042 AI 실험 노트 자동 정리 회의록을 넣으면… LIVE WEEK 4 / 4 2026. 10. 01”)가 됨 | 링크에 `aria-labelledby={titleId}`와 `aria-describedby={metaId}`를 지정해 이름은 제목만으로 줄이거나, `<table>` + 제목 셀 안의 링크로 재구성 |
| Low | `/experiments`, `/notes` 목록 | 페이지에 h1만 있고 각 실험·노트 제목이 heading이 아님(홈의 같은 카드는 h3라 일관성이 없음). 스크린리더의 제목 탐색으로 항목을 훑을 수 없음 | 카드·행 제목을 `<h2>`로 렌더링(스타일 유지) |
| Low | 헤더 ↔ 푸터 내비 | 서빙 빌드에서 같은 목적지인데 헤더는 “회사 소개/서비스/프로젝트/인사이트”, 푸터는 “소개/실험/실험 노트”로 다름(3.2.4 일관된 식별). 현재 소스 `site-footer.tsx:8-12`는 헤더와 맞춰진 것으로 보임 | 재빌드 후 확인. 문구는 copy 담당 |
| Low | 푸터 | 링크 그룹이 `<nav>` 밖에 있고 “COMPANY/DIVISIONS/FOLLOW” 제목은 heading도 목록 이름도 아님 | `<nav aria-label="사이트맵">`으로 감싸고 각 열을 `<ul aria-labelledby>`로 묶음 |
| Low | 사업부 카드(`/`, `/about`, `/divisions/*`) | 카드 링크 안의 심볼 `img alt="Lab98 Web"` 바로 뒤에 h3 “Lab98 Web”이 있어 같은 이름을 두 번 읽음 | 카드 안에서는 `Symbol`에 `alt=""`를 넘기는 옵션 추가(`ui.tsx:15`) |
| Low | 건너뛰기 링크 (`app/layout.tsx`) | 동작은 함(Enter 후 다음 Tab이 main 첫 링크로 감, 포커스 시 잉크 배경과 빨강 링으로 잘 보임). 다만 `main`에 `tabIndex={-1}`이 없어 `activeElement`가 body에 남음(일부 Safari·VoiceOver에서 읽기 시작 위치가 어긋남) | `<main id="main" tabIndex={-1} className="flex-1 outline-none">` |
| Pass | 전역 | `html lang="ko"`. 모든 페이지에 h1이 하나이고 heading 단계 건너뜀 없음. 랜드마크 header/nav(aria-label)/main/footer, 노트 상세 `aside`, 이전·다음 `nav` 있음. “→”만 있거나 모호한 “자세히” 중복 링크 없음(화살표는 `aria-hidden`). 문의 폼은 `fieldset`/`legend`, `label for`가 있고, 제출 오류 시 `aria-invalid="true"`와 `aria-describedby`가 오류 문구를 가리키며 첫 오류 필드로 포커스가 이동함. 필터는 `aria-pressed`와 결과 수 `aria-live`를 씀. 포커스 링(3px #E8322B, offset 3px)이 모든 배경에서 3:1 이상이고 Tab 순서가 시각 순서와 같음. hero 터미널·ticker는 `aria-hidden`이고 같은 정보가 실험 섹션에 있어 문제없음 | — |

## 우선순위 Top 5

1. 모바일 메뉴: Esc 닫기, `inert` 포커스 트랩, 포커스 이동·복귀 (`site-header.tsx`)
2. accent 버튼 `bg-red` → `bg-red-text`(#DE3029, 4.60) (`ui.tsx:33`)
3. placeholder `text-muted` → `text-gray` 또는 새 토큰 #737370(4.76) (`contact-form.tsx:25`)
4. `Progress`에 `aria-label`과 `aria-valuetext` 추가, archived 채움 `bg-muted` → `bg-gray` (`ui.tsx:104-109` 외 3곳)
5. hero 무한 모션에 일시정지 수단 추가(ticker 토글·focus-within 정지, 터미널 1회전 후 정지, 색 순환 제한)와 `--font-mono`에 `"IBM Plex Sans KR"` 폴백 추가
