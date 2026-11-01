/**
 * English copy for projects. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getProjectsPageCopy(locale)` in components; never import projectsCopyEn directly.
 */
import type { Dict, Locale } from "@/lib/i18n";
import { projectsCopy } from "./copy";

export const projectsCopyEn: Dict<typeof projectsCopy> = {
  meta: {
    title: "Projects",
    description: "Websites for organizations that Lab98 Dev planned, designed and built. Every project is custom-made, and we hand over the source code.",
    notFoundTitle: "Project not found",
  },
  index: {
    eyebrow: "PROJECTS",
    title: "Sites built by Lab98 Dev",
    lead: (count: number) => `We took on the planning, design and development of websites for ${count} organizations.`,
    leadMore: "Every project is custom-made, with no templates. We hand over the source code when the site opens.",
    listLabel: "Project list",
    count: (count: number) => `${count} PROJECTS`,
  },
  detail: {
    back: "← Projects",
    backBottom: "← All projects",
    meta: { division: "Field", scope: "Scope", type: "Type", languages: "Languages" },
    visit: "Visit the site",
    visitAria: (client: string) => `Visit the ${client} website (opens in a new window)`,
    shots: { eyebrow: "Screens", title: "Desktop and mobile screens" },
    highlights: { eyebrow: "Features", title: "Key features" },
    pager: { label: "Other projects", prev: "← Previous project", next: "Next project →" },
    alt: {
      desktop: (client: string) => `${client} website, desktop home screen`,
      mobile: (client: string) => `${client} website, mobile home screen`,
    },
  },
  cta: {
    eyebrow: "Contact",
    title: "Need a site that fits your organization?",
    lead: "We plan, design and build around your organization, and hand over the source code when the site opens. Projects start at ₩2,000,000.",
    action: "Ask about a Dev project",
  },
};

export function getProjectsPageCopy(locale: Locale = "ko"): Dict<typeof projectsCopy> {
  return locale === "en" ? projectsCopyEn : projectsCopy;
}
