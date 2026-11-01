/**
 * schema.org JSON-LD builders. Every page renders one `@graph` (see <JsonLd>); site-wide entities
 * (Organization, WebSite, Person) are emitted in full on the home page and referenced by `@id` elsewhere.
 * Facts come from content.ts / praise-tool.ts only — no ratings, reviews, addresses or dates we don't have.
 * Validate after deploy: https://search.google.com/test/rich-results · https://validator.schema.org/
 */
import { PRAISE_TOOL_LAUNCH, site, type DivisionInfo, type Faq, type Note, type Project } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { praiseTool } from "@/lib/praise-tool";
import { getPraiseTool } from "@/lib/praise-tool.en";
import { INSIGHTS_PATH, PRAISE_TOOL_PATH, PROJECTS_PATH, divisionHref, insightHref, projectHref } from "@/components/experiments/paths";

type Node = Record<string, unknown>;

export const LANG = "ko-KR";
const LANG_BY: Record<Locale, string> = { ko: "ko-KR", en: "en-US" };
/** Callers pass locale-less (Korean) paths from paths.ts; every builder localizes them itself. */
const lp = localePath;
export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;
/** One WebSite node per locale; Organization and Person are shared (same @id) across locales. */
const websiteId = (locale: Locale) => (locale === "ko" ? WEBSITE_ID : `${site.url}/en#website`);
export const PERSON_ID = `${site.url}/#founder`;

/** Absolute URL for a site path ("/" → "https://lab98.io/"). */
export function abs(path: string) {
  return new URL(path, site.url).toString();
}

const ref = (id: string) => ({ "@id": id });

export function graph(...nodes: (Node | false | null | undefined)[]) {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) as Node[] };
}

/* ------------------------------------------------------------ site-wide */

export function organization(locale: Locale = "ko"): Node {
  const { site } = getContent(locale);
  const en = locale === "en";
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.business.name,
    url: abs(lp(locale, "/")),
    logo: { "@type": "ImageObject", url: abs("/icon.png"), width: 512, height: 512 },
    image: abs("/brand/lockup/lab98-master-lockup.svg"),
    email: site.email,
    description: site.description,
    slogan: site.slogan,
    founder: ref(PERSON_ID),
    // 사업자등록번호 is not a tax ID in schema.org's sense (taxID = VAT/TIN), so it goes in `identifier`.
    identifier: { "@type": "PropertyValue", propertyID: en ? "Business registration number" : "사업자등록번호", value: site.business.registrationNumber },
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: site.email, availableLanguage: en ? ["ko", "en"] : ["ko"] },
    knowsAbout: en
      ? ["Website development", "Online store development", "Mac and Windows software development", "AI training", "Software for churches and mission organizations"]
      : ["홈페이지 제작", "쇼핑몰 제작", "Mac·Windows 프로그램 개발", "AI 교육", "교회·선교단체 프로그램"],
    // sameAs: add once site.social has accounts.
  };
}

export function website(locale: Locale = "ko"): Node {
  const { site } = getContent(locale);
  return {
    "@type": "WebSite",
    "@id": websiteId(locale),
    name: site.name,
    url: abs(lp(locale, "/")),
    description: site.description,
    inLanguage: LANG_BY[locale],
    publisher: ref(ORG_ID),
  };
}

export function person(locale: Locale = "ko"): Node {
  const { site } = getContent(locale);
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.founder.name,
    alternateName: site.founder.nameEn,
    jobTitle: site.founder.role,
    worksFor: ref(ORG_ID),
    url: abs(lp(locale, "/about")),
  };
}

/* ------------------------------------------------------------ page-level */

export type Crumb = { name: string; path: string };

export function breadcrumb(path: string, crumbs: Crumb[], locale: Locale = "ko"): Node {
  const all = [{ name: locale === "en" ? "Home" : "홈", path: lp(locale, "/") }, ...crumbs];
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(path)}#breadcrumb`,
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

/** WebPage (or subtype) for `path`; links to the WebSite and, when given, its breadcrumb. */
export function webPage({
  path,
  name,
  description,
  type = "WebPage",
  crumbs,
  extra,
  locale = "ko",
}: {
  path: string;
  name: string;
  description?: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage" | "ItemPage" | "FAQPage";
  crumbs?: Crumb[];
  extra?: Node;
  locale?: Locale;
}): Node {
  return {
    "@type": type,
    "@id": `${abs(path)}#webpage`,
    url: abs(path),
    name,
    ...(description && { description }),
    inLanguage: LANG_BY[locale],
    isPartOf: ref(websiteId(locale)),
    ...(crumbs && { breadcrumb: ref(`${abs(path)}#breadcrumb`) }),
    ...extra,
  };
}

/** FAQPage with exactly the Q&As shown on the page. */
export function faqPage(path: string, items: readonly Faq[], locale: Locale = "ko"): Node {
  return {
    "@type": "FAQPage",
    "@id": `${abs(path)}#faq`,
    url: abs(path),
    inLanguage: LANG_BY[locale],
    isPartOf: ref(websiteId(locale)),
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/* -------------------------------------------------------------- services */

/** Dev starts at 200만 원 (divisions.dev.facts "시작 가격"). AI/Faith have no public price. */
const DEV_MIN_PRICE_KRW = 2_000_000;

const serviceType: Record<Locale, Record<DivisionInfo["slug"], string>> = {
  ko: {
    dev: "홈페이지·쇼핑몰 제작, Mac·Windows 프로그램 개발",
    ai: "AI 교육",
    faith: "교회·선교단체 프로그램 제작",
  },
  en: {
    dev: "Website and online store development, Mac and Windows software development",
    ai: "AI training",
    faith: "Software for churches and mission organizations",
  },
};

export function service(d: DivisionInfo, locale: Locale = "ko"): Node {
  const url = abs(lp(locale, divisionHref(d.slug)));
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: d.name,
    serviceType: serviceType[locale][d.slug],
    description: d.summary,
    url,
    provider: ref(ORG_ID),
    areaServed: { "@type": "Country", name: "KR" },
    inLanguage: LANG_BY[locale],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "en" ? `${d.name} services` : `${d.name} 서비스`,
      itemListElement: d.services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.body },
      })),
    },
    ...(d.slug === "dev" && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "KRW",
        priceSpecification: { "@type": "PriceSpecification", minPrice: DEV_MIN_PRICE_KRW, priceCurrency: "KRW" },
      },
    }),
    ...(d.slug === "faith" && { isRelatedTo: ref(`${abs(lp(locale, PRAISE_TOOL_PATH))}#software`) }),
  };
}

/* ----------------------------------------------------------- Praise Tool */

/** Price shown on the page ("100,000원") as a number. */
export const PRAISE_TOOL_PRICE_KRW = Number(praiseTool.pricing.price.replace(/\D/g, ""));

export function praiseToolApp(locale: Locale = "ko"): Node {
  const praiseTool = getPraiseTool(locale);
  const url = abs(lp(locale, PRAISE_TOOL_PATH));
  return {
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: praiseTool.hero.title,
    description: praiseTool.hero.lead,
    url,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "macOS, Windows",
    inLanguage: ["ko", "en", "zh", "ja"],
    releaseDate: PRAISE_TOOL_LAUNCH,
    publisher: ref(ORG_ID),
    author: ref(ORG_ID),
    featureList: praiseTool.glance.items.map((i) => i.title),
    offers: {
      "@type": "Offer",
      url,
      price: PRAISE_TOOL_PRICE_KRW,
      priceCurrency: "KRW",
      // TODO(launch 2026-11-11): switch to https://schema.org/InStock once purchase opens.
      availability: "https://schema.org/PreOrder",
      availabilityStarts: PRAISE_TOOL_LAUNCH,
      seller: ref(ORG_ID),
    },
  };
}

/* -------------------------------------------------------------- projects */

const langCode: Record<string, string> = { 한국어: "ko", Korean: "ko", English: "en" };

export function projectWork(p: Project, locale: Locale = "ko"): Node {
  return {
    "@type": "WebSite",
    "@id": `${abs(lp(locale, projectHref(p.slug)))}#work`,
    name: p.title,
    url: p.url,
    description: p.summary,
    image: abs(p.images.desktop),
    creator: ref(ORG_ID),
    ...(p.languages && { inLanguage: p.languages.map((l) => langCode[l] ?? l) }),
    about: { "@type": "Organization", name: p.client, ...(p.clientEn && { alternateName: p.clientEn }), url: p.url },
  };
}

export function projectList(items: readonly Project[], locale: Locale = "ko"): Node {
  return {
    "@type": "ItemList",
    "@id": `${abs(lp(locale, PROJECTS_PATH))}#list`,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: abs(lp(locale, projectHref(p.slug))) })),
  };
}

/* -------------------------------------------------------------- insights */

/** OG image route for a post (opengraph-image.tsx under /insights/[slug]). English posts reuse the Korean card for now (TODO(en)). */
export const insightImage = (slug: string) => `${abs(insightHref(slug))}/opengraph-image`;

export function blogPosting(n: Note, locale: Locale = "ko"): Node {
  const url = abs(lp(locale, insightHref(n.slug)));
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: n.title,
    description: n.excerpt,
    url,
    mainEntityOfPage: ref(`${url}#webpage`),
    datePublished: n.date,
    dateModified: n.date,
    // All current posts are by the founder; map other authors here when they start writing.
    author: ref(PERSON_ID),
    publisher: ref(ORG_ID),
    image: insightImage(n.slug),
    inLanguage: LANG_BY[locale],
    isPartOf: ref(`${abs(lp(locale, INSIGHTS_PATH))}#blog`),
  };
}

export function blog(items: readonly Note[], description: string, locale: Locale = "ko"): Node {
  return {
    "@type": "Blog",
    "@id": `${abs(lp(locale, INSIGHTS_PATH))}#blog`,
    name: locale === "en" ? `${site.name} Insights` : `${site.name} 인사이트`,
    description,
    url: abs(lp(locale, INSIGHTS_PATH)),
    inLanguage: LANG_BY[locale],
    publisher: ref(ORG_ID),
    blogPost: items.map((n) => ({ "@type": "BlogPosting", "@id": `${abs(lp(locale, insightHref(n.slug)))}#article`, headline: n.title, url: abs(lp(locale, insightHref(n.slug))), datePublished: n.date })),
  };
}

