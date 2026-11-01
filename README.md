# Lab98 웹사이트

Lab98 회사 소개 사이트입니다. Next.js와 Tailwind로 만들었습니다.
Lab98은 웹사이트, AI 업무 자동화, 신앙 공동체 콘텐츠 프로젝트를 1주 단위로 만드는 회사입니다.

> **상태:** 디자인과 코드 1차 완성 (2026-11-01). 배포 전입니다.
> **주의:** 프로젝트·인사이트·팀·수치는 **모두 예시 콘텐츠**입니다. 배포 전에 실제 내용으로 바꿔야 합니다. 바꿀 곳은 `TODO(content)`로 표시돼 있습니다.

| 항목 | 링크 / 위치 |
|---|---|
| Figma: 웹사이트 시안 (10페이지 × 데스크톱·모바일) | https://www.figma.com/design/ciPHVUpSdcJ8U23m6MJgSc |
| Figma: SNS 킷 | https://www.figma.com/design/SumSqGur4kzSZMcT37pOkt |
| Figma: 브랜드 아이덴티티 (원본) | https://www.figma.com/design/EU1Z3sRefLqD72UqsCZmId |
| 예정 도메인 | `https://lab98.co` (`src/lib/content.ts`의 `site.url`) |

---

## 목차

1. [빠른 시작](#1-빠른-시작)
2. [기술 스택](#2-기술-스택)
3. [폴더 구조](#3-폴더-구조)
4. [페이지와 주소](#4-페이지와-주소)
5. [디자인 시스템](#5-디자인-시스템)
6. [콘텐츠 수정 방법](#6-콘텐츠-수정-방법)
7. [컴포넌트 안내](#7-컴포넌트-안내) · [문의 폼과 InsForge](#7-1-문의-폼과-insforge)
8. [품질 기준과 검수 결과](#8-품질-기준과-검수-결과)
9. [Figma 연동](#9-figma-연동)
10. [배포 전 체크리스트](#10-배포-전-체크리스트)
11. [로드맵](#11-로드맵)
12. [작업 이력](#12-작업-이력)
13. [알아 둘 점과 함정](#13-알아-둘-점과-함정)

---

## 1. 빠른 시작

**필요한 것:** Node.js 20 이상(작업 환경은 22.23), npm 10 이상

```bash
npm install
```

```bash
npm run dev
```

http://localhost:3000 을 엽니다.

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버를 띄웁니다. 수정하면 바로 반영됩니다. |
| `npm run build` | 배포용 빌드를 만듭니다. 타입 검사도 함께 합니다. |
| `npm run start` | 빌드한 결과를 실행합니다. 포트를 바꾸려면 `npx next start -p 3100`. |
| `npm run lint` | ESLint 검사를 합니다. |
| `npx next typegen` | 라우트 타입(`PageProps<'/projects/[code]'>` 등)을 다시 만듭니다. |

**환경 변수:** 문의 폼이 동작하려면 `.env.local`이 필요합니다. `.env.example`을 복사해서 값을 채우세요. `.env.local`은 git에 올라가지 않습니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|---|---|
| `INSFORGE_URL` | InsForge 프로젝트 주소 |
| `INSFORGE_API_KEY` | InsForge 관리자 키(`ik_…`). `npx -y @insforge/cli secrets get API_KEY`로 확인. **절대 공개 금지** |
| `CONTACT_NOTIFY_EMAIL` | 새 문의 알림을 받을 팀 메일 주소 |
| `INQUIRY_IP_SALT` | 아무 긴 랜덤 문자열 (방문자 IP를 해시할 때 사용) |

모두 서버 전용입니다. `NEXT_PUBLIC_`을 붙이지 마세요. Vercel에 배포할 때도 같은 4개를 **Settings → Environment Variables**에 넣어야 합니다.

---

## 2. 기술 스택

| 분류 | 사용 기술 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js 16.4.3** (App Router) | `cacheComponents: true`, `partialPrefetching: true` |
| UI | React 19.3 | |
| 스타일 | **Tailwind CSS v4** | 토큰은 `src/app/globals.css`의 `@theme`에 있습니다. 설정 파일(`tailwind.config`)은 없습니다. |
| 폰트 | `@fontsource` (직접 호스팅) | Archivo 500/800, IBM Plex Sans KR 400/700, JetBrains Mono 400/700 |
| 언어 | TypeScript 5 | |
| 백엔드 | **InsForge** (`@insforge/sdk`, `@insforge/cli`) | 문의 저장(Postgres) + 알림 메일. 프로젝트 `subserver` |
| 배포(예정) | Vercel + GitHub | 저장소: https://github.com/crazy-vincnet/lab98-website |

> ⚠️ **Next.js 16은 예전 버전과 API가 다릅니다.** 코드를 고치기 전에 `node_modules/next/dist/docs/`의 문서를 먼저 보세요. AI 코딩 도구에도 `AGENTS.md`로 같은 안내를 하고 있습니다.
> - 동적 라우트의 `params`는 **Promise**라서 `await`해야 합니다.
> - 페이지 타입은 전역 `PageProps<'/route/[x]'>`, `LayoutProps<'/'>`를 씁니다.

---

## 3. 폴더 구조

```
lab98-app/
├── README.md                ← 이 문서
├── AGENTS.md / CLAUDE.md    ← AI 코딩 도구 안내 (Next.js 16 문서를 먼저 보라는 내용)
├── next.config.ts           ← 예전 주소 → 새 주소 308 리다이렉트
├── docs/                    ← 기획·검수 문서 (아래 표 참고)
├── brand-kit/               ← 원본 브랜드 키트: 로고 SVG/PNG, 파비콘, tokens.css/json, 인쇄물
├── design/v1-static/        ← 1차 정적 시안 HTML과 스크린샷 (참고용)
├── tools/                   ← QA와 Figma 업로드용 Playwright 스크립트
├── migrations/              ← InsForge DB 마이그레이션 SQL (inquiries 테이블)
├── .env.example             ← 필요한 환경 변수 목록
├── public/brand/            ← 사이트에서 쓰는 로고 SVG (symbol, lockup × 4개 사업부 × 일반/반전)
└── src/
    ├── app/                 ← 라우트(페이지)
    │   ├── layout.tsx       ← 폰트, 메타데이터, 헤더/푸터, "본문으로 건너뛰기"
    │   ├── globals.css      ← ★ 디자인 토큰 (색, 글자 크기, 애니메이션)
    │   ├── page.tsx         ← 홈
    │   ├── about/           ← 회사 소개
    │   ├── services/[slug]/ ← 서비스 (web, ai, faith)
    │   ├── projects/        ← 프로젝트 목록, [code] 상세
    │   ├── insights/        ← 인사이트 목록, [slug] 상세
    │   ├── privacy/         ← 개인정보처리방침
    │   ├── actions/contact.ts ← ★ 문의 폼 Server Action (검증 → 저장 → 알림 메일)
    │   ├── not-found.tsx    ← 404
    │   └── icon.png, apple-icon.png
    ├── lib/content.ts       ← ★ 사이트 데이터 (회사 정보, 메뉴, 사업부, 프로젝트, 인사이트)
    ├── lib/inquiry.ts       ← 문의 폼 검증 규칙 (브라우저·서버 공용)
    ├── lib/insforge-admin.ts ← InsForge 관리자 클라이언트 (서버 전용)
    └── components/
        ├── ui.tsx           ← 공통 UI (버튼, 태그, 로고, 섹션 제목, 진행률)
        ├── cards.tsx        ← 공통 카드 (ProjectCard, InsightRow)
        ├── site-header.tsx  ← 상단 메뉴 + 모바일 메뉴
        ├── site-footer.tsx  ← 하단
        ├── home/            ← 홈 섹션 (히어로, 서비스, 프로세스, 문의 폼)
        ├── divisions/       ← 서비스 상세 페이지 섹션
        ├── about/           ← 회사 소개 섹션, 팀 데이터
        ├── experiments/     ← 프로젝트 목록·상세 섹션 + paths.ts (★ 모든 링크 주소)
        └── notes/           ← 인사이트 목록·상세 섹션
```

**폴더 이름 주의:** `components/experiments`(프로젝트)와 `components/notes`(인사이트)는 이전 이름이 남은 것입니다. 사이트 주소와 화면 문구는 이미 바뀌었고, 폴더 이름만 그대로입니다. 바꾸려면 import 경로를 함께 고쳐야 합니다.

### docs/ 문서

| 파일 | 내용 |
|---|---|
| `docs/copy-guide.md` | **카피 가이드.** 포지셔닝, 말투(해요체) 원칙, 금지어, 페이지별 확정 문구 |
| `docs/feature-plan.md` | **기능 기획서.** 런칭 전 필수(P0), 런칭 직후(P1), 나중(P2), 대표님 결정 체크리스트 |
| `docs/qa-visual.md` | 디자인 품질 검수 (7/10 → 수정 반영) |
| `docs/qa-font-size.md` | 글자 크기 검수와 확정 타입 스케일 |
| `docs/qa-readability.md` | 가독성·명암비·접근성 검수 |

---

## 4. 페이지와 주소

| 주소 | 페이지 | 파일 | 섹션 컴포넌트 |
|---|---|---|---|
| `/` | 홈 | `app/page.tsx` | `components/home/*` |
| `/about` | 회사 소개 | `app/about/page.tsx` | `components/about/*` |
| `/services/web` · `/ai` · `/faith` | 서비스(사업부) 상세 | `app/services/[slug]/page.tsx` | `components/divisions/*` |
| `/projects` | 프로젝트 목록 (필터) | `app/projects/page.tsx` | `components/experiments/experiment-index.tsx` |
| `/projects/[code]` | 프로젝트 상세 (예: `/projects/ai-042`) | `app/projects/[code]/page.tsx` | `components/experiments/parts.tsx` |
| `/insights` | 인사이트 목록 | `app/insights/page.tsx` | `components/notes/*` |
| `/insights/[slug]` | 인사이트 상세 | `app/insights/[slug]/page.tsx` | `components/notes/note-body.tsx` |
| `/privacy` | 개인정보처리방침 (푸터에 링크) | `app/privacy/page.tsx` | |
| 그 외 | 404 | `app/not-found.tsx` | |

- 상세 페이지는 모두 `generateStaticParams`로 **빌드할 때 미리 만들어집니다.**
- 홈의 문의 영역은 `/#contact`입니다. 링크 상수는 `components/experiments/paths.ts`의 `CONTACT_HREF`입니다.
- 메뉴는 회사 소개 · 서비스 · 프로젝트 · 인사이트 · 문의 순서이고, 오른쪽 위에 "프로젝트 문의" 버튼이 있습니다.

### 예전 주소 리다이렉트 (`next.config.ts`, 308)

| 예전 | 새 주소 |
|---|---|
| `/experiments`, `/experiments/:code` | `/projects`, `/projects/:code` |
| `/experiments/exp-042`, `/projects/exp-042` | `/projects/ai-042` |
| `/notes`, `/notes/:slug` | `/insights`, `/insights/:slug` |
| `/divisions/:slug` | `/services/:slug` |

**주소를 바꿀 때**는 `components/experiments/paths.ts` 한 곳만 고치면 됩니다. 모든 링크가 여기서 주소를 가져옵니다. 예전 주소는 `next.config.ts`에 리다이렉트로 추가하세요.

---

## 5. 디자인 시스템

출처는 Figma "Lab98 Brand Identity"와 `brand-kit/`입니다. 실제로 쓰는 토큰은 모두 `src/app/globals.css`에 있습니다.

### 원칙
- **모서리 0, 테두리 2px, 그림자 없음.** 단단하고 평평한 인상을 줍니다.
- **색 비율 60 / 30 / 8 / 2:** 흰색 60, 검정 30, 콘크리트(회색 면) 8, 포인트색 2.
- 사업부마다 포인트색 하나만 씁니다. Master는 빨강, Web은 파랑, AI는 초록, Faith는 노랑입니다.

### 색 (Tailwind 클래스 이름)

| 토큰 | 값 | 용도 |
|---|---|---|
| `ink` | #111111 | 글자, 테두리, 어두운 면 |
| `paper` | #FFFFFF | 기본 배경 |
| `concrete` | #E6E6E3 | 회색 면 |
| `gray` | #5E5E5A | 보조 글자 (흰 배경에서 명암비 AA 통과) |
| `ink-text` | #A3A39E | 어두운 배경 위 보조 글자 |
| `red` / `web` / `ai` / `faith` | #E8322B / #2F55FF / #14C38E / #F2B21B | **면과 점에만** 씁니다 (브랜드 원색) |
| `red-text`, `web-text`, `ai-text`, `faith-text` | #DE3029 / #2F55FF / #0C8560 / #9A6D00 | **흰 배경 위 작은 글자**용 (AA 4.5:1 통과) |
| `*-text-dark` | #FF6B61 / #7D93FF / #14C38E / #F2B21B | **검정 배경 위 작은 글자**용 |

> 원색 AI 초록과 Faith 노랑은 흰 배경 글자로 쓰면 명암비가 부족합니다. 글자에는 반드시 `*-text` 토큰을 쓰세요. 사업부별 클래스는 `src/lib/content.ts`의 `divisionTheme`에 모여 있습니다.

### 글꼴
| 클래스 | 글꼴 | 용도 |
|---|---|---|
| `font-logo` | Archivo 800 | 큰 영문 제목, 숫자 |
| `font-sans` (기본) | IBM Plex Sans KR | 본문, 한글 제목 |
| `font-mono` | JetBrains Mono, 한글은 Plex KR로 대체 | 라벨, 코드, 메타 정보 |

### 타입 스케일
글자 크기는 화면 폭 390px에서 1440px 사이에서 자연스럽게 커집니다(`clamp`). **임의 크기(`text-[23px]`) 대신 아래 토큰만 쓰세요.** 자세한 값은 `docs/qa-font-size.md`에 있습니다.

`text-display-xl` · `text-display` · `text-numeral-lg` · `text-numeral` · `text-h1` · `text-h2` · `text-h3` · `text-title` · `text-title-sm` · `text-lead` · `text-body` · `text-body-sm` · `text-ui` · `text-meta` · `text-micro` · `text-code`

### 유틸리티
- `.wrap`: 페이지 가로 컨테이너
- `.label`: 14px 모노, 대문자, 자간 0.06em (섹션 라벨)
- `ko-tight`: `.label` 안의 한글에서 대문자 변환과 자간을 끕니다.
- 전역 설정: `word-break: keep-all`(한글 단어 단위 줄바꿈), 빨간 포커스 테두리, `prefers-reduced-motion`이면 애니메이션 끔

---

## 6. 콘텐츠 수정 방법

| 바꾸고 싶은 것 | 파일 |
|---|---|
| 회사명, 이메일, 도메인, SNS, 답장 기준 | `src/lib/content.ts` → `site` |
| 상단 메뉴 | `src/lib/content.ts` → `nav` |
| 사업부(서비스) 소개 | `src/lib/content.ts` → `divisions`, 상세 문구는 `components/divisions/copy.ts` |
| 프로젝트 사례 | `src/lib/content.ts` → `experiments` (변수 이름은 예전 그대로) |
| 인사이트 글 | `src/lib/content.ts` → `notes` |
| 홈 문구 | `components/home/copy.ts` |
| 회사 소개 문구, 팀 | `components/about/copy.ts`, `components/about/team.ts` |
| 프로젝트/인사이트 목록 문구 | `components/experiments/copy.ts`, `components/notes/copy.ts` |
| 카드 버튼 문구 | `components/cards.tsx` → `cardCopy` |
| 푸터 | `components/site-footer.tsx` |
| 404 | `app/not-found.tsx` |

**새 프로젝트 추가:** `experiments` 배열에 항목을 하나 추가하면 목록, 상세 페이지, 홈 카드에 자동으로 나옵니다.
- `code`는 주소가 됩니다. 소문자로 `ai-043`처럼 씁니다.
- `division`은 `web` / `ai` / `faith` 중 하나입니다.
- `status`는 `live`(운영 중) / `running`(진행 중) / `archived`(완료) 중 하나입니다.

**새 인사이트 추가:** `notes` 배열에 `slug`, `date`, `division`, `title`, `excerpt`, `readingMinutes`, 본문을 넣습니다.

**문구 쓰는 법:** `docs/copy-guide.md`를 따릅니다.
- 해요체로 쓰고, 고객이 얻는 결과부터 말합니다.
- "빠르게" 같은 말 대신 숫자와 기간을 씁니다.
- "실험실"이라고 쓰지 않습니다.

### 남은 TODO 찾기
```bash
grep -rn "TODO" src
```
- `TODO(content)`: 실제 콘텐츠로 바꿔야 하는 곳입니다(이메일, SNS, 프로젝트, 인사이트, 팀, 브랜드 스토리, 사업자 정보).

---

## 7. 컴포넌트 안내

### `components/ui.tsx`
| 이름 | 설명 |
|---|---|
| `Symbol`, `Lockup` | 사업부별 로고. `division`으로 사업부를, `inverse`로 반전 여부를 정합니다. |
| `ButtonLink`, `Button` | `variant`: `primary`(검정), `secondary`(테두리), `accent`(빨강). 줄바꿈되지 않습니다. |
| `Tag` | 작은 라벨. `caps` 속성이 있습니다. |
| `StatusTag`, `statusLabel` | 프로젝트 상태 배지: 운영 중 / 진행 중 / 완료 |
| `SectionHead` | 섹션 제목. 데스크톱에서는 왼쪽 280px에 라벨이 오고 오른쪽에 제목과 리드 문구가 옵니다. |
| `Progress` | 진행률 막대(접근성 라벨 포함) |
| `cx` | className 합치기 |

### `components/cards.tsx`: 공통 카드
- `ProjectCard`, `InsightRow`를 모든 페이지가 같이 씁니다.
- 마우스를 올리면 아래 바가 검정으로 바뀌고, 제목에 밑줄이 생기고, 화살표가 오른쪽으로 움직입니다. 이 hover 효과도 모든 페이지에서 같습니다.

### `components/site-header.tsx`: 클라이언트 컴포넌트
- 상단에 붙어 있고, 지금 있는 페이지를 `aria-current`로 표시합니다.
- 모바일 메뉴의 동작:
  - Esc로 닫힙니다.
  - 열려 있는 동안 본문과 푸터에 `inert`가 걸립니다.
  - 열리면 포커스가 메뉴 안으로 이동합니다.
  - 페이지를 이동하면 자동으로 닫힙니다(`openAt === pathname` 패턴).

### 홈 히어로 (`components/home/hero*.tsx`)
- 터미널 타이핑 모션과 블록 모션이 있습니다.
- **일시정지 버튼이 있고**, `prefers-reduced-motion`을 지킵니다(`use-reduced-motion.ts`).

### 문의 폼 (`components/home/contact-form.tsx`) → 아래 "문의 폼과 InsForge" 참고

---

## 7-1. 문의 폼과 InsForge

홈 `#contact`의 문의 폼은 **InsForge**에 저장되고, 팀에게 알림 메일이 갑니다.

```
방문자 → contact-form.tsx (브라우저 검증, 동의 체크)
       → submitInquiry() Server Action  (src/app/actions/contact.ts, 서버에서만 실행)
           1. 서버에서 다시 검증 (src/lib/inquiry.ts)
           2. 스팸 차단: 숨은 입력칸(website)이 채워졌거나 3초 안에 제출되면 저장하지 않고 성공처럼 응답
           3. 횟수 제한: 같은 방문자 10분에 3건, 사이트 전체 1시간에 30건
           4. InsForge DB public.inquiries 에 저장
           5. InsForge 이메일로 CONTACT_NOTIFY_EMAIL 에 알림 (답장하면 문의자에게 바로 감)
       → 성공 화면 / 실패 시 직접 메일 보내기 안내
```

**문의 확인 방법**
- InsForge 대시보드의 Database → `inquiries` 테이블에서 볼 수 있습니다: https://insforge.dev/dashboard/project/464b9576-7a31-44c7-bc69-d0689dfc7cd3
- `status` 값은 `new` → `replied` → `closed`(또는 `spam`) 순서로 직접 바꿔 관리합니다.
- `notified = false`는 저장은 됐지만 알림 메일 발송이 실패한 문의입니다. 대시보드에서 확인하세요.

**보안**
- `inquiries` 테이블은 RLS가 켜져 있고, 공개 키(anon)와 로그인 사용자의 권한을 모두 회수했습니다.
- 읽기와 쓰기는 서버의 관리자 키로만 할 수 있습니다. 공개 키로 읽거나 쓰면 거부되는 것을 확인했습니다.
- 방문자 IP는 원본을 저장하지 않고, 솔트를 붙인 SHA-256 해시로만 저장합니다.
- 알림 메일의 발신 주소는 `noreply@sg8srf86.send.insforge.dev`로 고정입니다. 표시 이름은 "Lab98 웹사이트"입니다. 회사 도메인 발신은 InsForge 대시보드에서 설정합니다.
- 이메일 발송은 InsForge 유료 플랜(현재 Pro)에서만 됩니다. 시간당 발송 한도가 있습니다.

**DB 구조 바꾸기**
```bash
npx -y @insforge/cli db migrations new <이름>
```
`migrations/`에 SQL을 쓴 뒤 적용합니다.
```bash
npx -y @insforge/cli db migrations up --all
```

**InsForge 연결 (새 PC에서)**
```bash
npx -y @insforge/cli login
```
```bash
npx -y @insforge/cli link --project-id 464b9576-7a31-44c7-bc69-d0689dfc7cd3
```
- 접속 정보는 `.insforge/project.json`에 저장되고, git에 올라가지 않습니다.
- AI 코딩 도구용 InsForge 스킬(`insforge`, `insforge-cli` 등)도 함께 설치됩니다. 안내는 `AGENTS.md`에 있습니다.

---

## 8. 품질 기준과 검수 결과

검수에는 디자인·글자 크기·가독성·카피, 네 개의 AI 에이전트를 나눠 썼습니다. 결과는 모두 코드에 반영했습니다.

| 영역 | 반영한 내용 |
|---|---|
| 디자인 | 768px 태블릿 레이아웃 수정, 카드 디자인 통일, "PLACEHOLDER" 문구 제거, 404 추가 |
| 글자 크기 | 타입 스케일 16단계로 통일, 한글 줄 간격 확대, 본문 최소 16px |
| 가독성·접근성 | 작은 글자 명암비 AA(4.5:1) 통과, 모바일 메뉴 접근성, 터치 영역 44px 이상, 모션 일시정지, 페이지마다 h1 하나 |
| 카피 | 실험실 말투를 회사 말투로 바꿈, 메뉴와 주소 이름 변경 (experiments → projects 등) |

**마지막 검사 결과 (1440px, 390px):** 개인정보처리방침을 포함한 모든 페이지가 정상입니다. 문의 폼은 실제 InsForge로 접수와 알림 메일 발송까지 확인했습니다(테스트 데이터는 삭제).
- 모든 페이지가 200으로 응답합니다(404 페이지는 404).
- 가로 스크롤과 깨진 이미지가 없습니다.
- 콘솔 오류가 없습니다.
- 빌드와 리다이렉트도 정상입니다.

### 직접 검사하기 (`tools/`)
```bash
npm run build && npx next start -p 3100
```
다른 터미널에서 실행합니다.
```bash
node tools/routes-shot.js http://localhost:3100 ./shots
```
- 각 페이지를 데스크톱과 모바일 크기로 캡처합니다.
- 응답 코드, 가로 넘침, h1 개수, 깨진 이미지, 콘솔 오류를 검사합니다.
- Playwright가 필요합니다: `npm i -D playwright`, `npx playwright install chromium`
- 404 확인용 주소(`/does-not-exist`)는 응답 코드가 404라서 PROBLEMS에 표시됩니다. 정상입니다.

---

## 9. Figma 연동

웹사이트 Figma 파일(`ciPHVUpSdcJ8U23m6MJgSc`)의 구성은 아래와 같습니다.

| 페이지 | 내용 |
|---|---|
| v1 초안 (정적 시안) | 처음 만든 정적 시안 |
| 01 Home ~ 10 404 | 실제 사이트를 그대로 옮긴 화면. 왼쪽(x=0)은 Desktop 1440, 오른쪽(x=1640)은 Mobile 390 |

- 화면은 **코드를 기준으로 만든 것**입니다. Figma를 고쳐도 코드에는 반영되지 않습니다.
- 레이어와 텍스트는 편집할 수 있습니다. Figma 컴포넌트나 변수와는 연결돼 있지 않습니다.
- 코드를 고친 뒤 Figma를 다시 맞추려면 `tools/snapshot.js`를 씁니다. 이 스크립트는 화면을 Figma에 넣을 수 있는 단독 HTML로 만듭니다.
  - CSS를 인라인으로 넣고, 미디어 쿼리를 대상 폭 기준으로 미리 계산합니다.
  - 이미지를 data URI로 바꾸고, vw/vh 단위를 px로 고정합니다.
  - 이 HTML을 Figma MCP의 `html_to_figma`로 올립니다(Claude Code에서 Figma 연결 필요).

```bash
node tools/snapshot.js http://localhost:3100 ./snaps 1440 / /about /projects
```

```bash
node tools/snapshot.js http://localhost:3100 ./snaps 390 / /about /projects
```

**SNS 킷**(`SumSqGur4kzSZMcT37pOkt`)은 같은 브랜드 시스템으로 만든 SNS 템플릿입니다.
- 크기: 인스타 피드 1080×1350, 스토리 1080×1920, 유튜브 썸네일 1280×720, X/페이스북 1200×675, 카드뉴스 본문
- 라이트/다크 × 4개 사업부(Master, Web, AI, Faith) 조합을 Figma 변수 모드로 바꿀 수 있습니다.

---

## 10. 배포 전 체크리스트

자세한 내용은 `docs/feature-plan.md` §1(P0), §4(결정 체크리스트)에 있습니다.

**대표님이 준비하거나 정할 것**
- [ ] GitHub 저장소를 만들고 이 코드를 올리기
- [ ] Vercel 계정을 만들고 저장소와 연결하기
- [ ] 도메인 `lab98.co`의 소유를 확인하고, Vercel에 연결하기
- [ ] 공개 이메일 정하기. 지금은 **개인 Gmail이 노출**되고 있습니다 → `site.email`
- [ ] 푸터 사업자 정보: 상호, 대표, 사업자등록번호, 주소
- [ ] SNS 주소 넣기. 계정이 없으면 링크를 숨깁니다 → `site.social`
- [ ] 답장 기준("영업일 기준 2일") 확인하기
- [ ] 홈 메인 문구 정하기: 영어 슬로건 또는 한국어 설명
- [ ] 실제 프로젝트 사례, 인사이트, 팀 정보 준비하기. 없으면 해당 섹션을 숨기고 배포합니다.
- [ ] 브랜드 스토리("98"의 의미) 쓰기 (선택)

- [ ] Vercel 환경 변수 4개 등록 (`.env.example` 참고)
- [ ] 개인정보처리방침의 상호와 보호책임자 채우기, 최종 문구 검토 (`app/privacy/page.tsx`의 TODO)
- [ ] 알림 받을 팀 메일 주소를 `CONTACT_NOTIFY_EMAIL`에 넣기

**개발할 것**
- [x] 문의 폼 실제 발송 (Server Action + InsForge DB + InsForge 이메일 + 동의 체크박스)
- [x] 개인정보처리방침 페이지
- [ ] `sitemap.ts`, `robots.ts`, 페이지별 OG 이미지, `manifest.ts`, `favicon.ico`
- [ ] 방문 분석 (Vercel Analytics 등)
- [ ] 에러 페이지 (`error.tsx`)

---

## 11. 로드맵

| 단계 | 내용 |
|---|---|
| P0 런칭 전 | 위 체크리스트 |
| P1 런칭 후 2~4주 | 콘텐츠 관리 방식(CMS 또는 MDX), 프로젝트 케이스 스터디 템플릿, 문의 내역 저장 |
| P2 나중 | 사업부별 기능: 견적 계산기, 자동화 데모, 공동체용 리소스 등 |

자세한 내용은 `docs/feature-plan.md` §2~§5에 있습니다.

---

## 12. 작업 이력

1. **SNS 킷 (Figma):** 범용 미니멀 템플릿으로 만들었습니다.
   - 이후 브랜드 아이덴티티 기준으로 전체 리디자인했습니다.
   - 다크 모드와 사업부별 버전을 추가했습니다.
   - 라이트·다크·회색 배경에서 포인트색 명암비를 보정했습니다.
2. **웹사이트 1차 시안:** 정적 HTML로 만든 시안입니다. `design/v1-static/`, Figma "v1 초안" 페이지에 있습니다.
3. **시안 발전:** 히어로 강화, 하위 페이지, 블로그(인사이트) 섹션을 추가하고 디테일을 다듬었습니다.
4. **Next.js 개발:** 멀티 에이전트로 홈, 회사 소개, 서비스, 프로젝트, 인사이트를 나눠 개발했습니다.
5. **멀티 에이전트 검수:** 디자인, 글자 크기, 가독성, 카피(회사 말투), 기능 기획을 검수했습니다. 결과는 모두 반영했습니다.
6. **Figma 업로드:** 실제 사이트 10페이지를 데스크톱과 모바일로 Figma에 올렸습니다.
7. **GitHub:** https://github.com/crazy-vincnet/lab98-website 에 올렸습니다.
8. **InsForge 백엔드:** 문의 폼을 실제로 저장하고 알림 메일을 보내도록 연결했습니다. 개인정보처리방침 페이지도 추가했습니다.

---

## 13. 알아 둘 점과 함정

- **Tailwind의 `max-sm:` 같은 변형**은 CSS로 `@media not all and (min-width: …)`가 됩니다. `hidden sm:inline-flex`처럼 표시 속성을 섞으면 충돌할 수 있습니다. 헤더 CTA는 `max-sm:hidden`을 씁니다.
- **`.label` 안의 한글**은 `ko-tight`를 붙여야 대문자 변환과 자간이 풀립니다. `@utility`로 정의해서 레이어 순서상 `.label`보다 우선합니다.
- **ESLint `react-hooks/set-state-in-effect`:** effect 안에서 setState를 하지 마세요. 헤더는 "열린 경로를 저장하고 지금 경로와 비교하는" 패턴을 씁니다.
- **명암비:** 원색 포인트색(`text-ai`, `text-faith`)을 작은 글자에 쓰면 AA 기준을 통과하지 못합니다. 글자에는 `*-text` 토큰을 씁니다.
- **회사 프록시 환경에서 `npm install`이 안 될 때**는 네트워크와 프록시 설정을 확인하세요. 일반 로컬 환경에서는 필요 없습니다.
