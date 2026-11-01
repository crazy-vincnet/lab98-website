import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";
import { getProjectsPageCopy } from "./copy.en";

/** Projects pages UI copy with admin overrides merged (registry key "projects.page"). Server only. */
export const loadProjectsPageCopy = (locale: Locale = "ko") => getCopy("projects.page", locale, getProjectsPageCopy(locale));
