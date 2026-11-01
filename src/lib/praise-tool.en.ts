/**
 * English copy for the Praise Tool product page + launch form. Twin of ./praise-tool.ts (Korean).
 * Import `getPraiseTool(locale)`; never import praiseToolEn directly.
 * Owner: translation agent "praise-tool". Every `// TODO(en)` line is still the Korean fallback.
 * Keep prices, dates and numbers identical to the Korean file (facts are confirmed with the client).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { praiseTool } from "./praise-tool";

export const praiseToolEn: Dict<typeof praiseTool> = {
  meta: praiseTool.meta, // TODO(en)
  hero: praiseTool.hero, // TODO(en)
  dday: praiseTool.dday, // TODO(en)
  glance: praiseTool.glance, // TODO(en)
  features: praiseTool.features, // TODO(en)
  safety: praiseTool.safety, // TODO(en)
  requirements: praiseTool.requirements, // TODO(en)
  pricing: praiseTool.pricing, // TODO(en)
  notify: praiseTool.notify, // TODO(en)
  form: praiseTool.form, // TODO(en)
  more: praiseTool.more, // TODO(en)
};

export function getPraiseTool(locale: Locale = "ko"): Dict<typeof praiseTool> {
  return locale === "en" ? praiseToolEn : praiseTool;
}
