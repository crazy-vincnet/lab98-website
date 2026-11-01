import { localePath, type Locale } from "@/lib/i18n";

/**
 * Single source for internal hrefs to the projects / insights / services routes.
 * Old paths (/experiments, /notes, /divisions) redirect here via next.config.ts.
 *
 * Constants and the *Href builders are Korean (locale-less) paths. For another locale pass `locale`
 * (builders) or wrap with `localePath(locale, path)` / `pathFor(locale, path)`; both default to "ko",
 * so existing call sites keep producing the same URLs.
 */
export const PROJECTS_PATH = "/projects";
export const INSIGHTS_PATH = "/insights";
/** Service (division) pages are owned by another route; linked only. */
export const SERVICES_PATH = "/services";
export const PRIVACY_PATH = "/privacy";
export const PRAISE_TOOL_PATH = "/praise-tool";
export const TERMS_PATH = "/terms";
export const COOKIES_PATH = "/cookies";
/** 개인정보 열람·정정·삭제·처리정지 요청 */
export const PRIVACY_REQUEST_PATH = "/privacy/request";
/** 이메일 수신거부 */
export const UNSUBSCRIBE_PATH = "/unsubscribe";

export const projectHref = (slug: string, locale: Locale = "ko") => localePath(locale, `${PROJECTS_PATH}/${slug}`);
export const insightHref = (slug: string, locale: Locale = "ko") => localePath(locale, `${INSIGHTS_PATH}/${slug}`);
export const divisionHref = (slug: string, locale: Locale = "ko") => localePath(locale, `${SERVICES_PATH}/${slug}`);

/** Localize any internal path from this file: `pathFor("en", PRIVACY_PATH)` → "/en/privacy". */
export const pathFor = localePath;

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
export const contactHref = (locale: Locale = "ko") => localePath(locale, CONTACT_HREF);
export const homeServicesHref = (locale: Locale = "ko") => localePath(locale, HOME_SERVICES_HREF);
