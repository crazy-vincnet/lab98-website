import "server-only";
/**
 * Admin-editable view of the site data in content.ts / content.en.ts / praise-tool*.ts (docs/admin-content.md).
 *
 *   const { site, divisions, projects, faqs, nav } = await getSiteContent(locale);   // = getContent(locale) + published overrides
 *   const P = await getPraiseToolCopy(locale);                                       // = getPraiseTool(locale) + overrides
 *
 * Text consumers (pages, JSON-LD, llms.txt, OG images, RSS) use these async accessors. The synchronous exports
 * (`getContent`, `site`, `divisions`, `PRAISE_TOOL_LAUNCH` …) stay for non-text constants (url, email, slugs, dates, image paths).
 *
 * Registry documents (same projections are used by the registry `defaults`, so editor and site agree on paths):
 *   site.info       siteInfoDefaults(locale)        name, slogans, description, reply time, founder display/role, business labels
 *   site.nav        navDefaults(locale)             menu labels (hrefs are hidden automatically)
 *   divisions.data  divisionsDefaults(locale)       { dev|ai|faith: role, headline, summary, description, services, process, facts, cta.label, status }
 *   projects.data   projectsDefaults(locale)        { <slug>: title, summary, highlights }
 *   faq.home|dev|ai|faith|praise-tool  faqDefaults(locale, key)   [{ q, a }]
 *   praise-tool.page  getPraiseTool(locale)         whole product page copy (price/launch strings are hidden: PRAISE_TOOL_SKIP)
 */
import { getCopy } from "@/lib/copy-store";
import { getContent, type Content } from "@/lib/get-content";
import type { DivisionInfo, Faq, FaqKey, NavItem, Project, SiteInfo } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { getPraiseTool } from "@/lib/praise-tool.en";

/* ------------------------------------------------------------------ defaults (projections) */

export const siteInfoDefaults = (locale: Locale) => {
  const s = getContent(locale).site;
  return {
    name: s.name,
    slogan: s.slogan,
    sloganLines: [...s.sloganLines],
    sloganEn: s.sloganEn,
    sloganOriginal: s.sloganOriginal,
    description: s.description,
    replyTime: s.replyTime,
    nameMeaning: s.nameMeaning,
    founder: { display: s.founder.display, role: s.founder.role },
    business: { name: s.business.name, representative: s.business.representative },
  };
};
type SiteInfoCopy = ReturnType<typeof siteInfoDefaults>;

export const navDefaults = (locale: Locale): NavItem[] => getContent(locale).nav.map((n) => ({ ...n }));

export type DivisionCopy = {
  role: string;
  headline: string;
  summary: string;
  description: string;
  services: { title: string; body: string }[];
  process: { title: string; body: string }[];
  facts: { label: string; value: string }[];
  cta: { label: string };
  status?: { label: string; body: string };
};
export const divisionsDefaults = (locale: Locale): Record<string, DivisionCopy> =>
  Object.fromEntries(
    getContent(locale).divisions.map((d) => [
      d.slug,
      {
        role: d.role,
        headline: d.headline,
        summary: d.summary,
        description: d.description,
        services: d.services.map((x) => ({ ...x })),
        process: d.process.map((x) => ({ ...x })),
        facts: d.facts.map((x) => ({ ...x })),
        cta: { label: d.cta.label },
        ...(d.status && { status: { ...d.status } }),
      } satisfies DivisionCopy,
    ]),
  );

export type ProjectCopy = { title: string; summary: string; highlights: { title: string; body: string }[] };
export const projectsDefaults = (locale: Locale): Record<string, ProjectCopy> =>
  Object.fromEntries(getContent(locale).projects.map((p) => [p.slug, { title: p.title, summary: p.summary, highlights: p.highlights.map((h) => ({ ...h })) }]));

/** Registry key -> FaqKey of content.ts (`praiseTool` is `faq.praise-tool`). */
export const FAQ_KEYS = { "faq.home": "home", "faq.dev": "dev", "faq.ai": "ai", "faq.faith": "faith", "faq.praise-tool": "praiseTool" } as const satisfies Record<string, FaqKey>;
export const faqDefaults = (locale: Locale, key: FaqKey): Faq[] => getContent(locale).faqs[key].map((f) => ({ ...f }));

/** Praise Tool leaves that drive JSON-LD / the countdown or are structural ids: kept in code, hidden from the editor. */
export const PRAISE_TOOL_SKIP = (path: string) =>
  path === "hero.price" || path === "hero.launch" || path === "pricing.price" || path === "dday.fallback" || /^features\.groups\.\d+\.key$/.test(path);

/* ------------------------------------------------------------------ merged accessors */

/** getContent(locale) with the published overrides applied. Same shape, async. */
export async function getSiteContent(locale: Locale = "ko"): Promise<Content> {
  const base = getContent(locale);
  const [info, nav, divs, projs, fHome, fDev, fAi, fFaith, fPt] = await Promise.all([
    getCopy("site.info", locale, siteInfoDefaults(locale)),
    getCopy("site.nav", locale, navDefaults(locale)),
    getCopy("divisions.data", locale, divisionsDefaults(locale)),
    getCopy("projects.data", locale, projectsDefaults(locale)),
    getCopy("faq.home", locale, faqDefaults(locale, "home")),
    getCopy("faq.dev", locale, faqDefaults(locale, "dev")),
    getCopy("faq.ai", locale, faqDefaults(locale, "ai")),
    getCopy("faq.faith", locale, faqDefaults(locale, "faith")),
    getCopy("faq.praise-tool", locale, faqDefaults(locale, "praiseTool")),
  ]);

  const i = info as SiteInfoCopy;
  const site: SiteInfo = {
    ...base.site,
    name: i.name,
    slogan: i.slogan,
    sloganLines: i.sloganLines,
    sloganEn: i.sloganEn,
    sloganOriginal: i.sloganOriginal,
    description: i.description,
    replyTime: i.replyTime,
    nameMeaning: i.nameMeaning,
    founder: { ...base.site.founder, ...i.founder },
    business: { ...base.site.business, ...i.business },
  };

  const divisions: DivisionInfo[] = base.divisions.map((d) => {
    const m = (divs as Record<string, DivisionCopy>)[d.slug];
    if (!m) return d;
    return {
      ...d,
      role: m.role,
      headline: m.headline,
      summary: m.summary,
      description: m.description,
      services: m.services,
      process: m.process,
      facts: m.facts,
      cta: { ...d.cta, label: m.cta.label },
      ...(d.status && m.status && { status: m.status }),
    };
  });

  const projects: Project[] = base.projects.map((p) => {
    const m = (projs as Record<string, ProjectCopy>)[p.slug];
    return m ? { ...p, title: m.title, summary: m.summary, highlights: m.highlights } : p;
  });

  return {
    ...base,
    site,
    nav: nav as NavItem[],
    divisions,
    getDivision: (slug: string) => divisions.find((d) => d.slug === slug),
    projects,
    getProject: (slug: string) => projects.find((p) => p.slug === slug),
    faqs: { home: fHome as Faq[], dev: fDev as Faq[], ai: fAi as Faq[], faith: fFaith as Faq[], praiseTool: fPt as Faq[] },
  };
}

/** Praise Tool page copy (hero, features, form, …) with the published overrides applied. */
export async function getPraiseToolCopy(locale: Locale = "ko") {
  return getCopy("praise-tool.page", locale, getPraiseTool(locale));
}
