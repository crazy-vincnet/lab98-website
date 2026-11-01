# Lab98 폰트 크기 QA

- 측정 대상: 프로덕션 빌드 `http://localhost:3100`. 9개 경로를 1440×900, 768×1024, 390×844에서 측정했다.
- 측정 방법: Playwright로 직접 텍스트를 가진 모든 요소의 computed style을 수집했다(데스크톱 1,046개, 모바일 1,006개 노드).
- 원자료와 스크립트: `/tmp/claude-0/-home-user/0ea757c8-ef2a-4c76-8b91-e27e31595487/scratchpad/qa-font/` (`data.json`, `collect.js`, 스크린샷)
- 주의: 실행 중인 빌드가 현재 `src`보다 오래됐다. 예를 들어 빌드의 헤더 CTA는 `hidden sm:inline-flex`인데 소스는 `max-sm:hidden` + `whitespace-nowrap`이고, 소스에는 이미 `app/projects/[code]`가 있다. 아래 파일 경로는 감사 시점의 `src` 기준이다. 다시 빌드한 뒤 재측정해야 한다.

## 판정

1. 모바일 크기 자체는 대체로 안전하다. 12px 미만은 1건(11px)뿐이고, 모바일 본문은 16px이다. 다만 **같은 역할의 크기가 페이지마다 다르다.** 페이지 H1은 4종, 카드 제목은 7종, 본문은 15/16/17/18px가 섞여 있고, Archivo display는 데스크톱에서 9종이다.
2. 가장 큰 결함은 **한국어 행간**이다. Tailwind 기본 `text-base/lg/xl`가 body의 1.65를 덮어써서 본문 58곳이 1.5, 리드가 1.4, 1.56으로 내려간다. `@theme`에서 몇 줄만 고치면 전역으로 해결된다.
3. **768px(태블릿)이 깨진다.** `md:grid-cols-3` 카드 본문은 한 줄에 8~10자, 4~7줄이다. `SectionHead`의 H2는 48px로 360px 열에 들어가 4~5줄이 된다. 모바일에서는 4줄 이상으로 넘치는 제목이 없다.

---

## 1. 제안 타입 스케일

원칙은 세 가지다.
- 한국어 크기는 데스크톱 7단계, 모바일 6단계로 줄인다.
- 각 토큰에 한국어용 행간과 자간을 함께 묶는다.
- 390→1440px 사이는 `clamp()`로 보간해서 768px 문제도 함께 줄인다.

| 토큰 (Tailwind 클래스) | 역할 | 데스크톱 px | 모바일 px | 굵기 | 행간 | 자간 | 글꼴 |
|---|---|---|---|---|---|---|---|
| `text-display-xl` | 사업부 이름(Web/AI/Faith), "98" | 160 | 72 | 800 | 0.9 | -0.04em | Archivo |
| `text-display` | 홈 hero H1, hero-block 워드마크, 푸터 "We test, we ship", about 워드마크 | 120 | 64 | 800 | 0.92 | -0.04em | Archivo |
| `text-numeral-lg` | 통계 숫자(about 숫자, 노트 index 04) | 88 | 56 | 800 | 1 | -0.04em | Archivo |
| `text-numeral` | 단계·카드 번호 01/02/03 | 64 | 48 | 800 | 1 | -0.03em | Archivo |
| `text-lockup` | 카드 안 Lab98 + 사업부 로크업 | 36 | 32 | 800/500 | 1 | -0.02em | Archivo |
| `text-h1` | 페이지 H1(모든 하위 페이지, 노트 제목 포함) | 64 | 36 | 700 | 1.25 (모바일 1.3) | -0.03em | Plex KR |
| `text-h2` | 섹션 H2 | 48 | 30 | 700 | 1.35 | -0.02em | Plex KR |
| `text-h3` | 본문 소제목, 인용, 큰 카드 제목, 폼 완료 메시지 | 28 | 24 | 700 | 1.4 | -0.01em | Plex KR |
| `text-title` | 카드 제목(실험, 노트, 사업부, 서비스) | 24 | 20 | 700 | 1.45 | 0 | Plex KR |
| `text-title-sm` | 목록 행 제목(실험 테이블, 관련 노트) | 18 | 18 | 700 | 1.45 | 0 | Plex KR |
| `text-lead` | 페이지 리드 문단 | 22 | 18 | 400 | 1.6 | 0 | Plex KR |
| `text-body` | 본문, 섹션 리드, 노트 본문 | 18 | 16 | 400 | 1.7 | 0 | Plex KR |
| `text-body-sm` | 카드 설명, 폼 라벨(700), 푸터 링크, 내비 | 16 | 16 | 400/700 | 1.6 | 0 | Plex KR |
| `text-ui` | 버튼(md/sm 공통) | 16 | 16 | 700 | 1 | 0 | Plex KR |
| `.label` (현행 유지) | 아이브로우, 뒤로 가기 링크, 카드 CTA | 14 | 13 → **14 권장** | 700 | 1.3 | 0.06em, 대문자 | JetBrains Mono |
| `text-meta` | 날짜, 코드, 읽기 시간, 진행 상태 | 13 | 13 | 400/700 | 1.5 | 0.04em | JetBrains Mono |
| `text-micro` | Tag, 테이블 헤더, 푸터 열 제목(**최소 크기**) | 12 | 12 | 400/700 | 1 | 0.06em, 대문자 | JetBrains Mono |
| `text-code` | 터미널 블록 | 15 | 13 | 400 | 1.8 | 0 | JetBrains Mono |

결과적으로 한국어 크기는 데스크톱 {64, 48, 28, 24, 22, 18, 16}, 모바일 {36, 30, 24, 20, 18, 16}만 남는다. 현재는 데스크톱 15종, 모바일 17종이다.

### `globals.css`에 추가할 내용

```css
@theme {
  /* Display — Archivo 800 */
  --text-display-xl: clamp(4.5rem, 2.456rem + 8.381vw, 10rem);   /* 72 → 160 */
  --text-display-xl--line-height: 0.9;
  --text-display-xl--letter-spacing: -0.04em;
  --text-display: clamp(4rem, 2.7rem + 5.333vw, 7.5rem);          /* 64 → 120 */
  --text-display--line-height: 0.92;
  --text-display--letter-spacing: -0.04em;
  --text-numeral-lg: clamp(3.5rem, 2.757rem + 3.048vw, 5.5rem);   /* 56 → 88 */
  --text-numeral-lg--line-height: 1;
  --text-numeral: clamp(3rem, 2.629rem + 1.524vw, 4rem);          /* 48 → 64 */
  --text-numeral--line-height: 1;

  /* Korean headings — IBM Plex Sans KR 700 */
  --text-h1: clamp(2.25rem, 1.6rem + 2.667vw, 4rem);              /* 36 → 64 (768 ≈ 46) */
  --text-h1--line-height: 1.27;
  --text-h1--letter-spacing: -0.03em;
  --text-h1--font-weight: 700;
  --text-h2: clamp(1.875rem, 1.457rem + 1.714vw, 3rem);           /* 30 → 48 (768 ≈ 36) */
  --text-h2--line-height: 1.35;
  --text-h2--letter-spacing: -0.02em;
  --text-h2--font-weight: 700;
  --text-h3: clamp(1.5rem, 1.407rem + 0.381vw, 1.75rem);          /* 24 → 28 */
  --text-h3--line-height: 1.4;
  --text-h3--letter-spacing: -0.01em;
  --text-h3--font-weight: 700;
  --text-title: clamp(1.25rem, 1.157rem + 0.381vw, 1.5rem);       /* 20 → 24 */
  --text-title--line-height: 1.45;
  --text-title--font-weight: 700;
  --text-title-sm: 1.125rem;                                      /* 18 */
  --text-title-sm--line-height: 1.45;
  --text-title-sm--font-weight: 700;

  /* Korean text — 400 */
  --text-lead: clamp(1.125rem, 1.032rem + 0.381vw, 1.375rem);     /* 18 → 22 */
  --text-lead--line-height: 1.6;
  --text-body: clamp(1rem, 0.954rem + 0.19vw, 1.125rem);          /* 16 → 18 */
  --text-body--line-height: 1.7;
  --text-body-sm: 1rem;                                           /* 16 */
  --text-body-sm--line-height: 1.6;
  --text-ui: 1rem;
  --text-ui--line-height: 1;

  /* Mono */
  --text-meta: 0.8125rem;                                         /* 13 */
  --text-meta--line-height: 1.5;
  --text-meta--letter-spacing: 0.04em;
  --text-micro: 0.75rem;                                          /* 12 — floor */
  --text-micro--line-height: 1;
  --text-micro--letter-spacing: 0.06em;
  --text-code: clamp(0.8125rem, 0.766rem + 0.19vw, 0.9375rem);    /* 13 → 15 */
  --text-code--line-height: 1.8;

  /* Quick global fix while migrating: give the default Tailwind sizes Korean line-heights */
  --text-base--line-height: 1.7;   /* default 1.5 → 58 Korean paragraphs */
  --text-lg--line-height: 1.7;     /* default 1.556 */
  --text-xl--line-height: 1.6;     /* default 1.4 → leads on /experiments, /notes, exp-042 */
  --text-2xl--line-height: 1.45;   /* default 1.333 */
}
```

`body`의 `line-height`는 1.65에서 1.7로 바꾸고, `.label`은 모바일에서도 14px을 권장한다. 그러면 모바일 13px 미만 링크 대부분이 사라진다.

---

## 2. 실제 사용 중인 스케일(측정값)

데스크톱 1440 기준이다. 같은 (글꼴, 크기, 굵기) 조합에서 행간이 다르게 쓰인 경우를 함께 표시했다.

**Archivo (9종)**: 200, 180, 150, 132, 128, 120, 96, 88, 64, 36
- 132(홈 H1), 128(hero-block), 120(푸터)은 사실상 같은 역할의 근접 중복이다.
- 180(about), 150(사업부 이름), 200("98")도 마찬가지다.

**IBM Plex Sans KR (15종)**: 72, 64, 56, 48, 44, 34, 32, 28, 26, 24, 22, 20, 18, 17, 16, 15
- 근접 중복:
  - 72/64(H1)
  - 56/48/44(H2, 노트 대표 제목)
  - 34/32/28(소제목)
  - 26/24/22/20(카드 제목)
  - 18/17/16/15(본문)
- 같은 크기·굵기인데 행간이 다른 경우:
  - 48px: 1.3 / 1.35
  - 28px: 1.4 / 1.5
  - 24px bold: 1.3 / 1.4 / 1.5 / 1.6
  - 18px regular: 1.56 / 1.65 / 1.8
  - 16px regular: 1.5 / 1.65

**JetBrains Mono (8종)**: 36, 18, 16, 15, 14, 13, 12, (모바일 11)
- 13px 하나에만 행간 1 / 1.33 / 1.38 / 1.65가 쓰이고, 자간도 0 / 0.52 / 0.78px로 섞여 있다.

**모바일 390**: Plex 17종(40, 38, 36, 32, 30, 28, 24, 22, 20, 18, 17, 16, 15 …), Mono 7종(24, 16, 14, 13, 12, 11)

본문·UI 크기(≤24px)는 데스크톱 Plex에서만 10종으로, 기준인 약 8종을 넘는다.

---

## 3. 발견 사항

심각도: **H** = 가독성이나 레이아웃이 실제로 깨짐, **M** = 기준 위반 또는 역할 불일치, **L** = 정리 대상.

| # | 심각도 | 페이지 / 화면 | 요소(예시) | 현재 | 권장 | 파일 |
|---|---|---|---|---|---|---|
| 1 | H | 768: `/`, `/about`, `/divisions/*` | 3열 카드 설명 "제품, 행사, 캠페인 하나를…" "브랜드 사이트와 랜딩 페이지를…" | 16px/1.5, 폭 147px, **한 줄 8~10자, 4~7줄** | 3열 전환을 `lg:`(1024)로 미루거나 `md:grid-cols-2`. 한 줄 18자 이상 확보 | `src/components/divisions/division-sections.tsx:94`, `src/components/home/sections.tsx:54`, `src/components/home/sections.tsx:73` |
| 2 | H | 768: 모든 섹션 | `SectionHead` H2 "좋은 아이디어는 회의실이 아니라…" | 48px, 360px 열, **4~5줄** | 2열 그리드 `md:grid-cols-[280px_1fr]`를 `lg:`로 변경하고 `text-h2`(768px에서 약 36px) 사용 | `src/components/ui.tsx:85`, `src/components/ui.tsx:91`, `src/components/about/about-sections.tsx:94` |
| 3 | H | 전체 | 한국어 카드 설명·본문(`text-base`) 58곳 | 16px / **1.5** | 1.6~1.7 (`--text-base--line-height: 1.7`) | `src/app/globals.css` (@theme). 사용처: `sections.tsx:59,87,122,193,243`, `division-sections.tsx:99,168,228,260`, `about-sections.tsx:201`, `experiment-index.tsx:163` |
| 4 | H | 데스크톱·태블릿: `/experiments`, `/notes`, `/experiments/exp-042` | 리드 "모든 실험에는 번호가 있어요…" | 20px / **1.4** (`md:text-xl`) | `text-lead` 22px / 1.6 | `src/app/experiments/page.tsx:20`, `src/app/notes/page.tsx:21`, `src/app/experiments/[code]/page.tsx:59`, `src/components/notes/note-index.tsx:107` |
| 5 | M | 데스크톱: `/about` | 원칙 설명 "아이디어를 일주일 안에…" | 18px / 1.56 (`md:text-lg`) | `text-body` 18 / 1.7 | `src/components/about/about-sections.tsx:101`, `src/components/about/about-sections.tsx:123` |
| 6 | M | 모바일: `/notes`, `/experiments/exp-042`, 노트 상세 | 카드 설명 "AI-012 회고. 실패한 실험에서…", "회의록을 넣으면 가설, 결과…" | **15px**(한국어 본문 < 16) | 16px (`text-body-sm`) | `src/components/notes/note-index.tsx:137`, `src/app/experiments/[code]/page.tsx:130`, `src/app/experiments/[code]/page.tsx:140`, `src/app/notes/[slug]/page.tsx:113`, `src/components/experiments/experiment-index.tsx:118` |
| 7 | M | 모바일: `/` | 터미널 타이틀 "~/lab98 — exp-042" | **11px** 대문자 mono | 12px (`text-micro`) | `src/components/home/sections.tsx:202` |
| 8 | M | 모바일: `/` | hero-block 링크 "WEB · AI · FAITH" | 12px 대문자 mono, `px-1 py-1` → 탭 영역 약 20px | 13~14px, `min-h-11` 또는 패딩 확대 | `src/components/home/hero-block.tsx:56`, `src/components/home/hero-block.tsx:66` |
| 9 | M | 모바일: `/experiments` | 카드 CTA "자세히 →" | **12px** mono 링크 | 14px (`.label`) | `src/components/experiments/experiment-index.tsx:172` |
| 10 | M | 모바일: `/about`, `/divisions/*` | 카드 하단 CTA "지원 문의", "실험 기록 보기", "Web 사업부 보기", 뒤로 가기 `.label` 링크 | 13px 대문자 mono(링크 < 14px). 시각적으로 약 11px처럼 읽힘 | `.label` 모바일 14px | `src/app/globals.css` (.label), `src/components/about/about-sections.tsx:203`, `src/components/divisions/division-sections.tsx:177` |
| 11 | M | 전체 | **한국어 문자열을 mono로 조판**: "디자인 단계", "참여 중", "베타 오픈", "회고 완료", "함께할 동료를 찾고 있어요", "Web 사업부", 필터 "전체" | 12~13px. JetBrains Mono에 한글이 없어 fallback 글꼴로 렌더링되고 더 작고 가늘게 보임 | 한국어 조각은 `font-sans` 14px 이상, mono는 라틴·숫자만 | `src/components/home/sections.tsx:89,140`, `src/components/divisions/division-sections.tsx:171`, `src/components/experiments/experiment-index.tsx:168`, `src/components/about/about-sections.tsx:180,199`, `src/components/notes/note-index.tsx:41` |
| 12 | M | 전체 | 페이지 H1 | 데스크톱 72(about·실험·노트) / 64(사업부·exp) / 48(노트 상세). 모바일 40/38/36/32. 행간 1.2/1.25/1.3 | `text-h1` 하나(64/36, 1.25~1.3) | `src/components/about/about-sections.tsx:20`, `src/app/experiments/page.tsx:19`, `src/app/notes/page.tsx:20`, `src/components/divisions/division-sections.tsx:53`, `src/app/experiments/[code]/page.tsx:58`, `src/app/notes/[slug]/page.tsx:67` |
| 13 | M | 전체 | 카드 제목(같은 역할) | 18, 20, 22, 24, 26, 28, 34 (7종) | `text-title` 24/20, 목록 행은 `text-title-sm` 18 | `sections.tsx:58,121,192,242`, `division-sections.tsx:98,137,167,227`, `about-sections.tsx:100,122,154,183,200`, `experiment-index.tsx:117,162`, `note-index.tsx:49,136`, `app/notes/[slug]/page.tsx:112,134`, `app/experiments/[code]/page.tsx:129,139,192,205` |
| 14 | M | 전체 | 본문 근접 중복 15/16/17/18 | 푸터 15, 내비 15, 폼 라벨 15, 작은 버튼 15, 연락처 목록 17, 모바일 노트 본문 17 | 16(`body-sm`, `ui`) / 18(`body`) | `site-footer.tsx:11`, `site-header.tsx:29`, `ui.tsx` (`buttonSizes.sm`), `contact-form.tsx:102,137,163`, `sections.tsx:281`, `note-body.tsx:6` |
| 15 | M | 전체 | 리드 문단 | 24/1.6 (hero·about·사업부), 20/1.4 (목록 페이지), 22/1.7 (노트), 모바일 18/16 혼재 | `text-lead` 22/18, 1.6 | `hero.tsx:37`, `about-sections.tsx:21`, `division-sections.tsx:54`, `app/notes/[slug]/page.tsx:68`, 및 #4 |
| 16 | L | 홈, 사업부 | H2 변형: 문의 섹션 `xl:text-[56px]`, 행간 1.3과 1.35 혼재 | 56 / 48, 1.3 / 1.35 | `text-h2` 하나 | `src/components/home/sections.tsx:275`, `src/components/divisions/division-sections.tsx:299`, `src/components/ui.tsx:91` |
| 17 | L | 상세 페이지 | 본문 소제목: exp 상세 h2 32/24, 노트 h2 28/24, 인용 28/22 | 32 / 28 | `text-h3` 28/24 | `src/app/experiments/[code]/page.tsx:168`, `src/components/notes/note-body.tsx:13`, `src/components/notes/note-body.tsx:19` |
| 18 | L | 데스크톱 | Archivo display 근접 중복 | 132 / 128 / 120, 180 / 150 / 200, 96 / 88 | `display` 120, `display-xl` 160, `numeral-lg` 88 | `hero.tsx:29`, `hero-block.tsx:81`, `site-footer.tsx:17`, `about-sections.tsx:42,77,96,149,176`, `division-sections.tsx:70`, `note-index.tsx:111` |
| 19 | L | 전체 | 터미널 코드 크기·행간 | 모바일 11/12/13, 데스크톱 15. 행간 1.7 / 1.9 | `text-code` 13→15, 1.8 | `hero-terminal.tsx:60`, `sections.tsx:197`, `about-sections.tsx:127`, `division-sections.tsx:142`, `run-terminal.tsx:11`, `note-body.tsx:38` |
| 20 | L | 전체 | mono 메타(날짜 · 코드 · 읽기 시간) | 같은 정보가 12 / 13 / 14px, 자간 0.04 / 0.06em | `text-meta` 13, 0.04em | `note-index.tsx:75,139`, `division-sections.tsx:171,225,230`, `experiment-index.tsx:135,137`, `sections.tsx:140`, `about-sections.tsx:78`, `app/notes/[slug]/page.tsx:53` |
| 21 | L | 모바일 (빌드) | 헤더 CTA "베타 신청"이 2줄로 줄바꿈(94×62) | 빌드: `hidden sm:inline-flex`가 적용되지 않음 | 소스에는 이미 `max-sm:hidden` + `whitespace-nowrap`. 재빌드 후 확인 | `src/components/site-header.tsx:35`, `src/components/ui.tsx` (buttonBase) |
| 22 | L | 크기 × 대비 | 작은 보조 텍스트가 2차 색과 겹침: 12px mono `text-ink-text` (어두운 배경 Tag·푸터), 15px `text-gray` 카드 설명 | 12 / 15px | 크기를 13 / 16으로 올리면 대비 여유도 생김 | #6, #20 참조 |

### 확인 결과 문제없음

- 12px 미만은 1건뿐이다(#7).
- 모바일에서 4줄 이상 줄바꿈되거나 가로로 넘치는 제목이 없다. 문서 폭은 모든 화면에서 viewport와 같다.
- 모바일 H1 최대 3줄: `/divisions/web`, `/divisions/faith` 38px.
- 모바일 H2 최대 3줄: 홈 "좋은 아이디어는…" 30px.
- 영어 display 행간 0.85~0.95는 적정하다.
- 큰 한국어 제목 행간: H2 1.3~1.35와 H1 1.25는 적정하다. 목록 H1 1.2는 한 줄 제목이어서 문제가 없지만, 통일하려면 1.25 이상이 좋다.
- 데스크톱 본문 measure는 한 줄 25~41자, 노트 본문은 31~33자로 기준(45~55자 이하)에 맞는다.
- 모바일 본문 measure는 18~26자다. 카드 안 설명(290px 폭)은 18~20자로 약간 좁지만 허용 범위다.

---

## 4. 역할 × 페이지 일관성

값은 `크기/행간`이다. m = mono, a = Archivo. ✗ = 같은 역할인데 다른 페이지와 값이 다름.

### 데스크톱 1440

| 역할 | / | /about | /div/web | /div/ai | /div/faith | /experiments | /exp-042 | /notes | /notes/[slug] |
|---|---|---|---|---|---|---|---|---|---|
| 페이지 H1 | 132a/0.92 (영문) | 72/1.25 ✗ | 64/1.25 | 64/1.25 | 64/1.25 | 72/1.2 ✗ | 64/1.25 | 72/1.2 ✗ | 48/1.3 ✗ |
| 리드 | 24/1.6 | 24/1.6 | 24/1.6 | 24/1.6 | 24/1.6 | 20/1.4 ✗ | 20/1.4 ✗ | 20/1.4 ✗ | 22/1.7 ✗ |
| 섹션 H2 | 48/1.35, 56/1.3 ✗ | 48/1.35, 48/1.3 | 48/1.35, 48/1.3 | 48/1.35, 48/1.3 | 48/1.35, 48/1.3 | – | 32/1.35 ✗ | – | 28/1.4 ✗ |
| 카드 제목 | 24, 26/1.4, 26/1.45 | 34/1.35, 28, 24/1.3 ✗ | 24, 26/1.4 | 24, 26/1.4 | 24, 26/1.4 | 18 (테이블) | 24/1.4, 20/1.5 | 24/1.4, 44 (대표) | 20/1.4 |
| 본문 | 18/1.65, 16/1.5 | 18/1.65, 18/1.56, 16/1.5 | 18/1.65, 16/1.5 | 18/1.65, 16/1.5 | 18/1.65, 16/1.5 | 15/1.65 ✗ | 16/1.5 | 16/1.5 | 18/1.8, 15/1.65 ✗ |
| 아이브로우 `.label` | 14m/1.3 | 14m/1.3 | 14m/1.3 | 14m/1.3 | 14m/1.3 | 14m/1.3 | 14m/1.3 | 14m/1.3 | 14m/1.3 |
| 메타(mono) | 12 / 13 / 15m | 12 / 13 / 14m | 12 / 13 / 14m | 12 / 13 / 14m | 12 / 13 / 14m | 12 / 13m | 12 / 14m | 12 / 13m | 13 / 14m |
| 버튼 | 16/1 (md), 15 (헤더) | 16 / 15 | 16 / 15 | 16 / 15 | 16 / 15 | 15 | 15 | 15 | 15 |
| 내비 | 15 bold | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 |
| 푸터 | 링크 15/1.65 · 열 제목 12m · 표어 120a | 동일 | 동일 | 동일 | 동일 | 동일 | 동일 | 동일 | 동일 |

### 모바일 390

| 역할 | / | /about | /div/web | /div/ai | /div/faith | /experiments | /exp-042 | /notes | /notes/[slug] |
|---|---|---|---|---|---|---|---|---|---|
| 페이지 H1 | 64a/0.92 | 40/1.25 | 38/1.25 ✗ | 38/1.25 ✗ | 38/1.25 ✗ | 40/1.2 | 36/1.25 ✗ | 40/1.2 | 32/1.3 ✗ |
| 리드 | 18/1.6 | 18/1.6 | 18/1.6 | 18/1.6 | 18/1.6 | 16/1.65 ✗ | 16/1.65 ✗ | 16/1.65 ✗ | 18/1.7 |
| 섹션 H2 | 30/1.35, 32/1.3 ✗ | 30/1.35, 30/1.3 | 30 | 30 | 30 | – | 24/1.35 ✗ | – | 24/1.4 ✗ |
| 카드 제목 | 22/1.4, 20/1.45 | 24/1.35, 24/1.4, 24/1.3 | 24, 22, 20/1.4 | 24, 22, 20 | 24, 22, 20 | 22/1.4 | 20/1.4, 18/1.5 | 20/1.4, 28 (대표) | 20/1.4, 18/1.4 |
| 본문 | 16/1.65, 16/1.5 | 16/1.65, 16/1.5 | 16/1.65, 16/1.5 | 16/1.65, 16/1.5 | 16/1.65, 16/1.5 | 16/1.5 | 15/1.65 ✗ | 15/1.65 ✗ | 17/1.8, 15/1.65 ✗ |
| 아이브로우 `.label` | 13m | 13m | 13m | 13m | 13m | 13m | 13m | 13m | 13m |
| 메타(mono) | 11 / 12 / 13m | 12 / 13 / 14m | 12 / 13 / 14m | 12 / 13 / 14m | 12 / 13 / 14m | 12 / 13m | 12 / 13m | 12 / 13m | 12 / 13m |
| 버튼 | 16/1 | 16 | 16 | 16 | 16 | 16 | 16 | 16 | 16 |
| 푸터 | 링크 15 · 열 제목 12m · 표어 56a | 동일 | 동일 | 동일 | 동일 | 동일 | 동일 | 동일 | 동일 |

768px의 값은 데스크톱과 같다(`md:`). 그래서 #1, #2처럼 좁은 열 안에서 데스크톱 크기가 그대로 쓰인다.

### 일관된 항목

- 아이브로우 `.label`
- 푸터
- 섹션 H2(SectionHead 경유분)
- 사업부 3개 페이지 사이

### 불일치가 큰 항목

- 페이지 H1
- 리드
- 카드 제목
- 상세 페이지 소제목
- mono 메타

## 5. 적용 순서 제안

1. `@theme`에 `--text-base/lg/xl/2xl--line-height` 오버라이드를 넣는다(#3, #4, #5 즉시 해소). 그다음 `.label`을 모바일 14px로 바꾼다(#10).
2. 768px 레이아웃: 3열 카드와 `SectionHead`/about의 2열 그리드를 `lg:`로 옮긴다(#1, #2).
3. 15px과 11px를 제거한다(#6, #7, #14). mono 링크·CTA는 14px 이상, 한국어는 `font-sans`로 바꾼다(#8, #9, #11).
4. 토큰으로 이전한다. H1, H2, H3, title, lead, body, display 순서로 클래스를 교체한다(#12~#20).
