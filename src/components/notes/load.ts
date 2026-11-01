import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";
import { getNotesCopy } from "./copy.en";

/** Insights pages UI copy with admin overrides merged (registry key "insights.page"). Server only. */
export const loadNotesCopy = (locale: Locale = "ko") => getCopy("insights.page", locale, getNotesCopy(locale));
