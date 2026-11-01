import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";
import { getDivisionCopy } from "./copy.en";

/** Service-page UI copy with admin overrides merged (registry key "divisions.copy"). Server only. */
export const loadDivisionCopy = (locale: Locale = "ko") => getCopy("divisions.copy", locale, getDivisionCopy(locale));
