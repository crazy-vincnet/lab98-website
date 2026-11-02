# Lab98 웹사이트

Lab98(운영 사업자: 제이제이드림, JJdream)의 공식 사이트와 관리자 화면입니다. 이 문서가 프로젝트 전체의 기준 문서입니다.

| 항목 | 내용 |
|---|---|
| 회사 | **Lab98**은 사업자 **제이제이드림(JJdream)**(대표 전영재, 사업자등록번호 793-65-00566)의 브랜드입니다. |
| 사업부 | **Dev**(웹사이트·쇼핑몰·Mac/Windows 프로그램 제작), **AI**(AI 교육과 커뮤니티), **Faith**(교회·선교단체 프로그램) |
| 슬로건 | 기술은 도구일 뿐, 주인공은 사람입니다. (Technology is the tool. People are the point.) |
| 첫 제품 | **Praise Tool**: 예배용 가사·미디어 송출 프로그램. 영구 라이선스 100,000원, **2026-11-11 출시 예정**, 지금은 출시 알림 신청만 받습니다. |
| 언어 | 한국어(기본, `/`)와 영어(`/en`) |
| 사이트 | https://lab98.io (임시 주소: https://sg8srf86.insforge.site) |
| 관리자 | https://lab98.io/admin (대표 전용, 검색 엔진에 노출되지 않음) |
| 저장소 | https://github.com/crazy-vincnet/lab98-website |
| 디자인 원본 | Figma [웹사이트 시안](https://www.figma.com/design/ciPHVUpSdcJ8U23m6MJgSc) · [SNS 킷](https://www.figma.com/design/SumSqGur4kzSZMcT37pOkt) · [브랜드 아이덴티티](https://www.figma.com/design/EU1Z3sRefLqD72UqsCZmId) |

관련 문서: [docs/i18n.md](docs/i18n.md)(다국어) · [docs/admin.md](docs/admin.md)(관리자 구조) · [docs/admin-content.md](docs/admin-content.md)(문구 편집 엔진) · [docs/copy-guide.md](docs/copy-guide.md)(카피 가이드) · [docs/feature-plan.md](docs/feature-plan.md)(초기 기능 기획서, 기록용)

---

## 목차

1. [기술 스택과 구조](#1-기술-스택과-구조)
2. [폴더 구조](#2-폴더-구조)
3. [콘텐츠 모델](#3-콘텐츠-모델)
4. [기능](#4-기능)
5. [환경 변수](#5-환경-변수)
6. [데이터베이스](#6-데이터베이스)
7. [로컬 개발, 빌드, 배포](#7-로컬-개발-빌드-배포)
8. [운영 안내서](#8-운영-안내서)
9. [남은 일과 알려진 한계](#9-남은-일과-알려진-한계)
10. [규칙과 디자인 시스템](#10-규칙과-디자인-시스템)

---

## 1. 기술 스택과 구조

| 분류 | 사용 기술 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js 16.4.3** (App Router) | `cacheComponents: true`, `partialPrefetching: true`. 공개 페이지는 모두 정적으로 만들어집니다. |
| UI | React 19.3, TypeScript 5 | |
| 스타일 | **Tailwind CSS v4** | 토큰은 `src/app/globals.css`의 `@theme`. `tailwind.config`는 없습니다. |
| 글꼴 | `@fontsource` 직접 호스팅 | Archivo, IBM Plex Sans KR, JetBrains Mono |
| 글 편집기 | Tiptap 3.32.2 (버전 고정) | 관리자 블로그 편집기 |
| 백엔드 | **InsForge** (`@insforge/sdk`, `@insforge/cli`) | Postgres, Storage, Auth, Email. 프로젝트 이름 `subserver` |
| 호스팅 | **InsForge 호스팅** (내부적으로 Vercel) | 도메인 `lab98.io` |
| DNS·메일 라우팅 | **Cloudflare** | DNS 레코드는 "DNS only". `hello@lab98.io` 수신은 Cloudflare Email Routing 사용 (설정 위치는 Cloudflare 대시보드이며 코드에서 확인할 수 없습니다) |

> **Next.js 16은 예전 버전과 API가 다릅니다.** 코드를 고치기 전에 `node_modules/next/dist/docs/`를 먼저 보세요(`AGENTS.md`에 같은 안내가 있습니다).
> - 동적 라우트의 `params`는 **Promise**라서 `await`해야 합니다.
> - 페이지 타입은 전역 `PageProps<'/route/[x]'>`, `LayoutProps<'/'>`를 씁니다.
> - 미들웨어 파일 이름은 `proxy.ts`입니다.

### 루트 레이아웃 세 개

`<html>`을 가진 루트 레이아웃이 세 개 있고, 서로 독립입니다. 매칭되지 않는 주소는 `app/global-not-found.tsx`가 처리합니다(`next.config.ts`의 `experimental.globalNotFound`).

| 라우트 그룹 | 주소 | `<html lang>` | 용도 |
|---|---|---|---|
| `(ko)` | `/…` | `ko` | 한국어 공개 페이지 (기본 언어, 주소 접두어 없음) |
| `(en)/en` | `/en/…` | `en` | 영어 공개 페이지 |
| `(admin)/admin` | `/admin/…` | `ko` | 관리자. 하위에 `(auth)`(로그인·설정·비밀번호 재설정), `(panel)`(로그인 뒤 모든 화면), `(preview)`(문구 미리보기, 사이드바 없음) |

- 공개 페이지는 쿠키를 읽지 않고 `proxy.ts`도 거치지 않습니다. `src/proxy.ts`는 `/admin/**`과 `/api/auth/**`에서만 InsForge 세션을 갱신하고 `X-Robots-Tag: noindex, nofollow`와 `Cache-Control: no-store`를 붙입니다. 권한 검사는 아닙니다.
- 공유 파일(`sitemap.ts`, `robots.ts`, `manifest.ts`, `llms.txt`, `llms-full.txt`, `insights/rss.xml`, `actions/`, 한국어 OG 이미지)은 라우트 그룹 밖 `app/` 바로 아래에 있습니다. 그룹 안에 두면 파일 주소에 해시가 붙어 기존 주소가 바뀌기 때문입니다.
- 정적으로 유지하는 방법: 공개 페이지에서 `cookies()`, `Date.now()` 같은 요청 의존 값을 읽지 않습니다. 관리자가 고치는 데이터는 `"use cache"` + `cacheTag`로 읽고, 관리자 동작이 `updateTag`로 갱신합니다.

### 데이터 흐름

```
방문자 ── 정적 페이지(Next.js, 캐시) ── "use cache" 읽기(태그: content, posts, site-settings)
                                          └─ InsForge Postgres (서버 관리자 키로만 접근)
관리자 ── /admin ── requireAdmin() ── Server Action ── DB 저장 + updateTag(태그) → 공개 페이지 갱신
폼 제출 ── Server Action ── 검증·스팸 차단·횟수 제한 ── DB 저장 ── InsForge 이메일
```

---

## 2. 폴더 구조

```
lab98-app/
├── README.md                ← 이 문서
├── AGENTS.md                ← AI 코딩 도구 안내 (Next.js 16 문서, InsForge 스킬)
├── next.config.ts           ← cacheComponents, 리다이렉트 (www → apex, 예전 주소 → 새 주소)
├── docs/                    ← 문서 (아래 표)
├── migrations/              ← InsForge DB 마이그레이션 SQL (6장)
├── tools/                   ← routes-shot.js, snapshot.js (Playwright 검수·캡처), seed-starting-post.mts (첫 글 DB 시드)
├── brand-kit/  design/      ← 원본 브랜드 키트, 1차 정적 시안 (배포에서 제외)
├── public/brand/            ← 사이트에서 쓰는 로고 SVG
├── .env.example             ← 환경 변수 목록 (5장)
└── src/
    ├── proxy.ts             ← /admin, /api/auth 세션 갱신
    ├── app/
    │   ├── (ko)/            ← 한국어 페이지 (얇은 라우트 파일)
    │   ├── (en)/en/         ← 영어 페이지 (얇은 라우트 파일)
    │   ├── (admin)/admin/   ← 관리자: (auth) (panel) (preview) api/media
    │   ├── actions/         ← 공개 폼 Server Action: contact, launch, privacy-request, unsubscribe
    │   ├── api/             ← auth/refresh, admin/launch/export, admin/optouts/export
    │   ├── sitemap.ts robots.ts manifest.ts
    │   ├── llms.txt/ llms-full.txt/ en/llms.txt/ insights/rss.xml/
    │   ├── **/opengraph-image.tsx, twitter-image.tsx   ← 페이지별 한국어 공유 이미지 (영어는 en/ 의 공통 카드)
    │   ├── global-not-found.tsx, globals.css, styles.ts
    ├── components/
    │   ├── pages/           ← ★ 실제 페이지 모듈: xMetadata(locale) + XPage({ locale })
    │   ├── home/ about/ divisions/ experiments/ notes/ praise-tool/ faq/   ← 섹션 컴포넌트와 copy.ts (프로젝트=experiments, 인사이트=notes: 옛 이름 그대로)
    │   ├── chrome/          ← 헤더·푸터·쿠키 배너·404 문구
    │   ├── consent/         ← 쿠키 동의 (배너, ConsentGate)
    │   ├── legal/           ← 개인정보처리방침·이용약관·쿠키 정책 본문과 뷰
    │   ├── privacy-request/ unsubscribe/   ← 개인정보 요청·수신거부 폼
    │   ├── seo/             ← JSON-LD, llms.txt 생성, 메타데이터 도우미, SEO 문구
    │   └── admin/           ← 관리자 UI 부품 (blog, content, media, requests 포함)
    └── lib/
        ├── content.ts / content.en.ts      ← 사이트 데이터 기본값 (회사, 사업부, 프로젝트, 인사이트, FAQ)
        ├── get-content.ts site-content.ts  ← 데이터 접근자 (site-content는 DB 덮어쓰기 포함)
        ├── praise-tool.ts / .en.ts         ← Praise Tool 소개 문구
        ├── copy-store.ts copy-merge.ts content-registry*.ts   ← 문구 편집 엔진
        ├── i18n.ts seo.ts structured-data.ts og/ root-metadata.ts
        ├── posts.ts insights.ts post-doc.ts   ← 블로그 읽기, 정적 글 병합, 본문 허용 목록
        ├── inquiry.ts launch-signup.ts privacy-request.ts unsubscribe.ts unsubscribe-server.ts   ← 폼 규칙
        ├── insforge-admin.ts site-settings.ts kst.ts
        └── admin/           ← 관리자 서버 도우미 (auth, action, audit, throttle, posts, media, requests …)
```

### docs/ 문서

| 파일 | 내용 |
|---|---|
| [`docs/i18n.md`](docs/i18n.md) | 한국어·영어 구조, 문자열 추가 방법, SEO 연동 |
| [`docs/admin.md`](docs/admin.md) | 관리자 구조: 인증, 필수 패턴 3가지, 블로그·미디어, 캐시 규칙, 파일 소유 구역 |
| [`docs/admin-content.md`](docs/admin-content.md) | 문구 덮어쓰기 엔진: API, 레지스트리, 새 문구 파일 변환 절차, 함정 |
| [`docs/copy-guide.md`](docs/copy-guide.md) | 카피 가이드: 포지셔닝, 해요체 원칙, 금지어, 페이지별 확정 문구 |
| [`docs/feature-plan.md`](docs/feature-plan.md) | 초기 기능 기획서 (2026-10-31). 대부분 구현됐고 기록용입니다. |
| `docs/qa-visual.md`, `qa-font-size.md`, `qa-readability.md` | 초기 디자인·글자 크기·가독성 검수 기록 |

---

## 3. 콘텐츠 모델

### 코드 기본값 + DB 덮어쓰기

```
코드 기본값 (문자열 트리)  +  DB content_entries.data (바꾼 문자열만, 경로 → 텍스트)  =  사이트에 보이는 문구
```

- 기본값은 항상 코드에 있습니다. DB에는 관리자가 **공개**한 덮어쓰기만 저장합니다. DB가 비어 있거나 읽기에 실패하면 기본값이 그대로 나옵니다.
- 서버 컴포넌트는 `await getCopy(key, locale, 기본값)`(문구 파일) 또는 `await getSiteContent(locale)`/`getPraiseToolCopy(locale)`(사이트 데이터)로 읽습니다. 공개 페이지는 정적인 채로 유지되고, 관리자가 공개하면 해당 태그만 갱신됩니다.
- 편집할 수 있는 것은 **문자열뿐**입니다. 주소, 가격, 날짜, 슬러그, 이미지 경로, 항목 추가·순서 변경은 코드에서만 바꿉니다. `{token}` 자리표시자 개수는 기본값과 같아야 합니다.
- 편집 가능한 문서(레지스트리, 11개 그룹): 사이트 공통(회사 정보, 메뉴, 머리글·바닥글, 쿠키 배너, 404), 홈 섹션들, 서비스, 소개, 프로젝트, Praise Tool, FAQ 5종, 인사이트 화면, 문의·개인정보 화면, 법적 문서 3종, SEO·메타.
- 블로그 글은 문구 엔진이 아니라 `posts` 테이블에 저장되고, 같은 슬러그의 정적 글(`content.ts`의 `notes`)보다 우선합니다.

엔진 API, 레지스트리 형식, 새 문구 파일 변환 절차는 [docs/admin-content.md](docs/admin-content.md)에 있습니다.

### 다국어(i18n)

- 한국어가 기본이고 접두어가 없습니다(`/about`). 영어는 `/en/about`입니다. 쿠키·`Accept-Language` 리다이렉트는 없습니다.
- 라우트 파일은 얇습니다. 같은 `components/pages/*` 모듈을 `locale` prop만 바꿔 호출합니다. 클라이언트 컴포넌트도 `locale`을 prop으로 받습니다(언어 전환기만 `usePathname()` 사용).
- 내부 링크는 `/en`을 직접 쓰지 않고 `localePath(locale, 한국어경로)`, `projectHref(slug, locale)`, `contactHref(locale)`로 만듭니다. 경로 상수는 `components/experiments/paths.ts`에 있습니다.
- 문자열 종류별 위치:

| 종류 | 위치 | 접근 |
|---|---|---|
| 사이트 데이터 (회사, 메뉴, 사업부, 프로젝트, 인사이트, FAQ) | `lib/content.ts`(ko) / `content.en.ts`(en) | `getSiteContent(locale)` |
| 화면 문구 | `components/<기능>/copy.ts`(ko 기준) + `copy.en.ts`(en, 같은 타입) | `getHomeCopy(locale)` 등 |
| Praise Tool 소개 | `lib/praise-tool.ts` + `.en.ts` | `getPraiseToolCopy(locale)` |
| 머리글·푸터·쿠키 배너·법적 문서 라벨·404 | `components/chrome/copy.ts` + `copy.en.ts` | `getChromeCopy(locale)` |
| 법적 문서 본문 | `components/legal/{privacy,terms,cookies}.copy.ts` + `.en.ts` | `getLegalDocCopy(kind, locale)` |
| SEO 제목·설명 | `components/seo/seo-copy.ts` | 레지스트리 `seo.*` 문서 |

### 문구를 추가하거나 바꾸는 방법

| 하고 싶은 일 | 방법 |
|---|---|
| 기존 문구 수정 (배포 없이) | `/admin/content`에서 고치고 공개 ([8.2](#82-콘텐츠-공개하기)) |
| 기존 문구 기본값 수정 | 해당 `copy.ts`(한국어)와 `copy.en.ts`(영어)를 함께 고칩니다. |
| 새 문자열 추가 | 한국어 `copy.ts`에 키를 추가 → `copy.en.ts`에 같은 키(타입이 `Dict<typeof ko>`라서 빠지면 타입 오류) → 컴포넌트에서 접근자로 사용. 번역 전에는 한국어 값을 두고 `// TODO(en)` 표시 |
| 새 프로젝트·FAQ·사업부 정보 | `lib/content.ts`에 추가하고 `content.en.ts`에 영어 필드 추가. 슬러그·주소·이미지·숫자·날짜는 두 언어가 같아야 합니다. |
| 새 페이지 | `components/pages/<이름>.tsx`(`<이름>Metadata(locale)` + `<이름>Page({ locale })`, `pageMetadata({ …, path, locale })`에는 **한국어 경로**) → `(ko)`와 `(en)/en`에 얇은 라우트 파일 → `sitemap.ts`에 경로 추가 → 필요하면 `paths.ts`에 상수 |
| 새 문구를 관리자에서도 편집 가능하게 | 레지스트리에 문서를 추가하고 소비하는 쪽을 `getCopy`로 바꿉니다 (docs/admin-content.md의 변환 절차) |

남은 번역 표시 찾기: `grep -rn "TODO(en)" src docs`

---

## 4. 기능

### 4.1 공개 사이트

| 주소 (한국어) | 페이지 | 비고 |
|---|---|---|
| `/` | 홈 | 히어로(애니메이션 일시정지 버튼, `prefers-reduced-motion` 준수), 서비스, 프로젝트, 진행 방식, 대표, 최신 인사이트, FAQ, 문의 폼(`/#contact`) |
| `/about` | 회사 소개 | |
| `/services/dev` · `/ai` · `/faith` | 사업부 상세 | `/services/web`은 `/services/dev`로 308 이동 |
| `/praise-tool` | Praise Tool 소개 | 출시일 D-day(KST), 출시 알림 신청 폼, FAQ |
| `/projects`, `/projects/[slug]` | 프로젝트 목록·상세 | 현재 5건: nkhb, nkfi, pbf, pray4nk, befriends |
| `/insights`, `/insights/[slug]` | 인사이트(블로그) | 정적 글 + 관리자가 쓴 글 |
| `/privacy`, `/terms`, `/cookies` | 법적 문서 | 푸터에 링크 |
| `/privacy/request` | 개인정보 요청 | noindex |
| `/unsubscribe` | 이메일 수신거부 | noindex |

- 영어 페이지는 모두 `/en` 아래에 같은 구조로 있습니다.
- 상세 페이지는 `generateStaticParams`로 빌드 때 만들어집니다. 새로 쓴 인사이트는 첫 방문 때 만들어져 캐시됩니다(`dynamicParams` 유지, 없는 슬러그는 404).
- 예전 주소는 `next.config.ts`에서 308로 보냅니다: `www.lab98.io` → `lab98.io`, `/experiments*` → `/projects*`, `/notes*` → `/insights*`, `/divisions/*` → `/services/*`, 삭제한 예시 프로젝트·글 → 각 목록. **주소를 바꿀 때**는 `components/experiments/paths.ts` 한 곳을 고치고 예전 주소를 `next.config.ts`에 추가합니다.

### 4.2 문의 폼과 스팸 차단

`components/home/contact-form.tsx` → `submitInquiry()` (`app/actions/contact.ts`)

1. 서버에서 다시 검증 (`lib/inquiry.ts`, 브라우저와 공용). 개인정보 동의 필수.
2. 스팸: 숨은 입력칸(`website`)이 채워졌거나 3초 안에 제출되면 저장하지 않고 성공처럼 응답합니다.
3. 횟수 제한: 같은 방문자 10분에 3건, 사이트 전체 1시간에 30건 (DB 개수로 계산).
4. `inquiries`에 저장. 방문자 IP는 `INQUIRY_IP_SALT`를 붙인 SHA-256 해시로만 저장합니다.
5. `CONTACT_NOTIFY_EMAIL`로 알림 메일. 메일이 실패해도 문의는 저장되고 `notified = false`로 남습니다.

문의는 `/admin/inquiries`에서 확인합니다. 상태(`new` → `replied` → `closed`, 또는 `spam`), 메모, 관리자 답장, 삭제가 있고 답장은 `inquiry_replies`에 기록됩니다. 알림 메일의 발신 주소는 InsForge 고정 주소(`noreply@sg8srf86.send.insforge.dev`)이고 표시 이름만 바뀝니다. 답장 주소(reply-to)는 실제 메일함이어야 합니다.

### 4.3 Praise Tool 출시 알림

- 신청: `/praise-tool`의 폼 → `signupLaunch()` (`app/actions/launch.ts`). 이메일(필수), 기관(선택), 동의(필수). 같은 이메일 중복은 `already`로 응답하고 아무것도 보내지 않습니다. 횟수 제한은 방문자 10분 3건, 전체 1시간 60건입니다. 신청자에게 확인 메일은 가지 않고 팀에 알림이 갑니다.
- 발송: `/admin/launch` (절차는 [8.3](#83-praise-tool-출시일-절차)). 수신거부 목록(`email_optouts`)에 있는 주소는 자동 제외하고, 확인할 수 없으면 보내지 않습니다(fail-closed). 모든 메일 본문에 수신거부 링크가 붙습니다.
- 개인정보: 발송 1일 뒤, 늦어도 출시일 + 30일에 자동 삭제됩니다 ([4.5](#45-보유-기간과-자동-삭제)).

### 4.4 개인정보·법적 문서

| 구성 | 내용 |
|---|---|
| 법적 문서 | 개인정보처리방침, 이용약관, 쿠키 정책 (한국어·영어). 본문은 `components/legal/*`, 관리자 `/admin/legal`에서 수정 (공개할 때 변경 메모 필수) |
| 쿠키 동의 배너 | 선택 결과를 이 브라우저의 `localStorage`(`lab98-consent`)에만 저장합니다. 사이트는 쿠키를 설정하지 않고 분석 도구도 불러오지 않습니다. 나중에 분석 도구를 넣을 때 `ConsentGate`로 감쌉니다. 푸터와 쿠키 정책 페이지에서 설정을 다시 열 수 있습니다. |
| 개인정보 요청 | `/privacy/request` (열람·정정·삭제·처리정지·동의철회) → `privacy_requests` 저장 + 요청자에게 확인 메일 + 팀 알림(요청 1건당 메일 2통). **요청자가 그 메일에 회신해 본인임이 확인된 뒤에만** 처리합니다. 기한은 접수 후 10일. 관리자 `/admin/privacy`에서 처리하고, `/admin/privacy/erase`로 이메일 기준 삭제(미리보기 → 실행)를 합니다. |
| 수신거부 | `/unsubscribe` → `email_optouts`에 소문자 이메일 저장 (선택: 출시 알림 신청도 삭제). 방문자 IP는 저장하지 않습니다. 관리자 `/admin/optouts`에서 추가·삭제·CSV 내보내기. |

**수신거부 서명 링크**

- 우리가 보내는 메일의 수신거부 링크는 `https://lab98.io/unsubscribe?email=<주소>&t=<토큰>`(영어 수신자는 `/en/unsubscribe`) 형태입니다. 토큰은 `HMAC-SHA256(UNSUBSCRIBE_SECRET, "unsub:v1:" + 소문자 이메일)`의 base64url 값이고, 수신자마다 다릅니다 (`lib/unsubscribe-token.ts`). 유효기간은 없습니다.
- 유효한 토큰이 있으면 그 주소만 바로 `email_optouts`에 추가합니다(선택: 출시 알림 신청도 삭제).
- 토큰이 없거나 틀린 요청(주소를 직접 입력)은 **수신거부를 처리하지 않습니다.** 이미 아는 수신자(`launch_signups`에 있는 주소)에게만 서명 링크가 든 확인 메일을 보내고, 그 링크를 눌러야 완료됩니다. 아는 주소든 모르는 주소든 화면 응답과 걸리는 시간(최소 1.2초)이 같아서 어떤 주소가 있는지 알 수 없습니다.
- 확인 메일 제한 (`lib/unsubscribe-confirm.ts`): 같은 주소에 1시간에 1통, 사이트 전체 1시간에 20통. 기록은 `unsubscribe_confirmations`에 주소 대신 키 해시(HMAC)로 남기고, 하루 지난 행은 앱이 지웁니다. 전체 상한에 걸리면 "잠시 뒤 다시 시도" 안내가 나옵니다.
- 운영 환경에서 `UNSUBSCRIBE_SECRET`이 없으면 링크를 만들거나 검증할 수 없고 실패합니다(fail-closed). 개발 환경에서만 임시 값을 씁니다.

### 4.5 보유 기간과 자동 삭제

| 데이터 | 보유 기간 | 삭제 |
|---|---|---|
| 문의(`inquiries`) | 종료(closed/spam) 후 1년. 상태와 관계없이 최대 3년 | 자동 |
| 출시 알림 신청(`launch_signups`) | 발송 완료(`notified_at`) 1일 뒤. 출시일(2026-11-11) + 30일에는 남은 것도 모두 | 자동 |
| 개인정보 요청(`privacy_requests`) | 처리 완료(done/rejected) 후 3년 | 자동 |
| 수신거부(`email_optouts`) | 본인이 삭제를 요청할 때까지 (메일을 막는 기록이라 유지) | 요청 시 관리자가 삭제 |
| 로그인 시도(`login_attempts`) | 해시만 저장, 앱이 오래된 행을 정리 | 자동 |

자동 삭제는 DB 함수 `purge_expired_personal_data()`를 InsForge 스케줄 `purge-expired-personal-data`(매일 cron `17 18 * * *` = UTC 18:17, 한국 시간 03:17)가 `POST /api/database/rpc/purge_expired_personal_data`로 호출합니다. 2026-11-02 기준 활성 상태를 CLI로 확인했습니다. 확인: `npx -y @insforge/cli schedules list`

### 4.6 SEO와 GEO

| 항목 | 구현 |
|---|---|
| `sitemap.xml` | 모든 공개 페이지를 한국어·영어로 한 번씩, 각각 hreflang 대체 주소 포함. 인사이트는 DB 글도 포함하고, 번역본이 있을 때만 대체 주소를 냅니다. `new Date()`를 쓰지 않습니다. |
| `robots.txt` | 모든 크롤러 허용. Googlebot, Bingbot, Yeti(네이버), Daum, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Applebot 계열, Google-Extended를 명시적으로 허용. `/admin`, `/api`, `/privacy/request`, `/unsubscribe`(영어 포함)는 차단 (`lib/seo.ts`의 `NOINDEX_PATHS`) |
| `llms.txt`, `llms-full.txt`, `/en/llms.txt` | 회사·서비스·가격·Praise Tool·프로젝트·FAQ 요약. `llms-full.txt`는 한국어만이고, 인사이트는 정적 글만 포함합니다. |
| RSS | `/insights/rss.xml` (한국어 글만, DB 글 포함, 약 1분 캐시) |
| OG·Twitter 이미지 | 페이지마다 `opengraph-image.tsx`/`twitter-image.tsx`로 생성(`lib/og`). 영어 하위 페이지는 `/en`의 공통 카드를 씁니다. 글의 공유 이미지를 지정하면 그것을 우선합니다. |
| JSON-LD | Organization, Person, WebSite(언어별), BreadcrumbList, FAQPage, Service/OfferCatalog, SoftwareApplication(Praise Tool, Offer), ItemList(프로젝트), Blog/BlogPosting (`lib/structured-data.ts`). Praise Tool의 판매 상태는 출시일에 `InStock`으로 바꿔야 합니다 (코드의 `TODO(launch 2026-11-11)`). |
| hreflang | `ko`, `en`, `x-default`(=한국어). 개인정보 요청·수신거부 페이지는 noindex라 대체 주소를 내지 않습니다. |
| 검색 등록 | 구글·네이버 소유권 인증 코드는 `/admin/search`에서 저장하면 재배포 없이 `<meta>`에 반영됩니다. 환경 변수는 DB 값이 없을 때만 쓰는 대비책입니다. |
| 기타 | `manifest.webmanifest`, `icon.png`, `apple-icon.png`, `favicon.ico`, `/admin`은 noindex |

### 4.7 관리자 (`/admin`)

한국어 화면, 대표 전용입니다. 구조와 개발 규칙은 [docs/admin.md](docs/admin.md).

**인증 모델**

- InsForge 이메일+비밀번호 로그인(`@insforge/sdk/ssr`)입니다. 프로젝트의 회원가입이 열려 있어서 로그인만으로는 관리자가 아닙니다.
- 모든 관리자 페이지·동작·API가 `requireAdmin()`/`adminAction()`/`adminRoute()`를 먼저 호출하고, **이메일 인증이 끝났고 `ADMIN_EMAILS`에 있거나 `admins` 테이블에 있는** 사용자만 통과시킵니다. 확인할 수 없으면 거부합니다.
- 로그인 시도는 IP+이메일 해시 기준으로 10분에 5회(IP당 20회)까지 허용합니다.
- 로그인·설정·비밀번호 재설정 화면은 이메일이 존재하는지, 관리자인지 알려주지 않습니다.

**화면**

| 메뉴 | 주소 | 하는 일 |
|---|---|---|
| 대시보드 | `/admin` | 새 문의, 출시 알림 신청, 처리 전 개인정보 요청, 수신거부 수 |
| 문의 | `/admin/inquiries` | 목록·상세, 답장, 상태·메모, 스팸 표시, 삭제 |
| Praise Tool 알림 | `/admin/launch` | 신청자 목록, CSV, 삭제, 출시 메일 작성·테스트·발송 |
| 개인정보 요청 | `/admin/privacy` | 요청 처리, 이메일 기준 삭제(`/erase`) |
| 수신거부 | `/admin/optouts` | 목록, 추가·삭제, CSV |
| 블로그 | `/admin/blog` | 글 목록, 블록 편집기, 예약·발행, 버전, 번역본 만들기, 미리보기 |
| 사이트·홈·서비스·소개 문구 | `/admin/content` | 공통 문구, 홈, 서비스, 소개, 인사이트 화면, 문의·개인정보 화면, SEO·메타 |
| 프로젝트 | `/admin/projects` | 프로젝트 소개글 |
| Praise Tool 페이지 | `/admin/praise-tool` | 소개 페이지 문구 |
| FAQ | `/admin/faq` | 홈, Dev, AI, Faith, Praise Tool FAQ |
| 법적 문서 | `/admin/legal` | 개인정보처리방침, 이용약관, 쿠키 정책 |
| 미디어 | `/admin/media` | 이미지 올리기, 대체 텍스트, 사용처 확인 |
| SEO·검색 등록 | `/admin/search` | 구글·네이버 인증 코드, 사이트맵 주소, 상태 점검, 등록 안내 |
| 감사 로그 | `/admin/audit` | 로그인, 저장, 공개, 발송, 삭제 기록 (본문 전체나 비밀은 남기지 않음) |

**콘텐츠 편집 흐름** (문구, 프로젝트, FAQ, 법적 문서 공통): 초안 저장 → 미리보기(실제 공개 페이지에 초안 적용) → 공개 → 버전 기록(최근 50개)에서 복원. 복원은 옛 문구를 **새 버전으로** 공개합니다. 다른 탭에서 먼저 저장했다면 덮어쓰지 않고 거부합니다.

**블로그**: 블록 편집기(Tiptap)로 쓰고, 상태는 초안·예약·발행입니다. 예약은 크론 없이 "발행 시각이 지났는지"를 읽을 때 판단합니다(공개까지 1~2분). 초안은 약 10초마다 자동 저장하고, 공개된 글은 저장 버튼으로만 바뀝니다. 본문은 허용 목록(`lib/post-doc.ts`)으로만 저장·표시하며 `dangerouslySetInnerHTML`을 쓰지 않습니다. 슬러그는 언어별로 유일합니다. 영어/한국어 번역본은 `translation_key`로 묶입니다.

**미디어**: png, jpg, webp, gif만 받습니다(SVG 거부, 파일 내용으로 형식 확인, 5MB 이하). 한국어 대체 텍스트 필수. 사용 중인 이미지는 삭제할 수 없습니다. 호스팅의 요청 크기 한도(약 4.5MB) 때문에 4.5~5MB 파일은 거부될 수 있습니다.

**메일 한도**: InsForge가 시간당 발송 수를 제한합니다(요금제에 따라 대략 10~50통). 출시 메일은 한 번에 8통씩 1.2초 간격으로 보내고, 한도에 걸리면 멈춰서 나중에 이어 보냅니다. 새 출시 메일 초안은 시간당 5개까지 만들 수 있습니다.

---

## 5. 환경 변수

`.env.example`을 복사해 `.env.local`을 만듭니다(git에 올라가지 않습니다). 호스팅에는 `npx -y @insforge/cli deployments env set <KEY> <VALUE>`로 넣고, **바꾼 뒤에는 다시 배포해야 반영됩니다.**

| 변수 | 용도 | 비밀 | `.env.local` | 호스팅 |
|---|---|---|---|---|
| `INSFORGE_URL` | InsForge 프로젝트 주소 | 아니오 | 필수 | 필수 |
| `INSFORGE_API_KEY` | InsForge 관리자 키(`ik_…`), 서버 전용. 확인: `npx -y @insforge/cli secrets get API_KEY` | **예** | 필수 | 필수 |
| `CONTACT_NOTIFY_EMAIL` | 새 문의·신청·요청 알림을 받을 팀 메일 | 아니오 | 필수 | 필수 |
| `INQUIRY_IP_SALT` | 방문자 IP 해시용 긴 랜덤 문자열. 만들기: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` | **예** | 필수 | 필수 |
| `NEXT_PUBLIC_INSFORGE_URL` | 인증 SDK용 프로젝트 주소 | 아니오 | 필수 | 필수 |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | 공개용 anon 키(브라우저로 전달됨, 관리자 키 아님). 확인: `npx -y @insforge/cli secrets get ANON_KEY` | 아니오 | 필수 | 필수 |
| `ADMIN_EMAILS` | 관리자 이메일(쉼표 구분, 소문자). 이 목록이 관리자를 결정합니다. | 아니오 | 필수 | 필수 |
| `UNSUBSCRIBE_SECRET` | 수신거부 링크 서명용 비밀값, 16자 이상 (4.4). 운영에서 필수. 만들기: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. 링크에 유효기간이 없으므로 한 번 정하면 바꾸지 않습니다. | **예** | 필수 | 필수 |
| `GOOGLE_SITE_VERIFICATION` | 구글 소유권 인증 코드(`content="…"`의 값만). 대비책이며 보통 `/admin/search`에서 저장 | 아니오 | 선택 | 선택 |
| `NAVER_SITE_VERIFICATION` | 네이버 서치어드바이저 인증 코드. 위와 같음 | 아니오 | 선택 | 선택 |

- `INSFORGE_API_KEY`, `INQUIRY_IP_SALT`, `UNSUBSCRIBE_SECRET`에는 `NEXT_PUBLIC_`을 붙이지 마세요.
- 현재 호스팅에 등록된 키(2026-11-02 확인): `INSFORGE_URL`, `INSFORGE_API_KEY`, `CONTACT_NOTIFY_EMAIL`, `INQUIRY_IP_SALT`, `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, `ADMIN_EMAILS`. 확인: `npx -y @insforge/cli deployments env list`
- InsForge 접속 정보는 `.insforge/project.json`(git 제외)에 있고 CLI가 씁니다.

---

## 6. 데이터베이스

InsForge Postgres, 스키마 `public`. **모든 테이블에 RLS가 켜져 있고 `anon`/`authenticated` 권한을 회수했습니다.** 읽기·쓰기는 서버의 관리자 키(`getInsforgeAdmin()`)로만 하며, 공개 키로는 거부됩니다. 관리자 화면에서도 마찬가지로 서버가 관리자 키로 접근하고, 권한 검사는 `requireAdmin()`이 합니다.

### 테이블

| 테이블 | 용도 |
|---|---|
| `inquiries` | 문의 폼 접수. 상태, 관리자 메모, 답장 시각 |
| `inquiry_replies` | 관리자 답장 기록 |
| `launch_signups` | Praise Tool 출시 알림 신청 (이메일은 제품별 유일) |
| `privacy_requests` | 개인정보 요청 (유형, 상태, 관리자 메모, 처리 기한) |
| `email_optouts` | 수신거부 목록 (소문자 이메일) |
| `mail_campaigns` | 출시 메일 작성·테스트·발송 상태, 실패 목록 |
| `admins` | `ADMIN_EMAILS` 외에 추가한 관리자 이메일 |
| `audit_log` | 관리자 활동 기록 |
| `login_attempts` | 로그인 시도 제한용 (IP·이메일 해시) |
| `site_settings` | 검색 인증 코드 등 사이트 설정 |
| `content_entries`, `content_versions` | 문구 덮어쓰기(공개본, 초안)와 버전 기록 |
| `posts`, `post_versions` | 블로그 글과 버전 기록 |
| `media` (+ 공개 스토리지 버킷 `media`) | 업로드 이미지와 대체 텍스트 |
| `unsubscribe_confirmations` | 수신거부 확인 메일의 주소별 쿨다운과 전체 횟수 제한 (주소는 키 해시로만 저장, 하루 뒤 삭제) |

DB 함수: `purge_expired_personal_data()`(자동 삭제, 관리자 키만 실행 가능), `admin_purge_unverified_user(email)`(관리자 설정 시 미인증 선등록 제거).

### 마이그레이션 (`migrations/`)

| 파일 | 내용 |
|---|---|
| `20261101065315_create-inquiries.sql` | `inquiries` 테이블, RLS |
| `20261101085728_dev-division-and-launch-signups.sql` | 사업부 이름 Web → Dev, `launch_signups` |
| `20261101092127_privacy-requests-optouts-retention.sql` | `privacy_requests`, `email_optouts`, `purge_expired_personal_data()` |
| `20261101120000_admin-foundation.sql` | 관리자 기반 테이블 전부(admins, audit_log, 콘텐츠, 글, 미디어, 답장, 캠페인) |
| `20261101120001_admin-requests.sql` | 출시 메일 발송 상태 열, 개인정보 요청 메모 |
| `20261101140000_blog-media-stage3.sql` | 글 번역 키·사업부·작성자, 대체 텍스트 필수 |
| `20261101150000_content-engine-stage4a.sql` | 문구 초안 열, 키 형식 검사, 버전 유일 인덱스 |
| `20261102100000_unsubscribe-confirmations.sql` | `unsubscribe_confirmations` (수신거부 확인 메일 제한) |

새 구조가 필요하면 새 마이그레이션을 만듭니다(기존 파일 수정 금지).

```bash
npx -y @insforge/cli db migrations new <이름>
npx -y @insforge/cli db migrations up --all
```

---

## 7. 로컬 개발, 빌드, 배포

**필요한 것:** Node.js 20 이상(작업 환경 22.x), npm 10 이상

```bash
npm install
cp .env.example .env.local   # 값을 채웁니다 (5장)
npm run dev                  # http://localhost:3000
```

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 배포용 빌드 (타입 검사 포함) |
| `npm run start` | 빌드 결과 실행. 포트 변경: `npx next start -p 3100` |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 타입 검사만 |
| `npx next typegen` | 라우트 타입(`PageProps<…>`) 다시 만들기 |

- 빌드할 때 DB에 닿지 않으면 읽기 캐시가 짧아지고 `/_not-found`에서 빌드가 실패할 수 있습니다. 네트워크가 돌아오면 다시 빌드하세요.
- 관리자 화면을 로컬에서 쓰려면 `.env.local`의 `ADMIN_EMAILS`와 InsForge 키가 필요합니다.

### InsForge 연결 (새 PC)

```bash
npx -y @insforge/cli login
npx -y @insforge/cli link --project-id 464b9576-7a31-44c7-bc69-d0689dfc7cd3
```

AI 코딩 도구용 InsForge 스킬도 함께 설치됩니다(`AGENTS.md`).

### 샌드박스(프록시) 환경에서 CLI 쓰기

프록시를 거치는 환경에서는 CLI 앞에 `NODE_USE_ENV_PROXY=1`을 붙입니다.

```bash
NODE_USE_ENV_PROXY=1 npx -y @insforge/cli deployments env list
```

### 배포

```bash
npm run build                                   # 먼저 로컬 빌드 확인
npx -y @insforge/cli deployments deploy .       # 프로젝트 전체를 올리면 InsForge가 빌드 (1분 정도)
```

- `node_modules`, `.next`, `.env*`, `.insforge`는 자동으로 빠지고, `brand-kit/`, `design/`, `tools/`, `docs/`, `migrations/`는 `.vercelignore`로 뺍니다.
- **GitHub에 push해도 자동 배포되지 않습니다.** 위 명령으로 직접 배포합니다.
- 환경 변수 확인·변경: `npx -y @insforge/cli deployments env list` / `env set <KEY> <VALUE>` (변경 후 재배포)

### 도메인 (lab98.io)

- `lab98.io`와 `www.lab98.io`가 InsForge 배포에 연결돼 있고, `www`는 `lab98.io`로 308 이동합니다.
- DNS는 Cloudflare입니다. 아래 두 레코드를 **Proxy status "DNS only"(회색 구름)**로 둡니다.

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `216.150.16.1` | DNS only |
| CNAME | `www` | `ffa5587e4bceb6ab.vercel-dns-016.com` | DNS only |

- 상태 확인: `npx -y @insforge/cli domains status lab98.io --json` (`misconfigured: false`이면 정상)
- `site.url`(`src/lib/content.ts`)은 `https://lab98.io`이고 canonical, 공유 미리보기, 사이트맵의 기준입니다.

### 화면 검수 도구 (`tools/`)

```bash
npm run build && npx next start -p 3100
node tools/routes-shot.js http://localhost:3100 ./shots   # 다른 터미널
```

모든 페이지를 데스크톱·모바일로 캡처하고 응답 코드, 가로 넘침, h1 개수, 깨진 이미지, 콘솔 오류를 검사합니다. Playwright가 필요합니다(`npm i -D playwright`, `npx playwright install chromium`). 404 확인용 주소는 PROBLEMS에 표시되는 것이 정상입니다. `tools/snapshot.js`는 화면을 Figma에 올릴 단독 HTML로 만드는 스크립트입니다.

---

## 8. 운영 안내서

### 8.1 처음 관리자 로그인

1. 호스팅 환경 변수에 `ADMIN_EMAILS`(본인 이메일), `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`가 있는지 확인합니다.
2. `https://lab98.io/admin/setup`을 엽니다.
3. `ADMIN_EMAILS`에 있는 이메일과 새 비밀번호(10자 이상)를 넣고 **인증 코드 받기**를 누릅니다. 미인증 선등록이 있으면 먼저 지워집니다.
4. 메일로 온 코드를 넣고 **인증하고 시작하기**를 누르면 로그인된 채로 `/admin`이 열립니다.
5. 이후에는 `/admin/login`, 비밀번호를 잊었다면 `/admin/forgot-password`.

관리자를 더 추가하려면 `admins` 테이블에 소문자 이메일을 넣고 그 사람이 같은 방법으로 설정합니다. 단, `/admin/setup`은 `ADMIN_EMAILS`나 `admins`에 있는 이메일만 만들 수 있습니다.

### 8.2 콘텐츠 공개하기

문구·프로젝트·FAQ·법적 문서:
1. `/admin/content`(또는 프로젝트, Praise Tool 페이지, FAQ, 법적 문서) → 문서 선택 → 언어(ko/en) 선택.
2. 고치고 **초안 저장** → 미리보기(iframe 또는 새 탭)로 실제 페이지에서 확인.
3. **공개하기**(법적 문서는 변경 메모 필수). 몇 초 안에 사이트에 반영됩니다. SEO 제목·설명은 검색 엔진이 다시 읽을 때 반영됩니다.
4. 되돌리기: 버전 기록에서 옛 버전을 **복원**하면 새 버전으로 공개됩니다. 한 칸만 되돌리려면 "기본값으로 되돌리기".

블로그: `/admin/blog` → 새 글 → 쓰기 → 필요하면 미리보기 → 발행 또는 예약(시각은 KST). 영어판은 "영어 버전 만들기"로 초안을 만든 뒤 번역합니다.

### 8.3 Praise Tool 출시일 절차

사전 준비: 출시 메일 문구 확정, `CONTACT_NOTIFY_EMAIL`와 reply-to(`hello@lab98.io`)가 받을 수 있는 메일함인지 확인, 출시 전날 CSV를 내려받아 보관(발송 후 자동 삭제되므로), InsForge 요금제의 시간당 발송 한도 확인.

1. `/admin/launch`에서 신청자 수와 "발송 대상"(수신거부 제외)을 확인합니다.
2. **출시 메일 쓰기**: 제목과 본문을 쓰고 테스트 메일을 **본인 주소로** 보냅니다. 링크, 수신거부 링크, 표시 이름을 받은 편지함에서 확인합니다. 테스트를 보내기 전에는 실제 발송이 막혀 있습니다.
3. **실제로 보내기**: 확인 창의 인원이 현재 대상 수와 같아야 시작됩니다. 브라우저 창을 닫지 말고 기다립니다(8통씩 보내며 진행 표시).
4. **한도에 걸리면** 자동으로 멈춥니다("일시정지"). 안내된 시간 뒤에 같은 화면(또는 상단의 "이어서 보내러 가기")에서 **이어서 보내기**를 누릅니다. 이미 보낸 사람은 다시 보내지 않습니다. 창을 닫거나 오류가 나도 안전하게 이어집니다.
5. 실패한 주소가 있으면 **실패한 분께 다시 보내기 준비**를 누른 뒤 **이어서 보내기**를 누릅니다.
6. 발송 후: 신청자 정보는 1일 뒤 자동 삭제되고, 남은 것도 2026-12-11(출시일 + 30일)에 삭제됩니다. `/admin/audit`에서 `launch.campaign_*` 기록을 확인합니다.
7. 같은 날: Praise Tool 판매 상태(JSON-LD `InStock`)와 출시일 관련 문구를 코드에서 바꾸고 배포합니다 (4.6).

### 8.4 검색 등록

1. `/admin/search`에서 사이트맵 주소와 등록 안내를 봅니다.
2. Google Search Console: 속성 추가 → URL 접두어 `https://lab98.io/` → HTML 태그의 `content` 값만 복사 → "구글 인증 코드"에 저장 → "지금 점검하기"에서 정상 확인 → Search Console에서 **확인** → Sitemaps에 `sitemap.xml` 제출.
3. 네이버 서치어드바이저: 사이트 등록 → HTML 태그 인증 코드를 "네이버 인증 코드"에 저장 → 확인 → 사이트맵 제출.
4. 재배포는 필요 없습니다. 저장하면 `<meta>`가 바로 바뀝니다.

### 8.5 백업과 되돌리기

- 문구·법적 문서: 버전 기록(문서·언어별 최근 50개)에서 복원. 코드 기본값은 git에 있습니다.
- 블로그: 글별 버전 기록(최근 50개)에서 복원. 글 삭제는 되돌릴 수 없습니다.
- 코드: git 태그/커밋으로 되돌린 뒤 다시 배포합니다 (`npx -y @insforge/cli deployments deploy .`).
- DB 전체 백업: InsForge 대시보드 또는 CLI의 backups 기능을 사용합니다 (이 저장소에는 백업 스크립트가 없습니다. 주기와 보관 정책은 정해진 바 없음).
- 개인정보 삭제(자동·수동)는 복구할 수 없습니다.

### 8.6 키 교체

| 대상 | 방법 |
|---|---|
| InsForge 관리자 키 | InsForge에서 재발급 → `.env.local`과 호스팅의 `INSFORGE_API_KEY` 교체 → 재배포. 자동 삭제 스케줄은 헤더에 `${{secrets.API_KEY}}`(프로젝트 시크릿)를 참조하므로 따로 고치지 않아도 되지만, 교체 다음 날 `schedules list`의 다음 실행과 로그를 확인하세요. |
| anon 키 | 재발급 후 `NEXT_PUBLIC_INSFORGE_ANON_KEY` 교체 → 재배포 (로그인 상태가 풀릴 수 있음) |
| `INQUIRY_IP_SALT` | 바꾸면 이전 IP 해시와 이어지지 않아 횟수 제한 기록만 초기화됩니다. 안전하게 교체 가능 |
| `UNSUBSCRIBE_SECRET` | 바꾸면 **이미 보낸 메일의 수신거부 링크가 모두 무효**가 됩니다(링크에 유효기간이 없어 한 번 정하면 유지하는 값). 유출됐을 때만 바꾸고, 이전 링크를 받은 사람은 `/unsubscribe`에서 확인 메일을 다시 받아야 합니다. |
| 관리자 비밀번호 | `/admin/forgot-password` |

환경 변수를 바꾼 뒤에는 항상 재배포합니다.

---

## 9. 남은 일과 알려진 한계

**대표님이 정하거나 채울 것**

- [ ] 사업자 **주소**: `src/lib/content.ts`의 `site.business.address`가 비어 있습니다(`TODO(content)`). 푸터와 법적 문서에 필요합니다.
- [ ] **SNS 계정**: `site.social`이 비어 있어 푸터의 Follow 열이 숨겨져 있습니다.
- [ ] **FAQ 답변**은 대표 검토가 필요합니다 (가격, 일정, 범위, 지원 조건 등 사실 확인).
- [ ] 대표 사진(`about-sections.tsx`)과 Praise Tool **스크린샷**(`pages/praise-tool.tsx`)은 자리만 있습니다(`TODO(content)`).
- [ ] Praise Tool 소개 문구 중 고객 요청서가 잘려 우리가 채운 문장에 `// reconstructed` 표시가 있습니다(`src/lib/praise-tool.ts`, 약 20곳). 출시 전에 고객 확인을 받아야 합니다. 관리자에서 고쳐도 표시는 코드에 남습니다.
- [ ] 출시일 이후 Praise Tool 구매 방법/링크와 JSON-LD 판매 상태 변경.

**법무·보안**

- [ ] 개인정보처리방침, 이용약관, 쿠키 정책은 **법률 전문가 검토**가 필요합니다. 초안 수준입니다.
- [ ] **GitHub 저장소를 private로** 바꿉니다 (현재 `crazy-vincnet/lab98-website`).
- [ ] 호스팅에 `UNSUBSCRIBE_SECRET`을 등록하고 새 마이그레이션(`20261102100000`)을 적용한 뒤 배포합니다. 출시 메일을 보내기 전에 필수입니다 (4.4).

**기술적 한계**

- 메일은 InsForge 이메일을 씁니다. 발신 주소는 고정(`noreply@…insforge.dev`)이고 **시간당 발송 한도**(대략 10~50통)가 있어 신청자가 많으면 출시 메일이 여러 시간에 걸칩니다. 규모가 커지면 **Amazon SES** 같은 전용 발송 서비스를 검토하세요.
- `llms-full.txt`와 RSS는 한국어만이고, `llms.txt` 계열은 정적 인사이트만 반영합니다(관리자에서 쓴 글 제외. RSS는 DB 글 포함). 영어 RSS는 없습니다. 영어 하위 페이지의 공유 이미지는 공통 카드 하나입니다.
- 편집기는 문자열만 바꿉니다. 항목 추가·순서 변경, 가격·주소·이미지 경로는 코드를 고쳐야 합니다. 배열 순서를 코드에서 바꾸면 저장된 덮어쓰기가 다른 항목을 가리킬 수 있습니다.
- 방문 분석 도구는 없습니다. 넣을 때는 `ConsentGate`로 감싸고 개인정보처리방침을 먼저 고칩니다.
- `error.tsx`(런타임 오류 화면)는 아직 없습니다.
- 프로젝트·인사이트 폴더 이름(`components/experiments`, `components/notes`)은 옛 이름이 남은 것입니다. 바꾸려면 import 경로를 함께 고쳐야 합니다.
- 수신거부 요청의 방문자별 횟수 제한은 서버 인스턴스 메모리 기준입니다(IP를 저장하지 않기 위해). 전체 제한은 DB 기준입니다.

---

## 10. 규칙과 디자인 시스템

### 작업 규칙

- Next.js 16 문서(`node_modules/next/dist/docs/`)를 먼저 봅니다. 비밀 값은 코드와 git에 넣지 않습니다.
- 한국어 문구는 [카피 가이드](docs/copy-guide.md)를 따릅니다: 해요체, 결과부터 말하기, "빠르게" 대신 숫자와 기간, "실험실"이라는 표현 금지. 글을 크게 고친 뒤에는 `humanize-korean` 스킬로 AI 티를 다듬는 윤문을 한 번 거칩니다 (내용은 바꾸지 않습니다).
- 관리자 코드는 `requireAdmin()`/`adminAction()`/`adminRoute()`를 먼저 호출합니다. 레이아웃을 보안 장치로 믿지 않습니다.
- 공개 페이지가 읽는 데이터는 `"use cache"` + `cacheTag`로 읽고, 바꾸는 쪽이 `updateTag`를 호출합니다.
- 임의 글자 크기 대신 아래 타입 스케일 토큰을 씁니다.
- `// reconstructed`, `TODO(content)`, `TODO(en)` 표시는 확인 전에 지우지 않습니다.

### 디자인 원칙

- **모서리 0, 테두리 2px, 그림자 없음.** 색 비율은 흰색 60 / 검정 30 / 콘크리트 8 / 포인트색 2.
- 사업부마다 포인트색 하나: Master 빨강, Dev 파랑, AI 초록, Faith 노랑 (`divisionTheme`, `lib/content.ts`).

| 토큰 | 값 | 용도 |
|---|---|---|
| `ink` / `paper` / `concrete` | #111111 / #FFFFFF / #E6E6E3 | 글자·테두리 / 배경 / 회색 면 |
| `gray` / `ink-text` | #5E5E5A / #A3A39E | 보조 글자 (흰 배경 / 어두운 배경) |
| `red` `web` `ai` `faith` | #E8322B / #2F55FF / #14C38E / #F2B21B | **면과 점에만** 사용 |
| `*-text` | #DE3029 / #2F55FF / #0C8560 / #9A6D00 | 흰 배경 위 작은 글자 (명암비 AA 4.5:1) |
| `*-text-dark` | #FF6B61 / #7D93FF / #14C38E / #F2B21B | 검정 배경 위 작은 글자 |

- 글꼴 클래스: `font-logo`(Archivo 800), `font-sans`(IBM Plex Sans KR, 기본), `font-mono`(JetBrains Mono).
- 타입 스케일(390~1440px에서 `clamp`로 변화): `text-display-xl` · `text-display` · `text-numeral-lg` · `text-numeral` · `text-h1` · `text-h2` · `text-h3` · `text-title` · `text-title-sm` · `text-lead` · `text-body` · `text-body-sm` · `text-ui` · `text-meta` · `text-micro` · `text-code`. 값은 `docs/qa-font-size.md`.
- 유틸리티: `.wrap`(가로 컨테이너), `.label`(모노, 대문자), `ko-tight`(`.label` 안 한글의 대문자 변환·자간 해제). 전역: `word-break: keep-all`, 빨간 포커스 테두리, `prefers-reduced-motion`이면 애니메이션 끔.
- 공통 UI: `components/ui.tsx`(버튼, 태그, 로고, 섹션 제목), `components/cards.tsx`(프로젝트 카드, 인사이트 행).

### 알아 둘 함정

- Tailwind의 `max-sm:` 같은 변형은 `@media not all and (min-width: …)`가 됩니다. `hidden sm:inline-flex`처럼 표시 속성을 섞으면 충돌할 수 있어 헤더 CTA는 `max-sm:hidden`을 씁니다.
- ESLint `react-hooks/set-state-in-effect`: effect 안에서 setState를 하지 마세요. 헤더는 "열린 경로를 저장하고 지금 경로와 비교하는" 패턴을 씁니다.
- 원색 포인트색(`text-ai`, `text-faith`)을 작은 글자에 쓰면 명암비가 부족합니다. 글자에는 `*-text` 토큰을 씁니다.
- `getCopy`는 서버 전용입니다. 클라이언트 컴포넌트에는 합쳐진 값을 prop으로 넘기고, 함수는 빼고 넘깁니다 (docs/admin-content.md).
