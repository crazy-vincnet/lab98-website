/**
 * English copy for insights. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getNotesCopy(locale)` in components; never import notesCopyEn directly.
 * Owner: translation agent "insights". Every `// TODO(en)` line is still the Korean fallback:
 * replace `notesCopy.<key>` with the translated object (keep keys, function signatures and placeholders).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { notesCopy } from "./copy";

export const notesCopyEn: Dict<typeof notesCopy> = {
  meta: notesCopy.meta, // TODO(en)
  index: notesCopy.index, // TODO(en)
  list: notesCopy.list, // TODO(en)
  detail: notesCopy.detail, // TODO(en)
};

export function getNotesCopy(locale: Locale = "ko"): Dict<typeof notesCopy> {
  return locale === "en" ? notesCopyEn : notesCopy;
}
