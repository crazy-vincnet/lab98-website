/**
 * English copy for projects. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getProjectsPageCopy(locale)` in components; never import projectsCopyEn directly.
 * Owner: translation agent "projects". Every `// TODO(en)` line is still the Korean fallback:
 * replace `projectsCopy.<key>` with the translated object (keep keys, function signatures and placeholders).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { projectsCopy } from "./copy";

export const projectsCopyEn: Dict<typeof projectsCopy> = {
  meta: projectsCopy.meta, // TODO(en)
  index: projectsCopy.index, // TODO(en)
  detail: projectsCopy.detail, // TODO(en)
  cta: projectsCopy.cta, // TODO(en)
};

export function getProjectsPageCopy(locale: Locale = "ko"): Dict<typeof projectsCopy> {
  return locale === "en" ? projectsCopyEn : projectsCopy;
}
