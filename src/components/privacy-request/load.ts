import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";
import { getPrivacyRequestCopy } from "./copy.en";

/** /privacy/request UI copy with admin overrides merged (registry key "privacy-request.form"). Server only. */
export const loadPrivacyRequestCopy = (locale: Locale = "ko") => getCopy("privacy-request.form", locale, getPrivacyRequestCopy(locale));
