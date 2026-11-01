import { getChromeCopy } from "@/components/chrome/copy.en";
import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";

/** "Skip to main content" link (admin-editable, registry key "chrome.skip"). `demo` is for the admin preview only: shows the link without needing focus. */
export async function SkipLink({ locale = "ko", demo = false }: { locale?: Locale; demo?: boolean }) {
  const t = await getCopy("chrome.skip", locale, skipDefaults(locale));
  return (
    <a href="#main" className={demo ? "m-4 inline-block bg-ink px-4 py-3 text-paper" : "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"}>
      {t.skipToMain}
    </a>
  );
}

/** Defaults of the "chrome.skip" document (also used by the registry). */
export const skipDefaults = (locale: Locale) => ({ skipToMain: getChromeCopy(locale).skipToMain });
