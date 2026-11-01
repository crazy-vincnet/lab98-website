import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";
import { getUnsubscribeCopy } from "./copy.en";

/** /unsubscribe UI copy with admin overrides merged (registry key "unsubscribe.form"). Server only. */
export const loadUnsubscribeCopy = (locale: Locale = "ko") => getCopy("unsubscribe.form", locale, getUnsubscribeCopy(locale));
