/**
 * English copy for about. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getAboutCopy(locale)` in components; never import aboutCopyEn directly.
 * Owner: translation agent "about". Every `// TODO(en)` line is still the Korean fallback:
 * replace `aboutCopy.<key>` with the translated object (keep keys, function signatures and placeholders).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { aboutCopy } from "./copy";

export const aboutCopyEn: Dict<typeof aboutCopy> = {
  meta: aboutCopy.meta, // TODO(en)
  hero: aboutCopy.hero, // TODO(en)
  founderWords: aboutCopy.founderWords, // TODO(en)
  name: aboutCopy.name, // TODO(en)
  divisions: aboutCopy.divisions, // TODO(en)
  principles: aboutCopy.principles, // TODO(en)
  team: aboutCopy.team, // TODO(en)
  contactBand: aboutCopy.contactBand, // TODO(en)
};

export function getAboutCopy(locale: Locale = "ko"): Dict<typeof aboutCopy> {
  return locale === "en" ? aboutCopyEn : aboutCopy;
}
