# Lab98 웹사이트 기능 기획서 (Feature Plan)

> 작성일 2026-10-31 · 대상: 대표/의사결정자 · 읽는 시간 약 10분
> 기준 스택: Next.js 16.4.3 (App Router, `cacheComponents: true`), React 19.3, Tailwind v4, Vercel 배포 예정
> API 이름은 프로젝트에 번들된 문서(`node_modules/next/dist/docs/`) 기준으로 확인했습니다.

> **상태 (2026-11-02): 이 문서는 초기 기획 기록입니다.** 문의 폼, 개인정보처리방침, sitemap/robots/OG/manifest/JSON-LD, 영어 버전, 관리자, 출시 알림이 구현됐고, 배포는 Vercel이 아니라 InsForge 호스팅입니다. 아래 표와 체크리스트는 당시 기준이며, 현재 상태와 남은 일은 [README](../README.md)를 보세요.

## 0. 현재 상태 요약

| 항목 | 현재 | 런칭 시 필요 |
|---|---|---|
| 페이지 | 홈, `/about`, `/divisions/[slug]`, `/experiments`(→`/projects`), `/notes`(→`/insights`) | + 개인정보처리방침, 404/에러 |
| 문의 | `mailto:` 링크, 공개 주소가 개인 Gmail | 서버 저장/발송되는 폼 + 동의 체크박스 |
| 메타데이터 | 루트 `layout.tsx`에 `metadataBase`, title template, OG 기본값만 있음 | 페이지별 metadata, OG 이미지, sitemap/robots, JSON-LD |
| 아이콘 | `app/icon.png`, `app/apple-icon.png` 있음 | `manifest.ts`, `favicon.ico` |
| 콘텐츠 | `src/lib/content.ts` 하드코딩, 전부 예시 문구 | 실제 프로젝트/인사이트/사업자 정보 |
| 분석·배포·저장소 | 없음 | Vercel + GitHub + 분석 도구 |
| 푸터 | 소셜 링크 `#`, `© 2026 Lab98`만 있음 | 사업자 정보, 개인정보처리방침 링크 |

---

## 1. 런칭 전 필수 (P0)

노력도: **S** = 반나절 이하, **M** = 1~2일, **L** = 3일 이상

### P0-1. 문의 폼 백엔드 — 노력도 M

**왜:** 이 사이트의 비즈니스 목표는 리드 확보입니다. `mailto:`는 모바일이나 메일 앱이 없는 PC에서 자주 실패하고, 실패해도 기록이 남지 않습니다. 개인 Gmail 주소가 그대로 노출돼 스팸 표적이 되기도 합니다.

**선택지 비교**

| | A. Server Action + Resend | B. Formspree / Tally | C. Google Sheets (서비스 계정) |
|---|---|---|---|
| 구현 | `'use server'` 함수에서 검증 후 Resend API로 메일 발송 | 폼 `action`을 외부 엔드포인트로 보내거나 Tally를 iframe으로 삽입 | Server Action에서 Sheets API로 행 추가 |
| 디자인 통제 | 완전 (브랜드 UI 그대로) | Formspree는 양호, Tally는 iframe이라 낮음 | 완전 |
| 알림 | 즉시 메일 | 즉시 메일 | 따로 구현해야 함 (Apps Script 등) |
| 비용 | 무료 구간으로 충분 | 무료 구간에 월 제출 수 제한, 브랜딩 제거는 유료 | 무료 |
| 개인정보 | 처리위탁: Resend(미국) | 처리위탁: Formspree/Tally(해외) | 처리위탁: Google(해외) |
| 리스크 | 도메인 DNS 인증(SPF/DKIM) 필요 | 외부 서비스 종속, 데이터 이전이 번거로움 | 서비스 계정 키 관리, 쿼터 |

**추천: A. Server Action + Resend.** 이 스택의 기본 패턴이라 디자인을 해치지 않고, 외부 폼 서비스보다 처리위탁 대상이 하나 적습니다. 리드 목록이 필요해지면 P1에서 Google Sheets나 Notion에 사본을 쌓는 기능을 추가합니다.

**구현 방법 (Next 16 기준, `docs/01-app/02-guides/forms.md`)**
- `src/app/actions/contact.ts`에 `'use server'` 함수 `submitContact(prevState, formData)`를 둡니다.
- 폼 컴포넌트(`'use client'`)에서 `useActionState(submitContact, initialState)`를 사용합니다. `pending`으로 버튼을 비활성화하고, `state.errors`로 필드별 오류를 표시합니다. 폼은 JS 없이도 제출됩니다(progressive enhancement).
- 서버에서 검증합니다. 이름, 이메일 형식, 메시지 길이(예: 10~3000자), 사업부 선택(web/ai/faith/기타), 동의 체크 여부를 확인합니다. 스키마 검증은 `zod` 추가를 권장합니다.
- 스팸 방지는 여러 겹으로 둡니다.
  1. **Honeypot**: 화면에 보이지 않는 `website` 필드를 둡니다. 값이 채워져 있으면 성공한 것처럼 응답하고 버립니다.
  2. **최소 작성 시간**: 렌더링 시각을 hidden 필드로 받아, 3초 안에 제출되면 차단합니다.
  3. **Cloudflare Turnstile**: 무료이고 대부분 보이지 않는 CAPTCHA입니다. 서버에서 `siteverify`로 토큰을 검증합니다.
  4. **Rate limit**: 우선 Vercel Firewall의 Rate Limiting 규칙으로 문의 경로를 제한합니다. 코드로 제한하려면 `@upstash/ratelimit`을 쓰고, IP는 `headers()`의 `x-forwarded-for`에서 읽습니다.
- 발송 메일은 두 통입니다. ① 담당자에게 리드 알림을 보내며 `replyTo`를 문의자 이메일로 지정합니다. ② 문의자에게 접수 확인 메일을 보냅니다(선택이지만 권장, `site.replyTime` 문구를 재사용).
- **환경 변수(Vercel Project Settings → Environment Variables, Preview와 Production 분리)**
  - `RESEND_API_KEY` (secret)
  - `CONTACT_TO_EMAIL`: 리드를 받을 주소. 결정 필요
  - `CONTACT_FROM_EMAIL`: 예 `Lab98 <hello@lab98.io>`. lab98.io 도메인 인증이 필요합니다
  - `TURNSTILE_SECRET_KEY` (secret), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - (선택) `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Preview 환경의 `CONTACT_TO_EMAIL`은 테스트 주소로 지정해, 실제 담당자에게 테스트 메일이 가지 않게 합니다.

**완료 기준**
- [ ] JS를 끈 상태와 켠 상태 모두에서 제출하면 담당자 메일함에 1분 안에 도착한다.
- [ ] 잘못된 입력은 필드 옆에 한국어 오류 메시지로 표시되고, 입력한 내용은 지워지지 않는다.
- [ ] honeypot이 채워졌거나 Turnstile 검증에 실패하면 메일이 발송되지 않는다.
- [ ] 같은 IP에서 짧은 시간에 반복 제출하면 차단된다.
- [ ] 페이지 소스에 개인 이메일 주소가 노출되지 않는다(`mailto:`는 보조 수단으로만 남기거나 제거).
- [ ] 비밀값이 클라이언트 번들에 포함되지 않는다(`NEXT_PUBLIC_` 접두사는 site key에만 사용).

### P0-2. 개인정보 관련 법적 요건 — 노력도 M (문안 작성 포함)

**왜:** 문의 폼으로 이름, 이메일, 연락처를 받는 순간 Lab98은 「개인정보 보호법」상 개인정보처리자가 됩니다. 처리방침을 공개하지 않거나 동의 절차를 갖추지 않으면 과태료 대상입니다.

| 요건 | 적용 여부 | 구현 |
|---|---|---|
| **개인정보처리방침** 페이지 (개인정보 보호법 제30조) | **필수** | `src/app/privacy/page.tsx` 생성, 푸터에 **굵게** 링크. 수집 항목, 목적, 보유기간, 파기 절차, 처리위탁(Vercel, Resend, Cloudflare), **국외 이전**(미국: 이전받는 자, 국가, 항목, 시기, 방법), 정보주체 권리 행사 방법, 개인정보 보호책임자(성명/연락처), 쿠키 등 자동수집장치 운영 여부, 시행일과 변경 이력 |
| **수집·이용 동의 체크박스** (제15조, 제22조) | **필수** | 폼 하단에 기본 해제된 체크박스를 두고 4가지를 고지합니다: ① 수집 항목 ② 목적(문의 응대) ③ 보유기간(예: 문의 처리 후 1년) ④ 동의를 거부할 권리와 거부 시 불이익(문의 불가). 서버에서도 체크 여부를 검증합니다 |
| 국외 이전 고지 (제28조의8) | **필수** (Vercel·Resend가 해외 사업자) | 처리방침에 명시합니다. 동의 문구에도 한 줄 넣는 것을 권장합니다 |
| 마케팅/뉴스레터 수신 동의 (정보통신망법 제50조) | 뉴스레터 도입 시 필수 | 문의 동의와 **별도** 체크박스로 받습니다(P1) |
| **사업자 정보 푸터** — 상호, 대표자, 사업자등록번호, 주소, 전화/이메일 | 통신판매(온라인 결제·주문)가 있으면 **필수**(전자상거래법 제10조). 없더라도 신뢰도 측면에서 **강력 권장** | `site.business` 객체를 `content.ts`에 추가하고 `SiteFooter`에서 렌더링합니다 |
| **통신판매업 신고번호** | **조건부**: 사이트에서 결제나 주문을 받거나 Faith 디지털 콘텐츠를 온라인 판매할 때만 필요. 견적 문의 후 계약하는 B2B 용역만 한다면 일반적으로 불필요 | 신고했다면 푸터에 신고번호와 "사업자정보확인" 링크(공정위)를 표시합니다 |
| 만 14세 미만 | 해당 없음(대상 아님) | 처리방침에 "만 14세 미만의 개인정보는 수집하지 않습니다"라고 명시합니다 |
| 이용약관 | 런칭 시 불필요 | 회원가입이나 결제가 생길 때 작성합니다 |

**완료 기준**
- [ ] `/privacy` 페이지가 공개되어 있고, 모든 페이지 푸터에서 링크된다.
- [ ] 동의 체크 없이는 제출되지 않는다(클라이언트와 서버 모두에서 검증).
- [ ] 처리방침의 처리위탁·국외이전 목록이 실제로 쓰는 서비스(호스팅, 메일, 캡차, 분석)와 일치한다.
- [ ] 푸터에 사업자 정보가 표시된다(값은 클라이언트 확인).

> 처리방침 초안은 개인정보보호위원회의 「개인정보 처리방침 작성지침」과 표준 양식을 기준으로 작성하고, 런칭 전에 대표가 직접 검토합니다. 법률 자문을 대체하지 않습니다.

### P0-3. SEO 기본기 — 노력도 M

**왜:** 한국 B2B 고객은 네이버와 구글에서 업체를 검색해 찾습니다. 카카오톡이나 슬랙으로 공유될 때 미리보기 카드가 브랜드 첫인상이 됩니다.

**구현 (`docs/01-app/01-getting-started/14-metadata-and-og-images.md`, `03-file-conventions/01-metadata/*`)**
- **페이지별 metadata**
  - 정적 페이지는 `export const metadata`를 사용합니다.
  - `[slug]`, `[code]` 같은 동적 경로는 `generateMetadata({ params })`를 사용합니다.
  - 모든 페이지에 `alternates: { canonical: '/projects/...' }`를 지정합니다(루트에 `metadataBase`가 있으므로 상대경로 가능).
  - ⚠️ metadata는 **얕은 병합(shallow merge)**입니다. 하위 페이지에서 `openGraph`를 지정하면 루트의 `siteName`, `locale`이 사라집니다. 공통값은 `src/lib/seo.ts` 헬퍼에서 합쳐 반환합니다.
  - `cacheComponents` 환경에서 `generateMetadata`가 `params`에 접근하면 요청 시점으로 미뤄집니다. `generateStaticParams`로 slug를 미리 생성해 정적으로 유지합니다.
- **`src/app/sitemap.ts`**: `MetadataRoute.Sitemap`을 반환합니다. 정적 경로와 `divisions`, `projects`, `insights`를 포함하고, `lastModified`에는 콘텐츠 날짜를 넣습니다.
- **`src/app/robots.ts`**: 전체 허용, `sitemap: 'https://lab98.io/sitemap.xml'`. Preview 배포는 `VERCEL_ENV !== 'production'`일 때 `disallow: '/'`로 막습니다(Vercel이 preview에 `X-Robots-Tag: noindex`를 붙이지만 이중으로 막습니다).
- **OG 이미지**
  - `src/app/opengraph-image.tsx`(기본)와 `projects/[slug]/opengraph-image.tsx`, `insights/[slug]/opengraph-image.tsx`, `divisions/[slug]/opengraph-image.tsx`를 만듭니다.
  - `ImageResponse`(`next/og`)로 1200×630 이미지를 생성합니다. 사업부 색상, 심볼(`public/brand/symbol/*`), 제목을 넣고 `alt`, `size`, `contentType`를 export합니다.
  - ⚠️ 한글 폰트가 필요합니다. `ImageResponse`는 woff2를 지원하지 않으므로 IBM Plex Sans KR **TTF/OTF 서브셋** 파일을 `src/assets/fonts/`에 두고 `readFile`로 읽습니다. 서브셋으로 용량을 줄이세요(이미지 함수 번들 크기 제한).
- **JSON-LD** (`docs/01-app/02-guides/json-ld.md`)
  - 루트 레이아웃에 `Organization`(name, url, logo, email, sameAs=SNS)과 `WebSite`를 넣습니다.
  - 인사이트 글에는 `Article`(BlogPosting)을 넣습니다.
  - `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />` 형태로 XSS를 방지합니다.
- **URL 변경 리다이렉트**: `next.config.ts`의 `redirects()`에 `/experiments/:path*` → `/projects/:path*`, `/notes/:path*` → `/insights/:path*`를 `permanent: true`로 추가합니다.
- **검색엔진 등록**: Google Search Console과 **네이버 서치어드바이저**에 사이트를 등록합니다. 소유확인 메타는 `metadata.verification`(`google`, `other: { 'naver-site-verification': '...' }`)에 넣고 sitemap을 제출합니다.

**완료 기준**
- [ ] 모든 페이지의 `<title>`, description, canonical이 고유하다.
- [ ] `/sitemap.xml`과 `/robots.txt`가 production에서 응답한다.
- [ ] 카카오톡 공유 디버거와 Facebook Sharing Debugger에서 페이지별 OG 이미지에 한글이 정상 표시된다.
- [ ] Google Rich Results Test에서 Organization이 인식된다.
- [ ] 예전 `/experiments/...` URL이 308로 새 경로에 연결된다.

### P0-4. 404 / 에러 페이지 — 노력도 S

- `src/app/not-found.tsx`: 브랜드 톤 문구("이 실험은 아직 없어요" 류)와 홈·프로젝트·문의 링크를 둡니다. 동적 라우트에서 데이터가 없으면 `notFound()`를 호출합니다(이미 쓰고 있는지 확인).
- `src/app/error.tsx` (`'use client'`): props로 `{ error, retry }`를 받습니다. Next 16에서는 `reset`보다 **`retry()`**가 권장입니다. 다시 시도 버튼과 문의 링크를 둡니다.
- `src/app/global-error.tsx`: 루트 레이아웃 오류용입니다. `<html><body>`를 직접 렌더링합니다.
- 완료 기준: [ ] 없는 URL에서 404 상태 코드와 브랜드 404가 표시된다. [ ] 강제로 오류를 낸 테스트 페이지에서 error UI가 보이고 `retry`가 동작한다.

### P0-5. 분석(Analytics) — 노력도 S

| 옵션 | 쿠키 | 장점 | 단점 |
|---|---|---|---|
| **Vercel Web Analytics** + Speed Insights | 없음 | `@vercel/analytics`의 `<Analytics />` 한 줄, Core Web Vitals 포함 | 무료 구간 이벤트 수 제한, 세부 퍼널은 약함 |
| Plausible / Umami | 없음 | 개인정보 친화적, 커스텀 이벤트 | 유료(Plausible)이거나 자체 호스팅(Umami) |
| GA4 (+ 네이버 애널리틱스) | 있음 | 무료, 광고 연동, 국내 마케터에게 익숙함 | 처리방침에 쿠키와 국외 이전을 고지해야 함. EU 방문자를 고려하면 배너 필요 |

**추천: Vercel Web Analytics + Speed Insights** (쿠키가 없어 동의 배너가 필요 없고, 처리방침에는 "쿠키를 사용하지 않는 방문 통계"로 한 줄 고지). 광고를 집행하게 되면 GA4를 추가하고 그때 처리방침과 배너를 갱신합니다.
- 핵심 전환 이벤트는 `track('contact_submit', { division })` 하나로 시작하고, `track('cta_click')`을 보조로 둡니다.
- 완료 기준: [ ] production에서만 수집된다. [ ] 문의 성공 이벤트가 대시보드에 찍힌다.

### P0-6. 접근성 기본선 — 노력도 S~M

**왜:** 「장애인차별금지법」은 법인 웹사이트에도 접근성 제공 의무를 둡니다. 한국형 웹 콘텐츠 접근성 지침(KWCAG 2.2)은 WCAG 2.1 AA 수준을 따릅니다. 이미 "본문으로 건너뛰기"와 `lang="ko"`는 있습니다.
- 모든 폼 필드에 `<label>`을 연결하고, 오류는 `aria-describedby`와 `aria-live="polite"`로 안내합니다. 필수 항목을 텍스트로 표시합니다.
- 색 대비 4.5:1 이상을 지킵니다(이미 사업부 색에 `text`/`textDark` 분리 토큰이 있음. 빨강·사업부 색 위의 작은 글씨를 점검).
- 키보드만으로 메뉴, 폼, Turnstile을 끝까지 쓸 수 있어야 합니다. `:focus-visible` 스타일이 보여야 합니다.
- 의미 있는 이미지에는 `alt`를, 장식 이미지에는 `alt=""`를 줍니다. 제목 계층(h1 → h2)을 지킵니다.
- 애니메이션에는 `prefers-reduced-motion`을 적용합니다.
- 완료 기준: [ ] Lighthouse Accessibility 95점 이상(주요 5개 페이지). [ ] axe DevTools에서 critical 0건. [ ] 키보드로 문의 제출까지 완료할 수 있다.

### P0-7. 성능 예산 — 노력도 S

| 지표 (모바일, 4G 기준) | 목표 |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| 페이지당 첫 로드 JS | < 150KB (gzip) |
| 폰트 | 현재 6개 파일 import. **IBM Plex Sans KR은 한글 글리프가 커서** 실제로 쓰는 weight만 남기고, unicode-range 분할이 되는 fontsource CSS인지 확인 |
| 이미지 | `next/image` 사용, 히어로 이미지만 `preload`/`priority` |

- 홈, 프로젝트 상세, 인사이트 상세를 Lighthouse CI나 Vercel Speed Insights로 측정합니다.
- `cacheComponents`가 켜져 있으므로 정적인 셸을 최대한 유지하고, 동적 데이터 경계에만 `<Suspense>`를 둡니다.
- 완료 기준: [ ] 위 페이지에서 Lighthouse Performance 90점 이상. [ ] Speed Insights에서 CWV 3개 지표가 모두 Good.

### P0-8. 파비콘 / 매니페스트 — 노력도 S

- 이미 `app/icon.png`와 `app/apple-icon.png`가 있습니다. `app/favicon.ico`(32/16)를 추가하고, 다크 탭에서도 보이는지 확인합니다.
- `src/app/manifest.ts` (`MetadataRoute.Manifest`): name, short_name, `theme_color`(브랜드 레드 또는 ink), `background_color`, 아이콘 192/512를 넣습니다.
- `export const viewport = { themeColor: ... }`는 `layout.tsx`에 둡니다.
- 완료 기준: [ ] Chrome DevTools의 Application → Manifest에서 오류가 없다.

### P0-9. GitHub 저장소 + Vercel 배포 + 도메인 — 노력도 S~M

- **GitHub**
  - 비공개 저장소 `lab98/lab98-web`(조직 계정 권장)을 만듭니다.
  - 기본 브랜치 `main`을 보호하고(PR 필수, 빌드 체크 통과 필수), `.env*`가 `.gitignore`에 들어 있는지 확인합니다.
  - GitHub Actions에서 `npm ci && npm run lint && npm run build`를 실행합니다(타입 체크 포함).
- **Vercel**
  - GitHub와 연동합니다. `main`은 Production, PR마다 **Preview 배포 URL**이 생성됩니다(클라이언트 검토용).
  - 환경 변수를 Production과 Preview로 분리합니다. Preview에는 Deployment Protection(Vercel 인증)을 켭니다.
  - 리전은 함수 리전을 `icn1`(서울)로 지정합니다.
- **도메인 `lab98.io`**
  - Vercel에 `lab98.io`(primary)와 `www.lab98.io`(→ apex로 리다이렉트)를 연결합니다.
  - DNS는 등록 기관에서 A/CNAME을 설정하거나 네임서버를 Vercel로 위임합니다.
  - 같은 DNS에 **Resend용 SPF, DKIM, DMARC**와 **메일 수신용 MX**(예: Google Workspace의 `hello@lab98.io`)를 함께 설정합니다.
- 완료 기준: [ ] `https://lab98.io`가 HTTPS로 열리고 www가 리다이렉트된다. [ ] PR을 열면 Preview URL이 댓글로 달린다. [ ] 메일 테스트 도구(mail-tester 등)에서 SPF/DKIM이 통과한다.

### P0-10. 실제 콘텐츠로 교체 — 노력도 M (클라이언트 의존)

- `content.ts` 상단에 적힌 대로 모든 내용이 **예시 문구**입니다. 가짜 실험이나 가짜 수치가 공개되면 신뢰 리스크가 있으므로, 실제 프로젝트가 3개 미만이면 "준비 중" 상태로 런칭합니다.
- `/experiments` → `/projects`, `/notes` → `/insights` 이름 변경과 `nav` 라벨 정리(다른 에이전트 작업)가 완료되어야 합니다.
- 소셜 링크 `href: "#"`가 남아 있으면 숨깁니다.
- 완료 기준: [ ] `grep -r "TODO(content)" src`의 결과가 0건이다.

---

## 2. 런칭 직후 (P1, 2~4주차)

### P1-1. 콘텐츠 관리 방식 (CMS)

| | MDX/Markdown in repo | Sanity (headless CMS) | Notion-as-CMS |
|---|---|---|---|
| 편집 경험 | GitHub 웹 에디터나 VS Code. 비개발자에게는 진입장벽 | 실시간 미리보기, 이미지 업로드, 한국어 OK. 가장 좋음 | 팀이 이미 Notion을 쓰면 가장 익숙함 |
| 구현 | `@next/mdx` + `mdx-components.tsx`(필수). frontmatter는 zod로 검증 | `next-sanity`, webhook에서 `revalidateTag`로 갱신. `'use cache'` + `cacheTag`와 잘 맞음 | Notion API. **이미지 URL이 약 1시간 만에 만료**되므로 별도 저장 필요, rate limit 있음 |
| 비용 | 0원 | 소규모는 무료 구간 | 0원 |
| 검토 흐름 | PR마다 Vercel Preview → 머지하면 공개 (변경 이력과 롤백이 자동) | Draft Mode(`draftMode()`)로 미리보기 | 상태 속성으로 공개 관리 |
| 리스크 | 비개발자 단독 발행 어려움 | 스키마 설계 1~2일, 벤더 종속 | 비공식 CMS라 깨지기 쉬움 |

**추천: MDX in repo (`content/projects/*.mdx`, `content/insights/*.mdx`).**
- 팀이 아주 작고, 현재 콘텐츠가 10건 미만이며, 이미 `content.ts`의 타입이 있어 이전 비용이 가장 낮습니다.
- AI 도구나 개발자가 PR로 올리고 대표가 Preview에서 확인 후 머지하는 흐름이 "We test, we ship"과도 맞습니다.
- Turbopack에서는 remark/rehype 플러그인을 **문자열 이름**으로만 지정할 수 있습니다(함수 옵션 불가).
- 각 상세 페이지는 `generateStaticParams`로 정적으로 생성합니다.
- **전환 조건**: 비개발자가 주 1회 이상 직접 발행해야 하면 Sanity로 이전합니다(frontmatter 필드를 그대로 스키마로 옮기면 됩니다).

### P1-2. 프로젝트 케이스 스터디 템플릿

클라이언트 작업용 frontmatter 필드입니다(`Project` 타입 확장).

| 필드 | 예시 | 필수 |
|---|---|---|
| `title`, `slug`, `division` | "교회 수련회 신청 페이지", `faith` | ✓ |
| `kind` | `client` / `in-house` | ✓ |
| `clientType` | 스타트업 · 중소기업 · 교회/비영리 · 개인 | ✓ |
| `clientName` | 공개 동의 시에만. 없으면 "A 교육 스타트업" | |
| `industry` | 교육, 커머스, 종교 등 | ✓ |
| `scope` | 기획 · 디자인 · 개발 · 자동화 | ✓ |
| `deliverables` | 랜딩 1p, 신청 폼, 관리자 시트 | ✓ |
| `duration` / `period` | "7일" / 2026-09 | ✓ |
| `stack` | Next.js, Claude API 등 | |
| `problem` → `approach` → `result` (본문 3단 구성) | | ✓ |
| `metrics[]` | `{ label: "신청 전환율", before: "2.1%", after: "5.8%" }` | 권장 |
| `testimonial` | `{ quote, name, role }` (공개 동의 필수) | |
| `cover`, `gallery[]` | 이미지 + alt | ✓ cover |
| `status` | live / running / archived (현재 구조 유지) | ✓ |
| `relatedInsight` | 연결된 글 slug | |

### P1-3. 기타 P1

| 기능 | 내용 | 노력도 |
|---|---|---|
| **문의 리드 아카이브** | Server Action에서 메일 발송과 함께 Google Sheets(또는 Notion DB)에 행을 추가해 간이 CRM으로 씁니다. 보유기간이 지나면 파기합니다 | S |
| **채용 `/careers`** | 열린 포지션 MDX 목록. 없으면 "상시 인재풀" 폼 하나만 둡니다(이력서 수집 시 처리방침에 항목 추가) | S |
| **뉴스레터 구독** | Stibee(국내, 한국어 UI) 또는 Resend Audiences. **광고성 정보 수신 동의 별도 체크**, 야간(21~08시) 발송 시 별도 동의, 제목에 "(광고)" 표기 규정 확인 | S~M |
| **SNS 연동** | 우선 푸터와 Organization `sameAs`에 링크만 겁니다. YouTube는 상세 페이지에 `youtube-nocookie.com` iframe을 lazy load로 넣습니다. 인스타 피드 임베드는 성능 비용이 커서 비추천 | S |
| **RSS** | `src/app/insights/feed.xml/route.ts` Route Handler로 RSS 2.0을 생성하고, `metadata.alternates.types['application/rss+xml']`에 연결합니다 | S |
| **인사이트 검색/필터** | 글이 20개 미만이면 사업부 태그 필터(`?division=ai`)만 둡니다. 그 이상이면 빌드 시 인덱스를 만들어 클라이언트에서 Fuse.js로 검색합니다 | S → M |
| **다크 모드** | 브랜드에 Light/Dark가 모두 있지만, 런칭은 **Light 단일**을 권장합니다. 푸터는 이미 ink 배경입니다. 도입할 때는 Tailwind v4 `@custom-variant dark`와 `data-theme` 속성, 쿠키 없이 `prefers-color-scheme`을 기본값으로 둡니다. `global-not-found` 등 레이아웃 밖 페이지의 테마 적용에 주의합니다 | M |
| **영어 버전(i18n)** | **결정 필요.** 해외 고객 계획이 없으면 하지 않습니다. 필요하면 `app/[lang]/` 구조 + `proxy.ts`(구 middleware)로 언어를 감지하고, `alternates.languages`(hreflang)를 지정합니다. 초기에는 `/en` 소개 한 페이지만 두는 축소안도 가능합니다 | L (전체) / S (1페이지) |

---

## 3. 나중에 (P2) — 사업부별 핵심 아이디어

| # | 사업부 | 아이디어 | 가치 |
|---|---|---|---|
| 1 | Web | **패키지/가격 페이지** (랜딩 7일 · 브랜드 사이트 · 전환 실험, "부터" 가격) | 문의 품질 향상, 상담 시간 절약 |
| 2 | Web | **프로젝트 문의 위저드** (사업부 → 목적 → 예산대 → 일정 3~4단계). 같은 Server Action으로 처리 | 리드 자격 판별(qualifying) |
| 3 | AI | **라이브 데모 페이지** (예: 회의록 요약기). Route Handler + LLM API, 하루 사용량 제한, 입력 데이터 미저장 고지 | 역량을 직접 체감하게 함 |
| 4 | AI | **자동화 ROI 계산기** (반복 업무 시간 × 인원 → 절감 시간/비용) | 영업 도구, 공유되기 쉬움 |
| 5 | Faith | **공동체 템플릿 갤러리** (수련회 신청, 교회 소개, 묵상 챌린지 페이지 샘플과 미리보기) | 반복 수주로 연결되는 상품화 |
| 6 | Faith | **묵상 콘텐츠 아카이브 / 30일 챌린지 등록** (이메일·카카오 알림톡) | 커뮤니티 유입, 브랜드 신뢰 |
| 7 | 공통 | **실험 대시보드** (진행 중인 실험의 주간 지표 공개) | "We test, we ship" 브랜드를 증명 |
| 8 | 공통 | **고객 후기·로고 월** (동의받은 것만) | 전환율 향상 |

---

## 4. 클라이언트 결정 체크리스트

**런칭 차단 항목 (이번 주 안에 필요)**
- [ ] **사업자 정보**: 상호(법인/개인), 대표자명, 사업자등록번호, 사업장 주소, 대표 전화(공개 여부)
- [ ] **통신판매업 신고 여부**: 사이트에서 결제나 판매를 할 계획이 있는지. 있다면 신고번호
- [ ] **리드를 받을 이메일** (`CONTACT_TO_EMAIL`) 및 **공개 연락 이메일**. 현재 개인 Gmail이 노출되어 있으므로 `hello@lab98.io` 생성을 권장 → 메일 서비스(Google Workspace 등) 선택
- [ ] **개인정보 보호책임자** 성명·연락처, 문의 데이터 **보유기간**(권장: 처리 완료 후 1년)
- [ ] **lab98.io 도메인 소유 확인** 및 DNS 관리 권한(등록 기관 계정)
- [ ] **GitHub 조직/계정**과 **Vercel 팀** 소유자(결제 주체)
- [ ] **공개 가능한 실제 프로젝트** 목록과 각 클라이언트의 이름·로고·수치·후기 공개 동의
- [ ] 예시 문구(실험, 노트, 팀 소개)를 실제 내용으로 바꿀 담당자와 마감일
- [ ] **SNS 계정**: Instagram, YouTube 핸들(없으면 링크 숨김)
- [ ] 문의 폼 필드: 이름, 이메일, (전화?), (회사/공동체명?), 사업부, (예산대?), 메시지. **필드가 적을수록 전환율이 높습니다**

**P1 결정 항목**
- [ ] **가격 공개 여부** (공개 / "부터" 가격 / 비공개)
- [ ] **영어 버전 필요 여부** (없음 / 소개 1페이지 / 전체)
- [ ] 콘텐츠를 **누가, 얼마나 자주** 발행하는지 (→ MDX 유지 또는 Sanity 전환 판단)
- [ ] 뉴스레터 운영 여부와 발송 주기
- [ ] 채용 계획 여부
- [ ] 광고 집행 계획 여부 (→ GA4/픽셀 도입과 쿠키 고지 범위)
- [ ] 다크 모드 필요 여부

---

## 5. 로드맵

| 기간 | 작업 | 산출물 |
|---|---|---|
| **1주차 (런칭)** | GitHub 저장소·Vercel·도메인·DNS(메일 포함) 설정 → 문의 폼(Server Action + Resend + Turnstile + honeypot) → 동의 체크박스·`/privacy`·사업자 푸터 → 페이지별 metadata·`sitemap.ts`·`robots.ts`·`opengraph-image.tsx`·JSON-LD·redirects → `not-found`/`error`/`global-error` → `manifest.ts`·favicon → Vercel Analytics → 접근성·성능 점검 → 실제 콘텐츠 교체 | `https://lab98.io` 공개, Search Console·네이버 서치어드바이저 등록 |
| **2~4주차** | MDX 콘텐츠 파이프라인과 케이스 스터디 템플릿 → 리드 Google Sheets 아카이브 → RSS·인사이트 필터 → SNS 링크·YouTube 임베드 → (결정 시) 뉴스레터·`/careers`·영어 1페이지 | 비개발자도 PR/Preview로 발행 가능, 첫 케이스 스터디 2~3건 |
| **나중에** | 가격·패키지 페이지, 문의 위저드, AI 데모·ROI 계산기, Faith 템플릿 갤러리·챌린지, 실험 대시보드, 다크 모드, (필요 시) Sanity 이전·전체 i18n | 사업부별 전환 도구 |
