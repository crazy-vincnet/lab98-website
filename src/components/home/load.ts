import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";
import { getHomeContactDoc, getHomeCopy } from "./copy.en";

/** Home section copy with admin overrides merged (registry keys home.trust … home.contact). Server only. */
export const loadHomeCopy = {
  trust: (l: Locale) => getCopy("home.trust", l, getHomeCopy(l).trustCopy),
  praise: (l: Locale) => getCopy("home.praise", l, getHomeCopy(l).praiseCopy),
  services: (l: Locale) => getCopy("home.services", l, getHomeCopy(l).servicesCopy),
  projects: (l: Locale) => getCopy("home.projects", l, getHomeCopy(l).projectsCopy),
  process: (l: Locale) => getCopy("home.process", l, getHomeCopy(l).processCopy),
  founder: (l: Locale) => getCopy("home.founder", l, getHomeCopy(l).founderCopy),
  insights: (l: Locale) => getCopy("home.insights", l, getHomeCopy(l).insightsCopy),
  contact: (l: Locale) => getCopy("home.contact", l, getHomeContactDoc(l)),
};
