/**
 * /en/llms.txt body (https://llmstxt.org): English twin of llmsTxt() in ./llms.ts, built from the English content
 * so the AI-facing summary never drifts from the site. Pure function of static data → prerendered at build.
 */
import { getAboutCopy } from "@/components/about/copy.en";
import { CONTACT_HREF, COOKIES_PATH, INSIGHTS_PATH, PRAISE_TOOL_PATH, PRIVACY_PATH, PROJECTS_PATH, TERMS_PATH, divisionHref, insightHref, projectHref } from "@/components/experiments/paths";
import { getProjectsPageCopy } from "@/components/experiments/copy.en";
import { getNotesCopy } from "@/components/notes/copy.en";
import { getContent } from "@/lib/get-content";
import { localePath } from "@/lib/i18n";
import { getPraiseTool } from "@/lib/praise-tool.en";
import { abs } from "@/lib/structured-data";

const L = "en" as const;
const { site, divisions, projects, notes } = getContent(L);
const aboutCopy = getAboutCopy(L);
const projectsCopy = getProjectsPageCopy(L);
const notesCopy = getNotesCopy(L);
const P = getPraiseTool(L);

const link = (label: string, path: string, desc?: string) => `- [${label}](${abs(localePath(L, path))})${desc ? `: ${desc}` : ""}`;
const sortedNotes = [...notes].sort((a, b) => b.date.localeCompare(a.date));

const summary = `${site.description} Our slogan is “${site.slogan}” ${site.name} is a brand of ${site.business.name}, and the founder is ${site.founder.display}.`;

export function llmsTxtEn() {
  return [
    `# ${site.name}`,
    "",
    `> ${summary}`,
    "",
    "This is the English version of the site. Korean is the primary language; the Korean index is at /llms.txt, and a single file with the facts is at /llms-full.txt (Korean).",
    "",
    "## Company",
    "",
    link("Home", "/", "The three divisions (Dev, AI, Faith), projects, how we work, FAQ and the contact form"),
    link(aboutCopy.meta.title, "/about", aboutCopy.meta.description),
    "",
    "## Services",
    "",
    ...divisions.map((d) => link(`${d.name} — ${d.role}`, divisionHref(d.slug), d.summary)),
    "",
    "## Praise Tool",
    "",
    link(`${P.hero.title} — ${P.hero.sub}`, PRAISE_TOOL_PATH, P.meta.description),
    "",
    "## Projects",
    "",
    link(projectsCopy.meta.title, PROJECTS_PATH, projectsCopy.meta.description),
    ...projects.map((p) => link(p.title, projectHref(p.slug), p.summary)),
    "",
    "## Insights",
    "",
    link(notesCopy.meta.title, INSIGHTS_PATH, notesCopy.meta.description),
    ...sortedNotes.map((n) => link(n.title, insightHref(n.slug), n.excerpt)),
    "",
    "## Contact",
    "",
    link("Contact us", CONTACT_HREF, `Use the contact form or email ${site.email}. ${site.replyTime}.`),
    "",
    "## Legal",
    "",
    link("Privacy Policy", PRIVACY_PATH),
    link("Terms of Use", TERMS_PATH),
    link("Cookie Policy", COOKIES_PATH),
    "",
    "The legal pages are English translations for convenience; the Korean versions prevail.",
    "",
    "## Optional",
    "",
    `- [llms-full.txt](${abs("/llms-full.txt")}): Full company, service, pricing, Praise Tool, project and FAQ details (Korean)`,
    "",
  ].join("\n");
}
