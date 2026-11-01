/**
 * schema.org JSON-LD builders. Every page renders one `@graph` (see <JsonLd>); site-wide entities
 * (Organization, WebSite, Person) are emitted in full on the home page and referenced by `@id` elsewhere.
 * Facts come from content.ts / praise-tool.ts only — no ratings, reviews, addresses or dates we don't have.
 * Validate after deploy: https://search.google.com/test/rich-results · https://validator.schema.org/
 */
import { PRAISE_TOOL_LAUNCH, divisions, site, type DivisionInfo, type Faq, type Note, type Project } from "@/lib/content";
import { praiseTool } from "@/lib/praise-tool";
import { INSIGHTS_PATH, PRAISE_TOOL_PATH, PROJECTS_PATH, divisionHref, insightHref, projectHref } from "@/components/experiments/paths";

type Node = Record<string, unknown>;

export const LANG = "ko-KR";
export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;
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

export function organization(): Node {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.business.name,
    url: abs("/"),
    logo: { "@type": "ImageObject", url: abs("/icon.png"), width: 512, height: 512 },
    image: abs("/brand/lockup/lab98-master-lockup.svg"),
    email: site.email,
    description: site.description,
    slogan: site.slogan,
    founder: ref(PERSON_ID),
    // 사업자등록번호 is not a tax ID in schema.org's sense (taxID = VAT/TIN), so it goes in `identifier`.
    identifier: { "@type": "PropertyValue", propertyID: "사업자등록번호", value: site.business.registrationNumber },
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: site.email, availableLanguage: ["ko"] },
    knowsAbout: ["홈페이지 제작", "쇼핑몰 제작", "Mac·Windows 프로그램 개발", "AI 교육", "교회·선교단체 프로그램"],
    // sameAs: add once site.social has accounts.
  };
}

export function website(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: abs("/"),
    description: site.description,
    inLanguage: LANG,
    publisher: ref(ORG_ID),
  };
}

export function person(): Node {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.founder.name,
    alternateName: site.founder.nameEn,
    jobTitle: site.founder.role,
    worksFor: ref(ORG_ID),
    url: abs("/about"),
  };
}

/* ------------------------------------------------------------ page-level */

export type Crumb = { name: string; path: string };

export function breadcrumb(path: string, crumbs: Crumb[]): Node {
  const all = [{ name: "홈", path: "/" }, ...crumbs];
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
}: {
  path: string;
  name: string;
  description?: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage" | "ItemPage" | "FAQPage";
  crumbs?: Crumb[];
  extra?: Node;
}): Node {
  return {
    "@type": type,
    "@id": `${abs(path)}#webpage`,
    url: abs(path),
    name,
    ...(description && { description }),
    inLanguage: LANG,
    isPartOf: ref(WEBSITE_ID),
    ...(crumbs && { breadcrumb: ref(`${abs(path)}#breadcrumb`) }),
    ...extra,
  };
}

/** FAQPage with exactly the Q&As shown on the page. */
export function faqPage(path: string, items: readonly Faq[]): Node {
  return {
    "@type": "FAQPage",
    "@id": `${abs(path)}#faq`,
    url: abs(path),
    inLanguage: LANG,
    isPartOf: ref(WEBSITE_ID),
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/* -------------------------------------------------------------- services */

/** Dev starts at 200만 원 (divisions.dev.facts "시작 가격"). AI/Faith have no public price. */
const DEV_MIN_PRICE_KRW = 2_000_000;

const serviceType: Record<DivisionInfo["slug"], string> = {
  dev: "홈페이지·쇼핑몰 제작, Mac·Windows 프로그램 개발",
  ai: "AI 교육",
  faith: "교회·선교단체 프로그램 제작",
};

export function service(d: DivisionInfo): Node {
  const url = abs(divisionHref(d.slug));
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: d.name,
    serviceType: serviceType[d.slug],
    description: d.summary,
    url,
    provider: ref(ORG_ID),
    areaServed: { "@type": "Country", name: "KR" },
    inLanguage: LANG,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${d.name} 서비스`,
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
    ...(d.slug === "faith" && { isRelatedTo: ref(`${abs(PRAISE_TOOL_PATH)}#software`) }),
  };
}

/* ----------------------------------------------------------- Praise Tool */

/** Price shown on the page ("100,000원") as a number. */
export const PRAISE_TOOL_PRICE_KRW = Number(praiseTool.pricing.price.replace(/\D/g, ""));

export function praiseToolApp(): Node {
  const url = abs(PRAISE_TOOL_PATH);
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

const langCode: Record<string, string> = { 한국어: "ko", English: "en" };

export function projectWork(p: Project): Node {
  return {
    "@type": "WebSite",
    "@id": `${abs(projectHref(p.slug))}#work`,
    name: p.title,
    url: p.url,
    description: p.summary,
    image: abs(p.images.desktop),
    creator: ref(ORG_ID),
    ...(p.languages && { inLanguage: p.languages.map((l) => langCode[l] ?? l) }),
    about: { "@type": "Organization", name: p.client, ...(p.clientEn && { alternateName: p.clientEn }), url: p.url },
  };
}

export function projectList(items: readonly Project[]): Node {
  return {
    "@type": "ItemList",
    "@id": `${abs(PROJECTS_PATH)}#list`,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: abs(projectHref(p.slug)) })),
  };
}

/* -------------------------------------------------------------- insights */

/** OG image route for a post (opengraph-image.tsx under /insights/[slug]). */
export const insightImage = (slug: string) => `${abs(insightHref(slug))}/opengraph-image`;

export function blogPosting(n: Note): Node {
  const url = abs(insightHref(n.slug));
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
    inLanguage: LANG,
    isPartOf: ref(`${abs(INSIGHTS_PATH)}#blog`),
  };
}

export function blog(items: readonly Note[], description: string): Node {
  return {
    "@type": "Blog",
    "@id": `${abs(INSIGHTS_PATH)}#blog`,
    name: `${site.name} 인사이트`,
    description,
    url: abs(INSIGHTS_PATH),
    inLanguage: LANG,
    publisher: ref(ORG_ID),
    blogPost: items.map((n) => ({ "@type": "BlogPosting", "@id": `${abs(insightHref(n.slug))}#article`, headline: n.title, url: abs(insightHref(n.slug)), datePublished: n.date })),
  };
}

/** Division list used by the About page (`about` → the three services). */
export const divisionServiceRefs = () => divisions.map((d) => ref(`${abs(divisionHref(d.slug))}#service`));
