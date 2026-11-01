/**
 * Locale-aware content accessor. Pages and shared server components call `getContent(locale)`
 * instead of importing `site`, `divisions`, … from content.ts directly.
 * Static, locale-independent bits (divisionTheme, symbolSrc, PRAISE_TOOL_LAUNCH, types) stay in content.ts.
 */
import * as ko from "@/lib/content";
import * as en from "@/lib/content.en";
import type { Locale } from "@/lib/i18n";

export type Content = {
  locale: Locale;
  site: ko.SiteInfo;
  nav: readonly ko.NavItem[];
  divisions: ko.DivisionInfo[];
  getDivision: (slug: string) => ko.DivisionInfo | undefined;
  projects: ko.Project[];
  getProject: (slug: string) => ko.Project | undefined;
  clients: { name: string; short: string; url: string }[];
  notes: ko.Note[];
  getNote: (slug: string) => ko.Note | undefined;
  faqs: Record<ko.FaqKey, ko.Faq[]>;
};

const dictionaries: Record<Locale, Content> = {
  ko: { locale: "ko", ...ko },
  en: { locale: "en", ...en },
};

export function getContent(locale: Locale = "ko"): Content {
  return dictionaries[locale];
}
