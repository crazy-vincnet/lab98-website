import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";
import { getAboutCopy } from "./copy.en";

/** /about UI copy with admin overrides merged (registry key "about.copy"). Server only. */
export const loadAboutCopy = (locale: Locale = "ko") => getCopy("about.copy", locale, getAboutCopy(locale));
