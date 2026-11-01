/**
 * Single source for internal hrefs to the projects / insights / services routes.
 * Old paths (/experiments, /notes, /divisions) redirect here via next.config.ts.
 */
export const PROJECTS_PATH = "/projects";
export const INSIGHTS_PATH = "/insights";
/** Service (division) pages are owned by another route; linked only. */
export const SERVICES_PATH = "/services";
export const PRIVACY_PATH = "/privacy";
export const PRAISE_TOOL_PATH = "/praise-tool";

export const projectHref = (slug: string) => `${PROJECTS_PATH}/${slug}`;
export const insightHref = (slug: string) => `${INSIGHTS_PATH}/${slug}`;
export const divisionHref = (slug: string) => `${SERVICES_PATH}/${slug}`;

/** Home page section anchors. */
export const HOME_ANCHORS = {
  about: "about",
  services: "services",
  projects: "projects",
  process: "process",
  insights: "insights",
  contact: "contact",
} as const;
export const CONTACT_HREF = `/#${HOME_ANCHORS.contact}`;
export const HOME_SERVICES_HREF = `/#${HOME_ANCHORS.services}`;
