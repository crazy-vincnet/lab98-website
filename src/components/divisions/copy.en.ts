/**
 * English copy for divisions (service pages). Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getDivisionCopy(locale)` in components; never import divisionCopyEn directly.
 * Owner: translation agent "divisions (service pages)". Every `// TODO(en)` line is still the Korean fallback:
 * replace `divisionCopy.<key>` with the translated object (keep keys, function signatures and placeholders).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { divisionCopy } from "./copy";

export const divisionCopyEn: Dict<typeof divisionCopy> = {
  hero: divisionCopy.hero, // TODO(en)
  about: divisionCopy.about, // TODO(en)
  services: divisionCopy.services, // TODO(en)
  status: divisionCopy.status, // TODO(en)
  process: divisionCopy.process, // TODO(en)
  projects: divisionCopy.projects, // TODO(en)
  praiseTool: divisionCopy.praiseTool, // TODO(en)
  others: divisionCopy.others, // TODO(en)
  divisionCard: divisionCopy.divisionCard, // TODO(en)
  contactBand: divisionCopy.contactBand, // TODO(en)
  statusService: divisionCopy.statusService, // TODO(en)
};

export function getDivisionCopy(locale: Locale = "ko"): Dict<typeof divisionCopy> {
  return locale === "en" ? divisionCopyEn : divisionCopy;
}
