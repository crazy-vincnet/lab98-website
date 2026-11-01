import "server-only";
import { getCopy } from "@/lib/copy-store";
import { fill } from "@/lib/fill-template";
import { getContent } from "@/lib/get-content";
import type { Locale } from "@/lib/i18n";
import { getNotesCopy } from "@/components/notes/copy.en";
import { getProjectsPageCopy } from "@/components/experiments/copy.en";
import type { DivisionSlug } from "@/lib/content";

/**
 * Search/social text of every public page (registry keys `seo.*`, docs/admin-content.md).
 * Defaults stay here; the owner edits them in /admin/content. Metadata builders `await` getSeo*() so a published override
 * shows in <title>, <meta name="description">, og:* and twitter:* without a redeploy.
 * Titles/descriptions also feed the JSON-LD WebPage of each page, so the structured data stays in sync with the meta tags.
 */

export type SeoText = { title: string; description: string };
export type SeoPageKey = "home" | "about" | "projects" | "insights" | "praise-tool";

/** Code defaults of one `seo.<page>` document. Tokens: projects uses {clients} and {count}. */
export function seoPageDefaults(page: SeoPageKey, locale: Locale): SeoText {
  const { site } = getContent(locale);
  const en = locale === "en";
  switch (page) {
    case "home":
      return en
        ? {
            title: `${site.name} — Websites & Software · AI Training · Church Software`,
            description:
              "Lab98 builds custom websites, online stores and Mac/Windows software, teaches AI, and makes software for churches and mission organizations. We build from scratch and hand over the source code at launch.",
          }
        : {
            title: `${site.name} — 홈페이지·프로그램 제작 · AI 교육 · 교회 프로그램`,
            description:
              "홈페이지 제작, 쇼핑몰 제작, Mac·Windows 프로그램 개발부터 AI 교육, 교회·선교단체 프로그램까지 Lab98이 처음부터 맞춤으로 만들어요. 오픈할 때 소스 코드도 넘겨 드려요.",
          };
    case "about":
      return en
        ? {
            title: "About — Technology that helps people",
            description: `${site.name} is a company with three divisions: web and software development (Dev), AI training (AI) and software for churches (Faith). Learn what the 98 in our name means and meet our founder, ${site.founder.display}.`,
          }
        : {
            title: "회사 소개 — 사람을 돕는 기술",
            description: `${site.name}은 홈페이지·프로그램 제작(Dev), AI 교육(AI), 교회 프로그램(Faith)을 하는 회사예요. 이름에 담긴 98의 뜻과 파운더 ${site.founder.display}을 소개해요.`,
          };
    case "projects": {
      const t = getProjectsPageCopy(locale);
      return en
        ? {
            title: `${t.meta.title} — Organization website case studies`,
            description: "{count} organization websites that Lab98 Dev planned, designed and built, including {clients}, shown with their screens and key features.",
          }
        : {
            title: `${t.meta.title} — 기관 홈페이지 제작 사례`,
            description: "{clients} 등 Lab98 Dev가 기획부터 디자인, 개발까지 맡은 기관 홈페이지 제작 사례 {count}건을 화면과 주요 기능으로 소개해요.",
          };
    }
    case "insights": {
      const t = getNotesCopy(locale);
      return en
        ? {
            title: `${t.meta.title} — Company blog`,
            description:
              "Posts about how Lab98 works and the stories of our three divisions: web and software development (Dev), AI training (AI) and software for churches (Faith). Written by our founder.",
          }
        : {
            title: `${t.meta.title} — 회사 블로그`,
            description: "Lab98이 일하는 방식과 홈페이지·프로그램 제작(Dev), AI 교육(AI), 교회 프로그램(Faith) 세 사업부의 이야기를 글로 나눠요. 파운더가 직접 쓴 글을 모았어요.",
          };
    }
    case "praise-tool":
      return en
        ? {
            title: "Praise Tool — Worship Lyrics Presentation Software | Lab98",
            description:
              "Praise Tool puts lyrics, sermon slides, Bible verses and video on screen from one program. NDI broadcast output, macOS and Windows support, launching November 11, 2026, KRW 100,000 perpetual license.",
          }
        : {
            title: "Praise Tool — 찬양 가사 송출 프로그램 | Lab98",
            description:
              "예배용 찬양 가사 송출 프로그램 Praise Tool로 가사, 설교 슬라이드, 성경 구절, 영상을 한 번에 띄워요. NDI 방송 출력, macOS·Windows 지원, 2026년 11월 11일 출시, 100,000원 영구 라이선스예요.",
          };
  }
}

/** Defaults of `seo.services`: search text per service page (absolute titles: the division name already carries the brand). */
export function seoServicesDefaults(locale: Locale): Record<DivisionSlug, SeoText> {
  return locale === "en"
    ? {
        dev: {
          title: "Websites, Online Stores & Software Development | Lab98 Dev",
          description:
            "Custom company websites, online stores and Mac/Windows software, built without templates. Projects start at KRW 2M, and we hand over the source code at launch.",
        },
        ai: {
          title: "AI Training for Schools & Companies | Lab98 AI",
          description:
            "Online and in-person AI training, with courses tailored to schools and companies. Hands-on sessions that show you how to use AI in work and class right away; an AI community is on the way.",
        },
        faith: {
          title: "Software for Churches & Mission Organizations | Lab98 Faith",
          description:
            "We build, ship and operate software for churches and mission organizations. Our first product is Praise Tool, lyrics presentation software for worship, and we also build custom ministry software.",
        },
      }
    : {
        dev: {
          title: "홈페이지·쇼핑몰·프로그램 제작 | Lab98 Dev",
          description:
            "회사 홈페이지 제작, 쇼핑몰 제작, Mac·Windows 프로그램 개발을 템플릿 없이 맞춤으로 해요. 200만 원부터 시작하고, 오픈할 때 소스 코드까지 넘겨 드려요.",
        },
        ai: {
          title: "AI 교육 · 학교·기업 AI 강의 | Lab98 AI",
          description:
            "온라인·오프라인 AI 교육과 학교·기업 맞춤 AI 강의를 진행해요. 실습 중심으로 AI를 업무와 수업에 바로 쓰는 법을 알려 드리고, AI 커뮤니티도 열 예정이에요.",
        },
        faith: {
          title: "교회·선교단체 프로그램 제작 | Lab98 Faith",
          description:
            "교회와 선교단체에 필요한 프로그램을 만들고 배포하고 운영해요. 첫 제품은 찬양 가사 송출 프로그램 Praise Tool이고, 사역에 맞춘 교회 프로그램 제작도 맡아요.",
        },
      };
}

/** Defaults of `seo.root`: site-wide <title> fallback and search keywords (<meta name="keywords">). Order matters (positional paths): append, don't reorder. */
export function seoRootDefaults(locale: Locale) {
  const { site } = getContent(locale);
  return locale === "en"
    ? {
        titleDefault: `${site.name} — Websites & Software · AI Training · Church Software`,
        keywords: [
          "Lab98",
          "JJdream",
          "website development Korea",
          "custom website development",
          "web design Korea",
          "online store development",
          "responsive website",
          "Mac software development",
          "Windows software development",
          "AI training",
          "corporate AI training",
          "AI community",
          "church software",
          "church website",
          "mission organization website",
          "worship lyrics software",
          "Praise Tool",
        ],
      }
    : {
        titleDefault: `${site.name} — 웹·프로그램 제작 · AI 교육 · 교회 프로그램`,
        keywords: [
          "Lab98",
          "랩98",
          "홈페이지 제작",
          "웹사이트 제작",
          "쇼핑몰 제작",
          "반응형 웹사이트",
          "프로그램 개발",
          "Mac 프로그램",
          "Windows 프로그램",
          "AI 교육",
          "기업 AI 교육",
          "AI 커뮤니티",
          "교회 프로그램",
          "선교단체 웹사이트",
          "찬양 가사 송출",
          "Praise Tool",
          "website development",
          "web design Korea",
          "AI training",
          "church software",
        ],
      };
}

/** Defaults of `seo.og`: text printed on the social-share (Open Graph / X) cards. Korean cards exist per page; English pages share one card. */
export function seoOgDefaults(locale: Locale) {
  return locale === "en"
    ? { home: { subtitle: "Dev · AI · Faith" } }
    : {
        about: { subtitle: "Dev · AI · Faith — {slogan}" },
        projects: { title: "Lab98 Dev가 만든 사이트", subtitle: "기획 · 디자인 · 개발" },
        insights: { title: "Lab98이 일하며 생각하고 배운 것", subtitle: "웹·프로그램 · AI 교육 · 사역 도구" },
        praiseTool: { subtitle: "예배를 위한 가사·미디어 송출 프로그램", launch: "{date} 출시 · 10만 원 영구 라이선스" },
      };
}

/** Defaults accessor shared with the registry. */
export const SEO_PAGE_KEYS: SeoPageKey[] = ["home", "about", "projects", "insights", "praise-tool"];

const projectTokens = (locale: Locale) => {
  const { projects } = getContent(locale);
  return { clients: projects.slice(0, 3).map((p) => p.client).join(", "), count: projects.length };
};

/** Merged (override-aware) title/description of a page; tokens already filled. */
export async function getSeoPage(page: SeoPageKey, locale: Locale): Promise<SeoText> {
  const t = await getCopy(`seo.${page}`, locale, seoPageDefaults(page, locale));
  return page === "projects" ? { title: fill(t.title, projectTokens(locale)), description: fill(t.description, projectTokens(locale)) } : t;
}

export async function getSeoService(locale: Locale, slug: DivisionSlug): Promise<SeoText> {
  const all = await getCopy("seo.services", locale, seoServicesDefaults(locale));
  return all[slug];
}

export const getSeoRoot = (locale: Locale) => getCopy("seo.root", locale, seoRootDefaults(locale));
export const getSeoOgKo = () => getCopy("seo.og", "ko", seoOgDefaults("ko") as Extract<ReturnType<typeof seoOgDefaults>, { about: unknown }>);
export const getSeoOgEn = () => getCopy("seo.og", "en", seoOgDefaults("en") as Extract<ReturnType<typeof seoOgDefaults>, { home: unknown }>);

/** Service slugs that have search text (order of the editor and the preview). */
export const DIVISION_SLUGS_FOR_SEO: DivisionSlug[] = ["dev", "ai", "faith"];
