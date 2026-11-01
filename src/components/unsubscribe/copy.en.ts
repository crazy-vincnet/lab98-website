/**
 * English copy for unsubscribe. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getUnsubscribeCopy(locale)` in components; never import unsubscribeCopyEn directly.
 * Owner: translation agent "unsubscribe". Every `// TODO(en)` line is still the Korean fallback:
 * replace `unsubscribeCopy.<key>` with the translated object (keep keys, function signatures and placeholders).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { unsubscribeCopy } from "./copy";

export const unsubscribeCopyEn: Dict<typeof unsubscribeCopy> = {
  meta: unsubscribeCopy.meta, // TODO(en)
  label: unsubscribeCopy.label, // TODO(en)
  title: unsubscribeCopy.title, // TODO(en)
  lead: unsubscribeCopy.lead, // TODO(en)
  points: unsubscribeCopy.points, // TODO(en)
  form: unsubscribeCopy.form, // TODO(en)
};

export function getUnsubscribeCopy(locale: Locale = "ko"): Dict<typeof unsubscribeCopy> {
  return locale === "en" ? unsubscribeCopyEn : unsubscribeCopy;
}
