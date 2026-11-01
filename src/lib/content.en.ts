/**
 * English site content — same exports/shapes as content.ts (Korean).
 * Owner: English translation agents. Search `TODO(en)` for what is still Korean fallback.
 * Pick the dictionary with getContent(locale) from "@/lib/get-content".
 *
 * Rules: keep slugs, hrefs, URLs, image paths, ids and numbers identical to content.ts; only translate prose.
 * Do not import this file from client components (use the page's props); it is server-side data.
 */
import {
  divisions as koDivisions,
  faqs as koFaqs,
  notes as koNotes,
  projects as koProjects,
  nav as koNav,
  site as koSite,
  type Division,
  type DivisionInfo,
  type DivisionSlug,
  type Faq,
  type FaqKey,
  type NavItem,
  type Note,
  type Project,
  type SiteInfo,
} from "@/lib/content";

export const site: SiteInfo = {
  ...koSite,
  slogan: "Technology is the tool. People are the point.",
  sloganLines: ["Technology is the tool.", "People are the point."],
  sloganEn: koSite.sloganEn,
  sloganOriginal: "Technology should make life easier for people! Technology is not the master — it is just a tool.",
  description:
    "Lab98 builds websites, online stores and Mac/Windows software (Dev), teaches AI and runs an AI community (AI), and makes software for churches and mission organizations (Faith). We make easy-to-use tools so people can focus on what matters more.",
  replyTime: "We reply within 2 business days",
  founder: { ...koSite.founder, name: "Vincent Jeon", nameEn: "Vincent Jeon", display: "Vincent Jeon" },
  nameMeaning: "The 98 in Lab98 is the year our founder, Vincent Jeon, was born: 1998.",
  business: {
    ...koSite.business,
    name: "JJdream (제이제이드림)",
    representative: "Vincent Jeon (전영재)",
  },
};

export const nav: readonly NavItem[] = [
  { label: "About", href: koNav[0].href },
  { label: "Services", href: koNav[1].href },
  { label: "Projects", href: koNav[2].href },
  { label: "Praise Tool", href: koNav[3].href },
  { label: "Insights", href: koNav[4].href },
  { label: "Contact", href: koNav[5].href },
];

/** Per-division English overrides; everything not listed falls back to Korean (TODO(en)). */
const divisionEn: Record<DivisionSlug, Partial<DivisionInfo>> = {
  dev: {
    role: "Web & software development",
    cta: { label: "Ask about a Dev project", interest: "dev" },
    // TODO(en): headline, summary, description, services[], process[], facts[]
  },
  ai: {
    role: "AI training & community",
    cta: { label: "Ask about AI training", interest: "ai" },
    // TODO(en): headline, summary, description, services[], process[], facts[], status
  },
  faith: {
    role: "Software for churches & missions",
    cta: { label: "Ask about Faith software", interest: "faith" },
    // TODO(en): headline, summary, description, services[], process[], facts[]
  },
};

export const divisions: DivisionInfo[] = koDivisions.map((d) => ({ ...d, ...divisionEn[d.slug] }));

export function getDivision(slug: string) {
  return divisions.find((d) => d.slug === slug);
}

const SCOPE_EN = "Planning · Design · Development";
const languageEn: Record<string, string> = { 한국어: "Korean", English: "English" };

export const projects: Project[] = koProjects.map((p) => ({
  ...p,
  type: "Website",
  scope: SCOPE_EN,
  languages: p.languages?.map((l) => languageEn[l] ?? l),
  // TODO(en): title, summary, highlights[] (client names stay as-is; clientEn already exists)
}));

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const clients = projects.map((p) => ({ name: p.clientEn ? `${p.client} (${p.clientEn})` : p.client, short: p.clientEn ?? p.client, url: p.url }));

// TODO(en): translate title, excerpt and body[] of every note. Until then the English page shows the Korean post.
export const notes: Note[] = koNotes.map((n) => ({ ...n, author: "Vincent Jeon" }));

export function getNote(slug: string) {
  return notes.find((n) => n.slug === slug);
}

// TODO(en): translate every q/a. Until then the Korean FAQ is shown.
export const faqs: Record<FaqKey, Faq[]> = koFaqs;

export type { Division };
