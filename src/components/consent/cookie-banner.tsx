import { CookieBannerClient } from "./cookie-banner-client";
import { getChromeCopy } from "@/components/chrome/copy.en";
import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";

/** Server wrapper: merges the admin-editable banner copy (registry key "chrome.cookieBanner") and passes it to the client banner as props. */
export async function CookieBanner({ locale = "ko" }: { locale?: Locale }) {
  const copy = await getCopy("chrome.cookieBanner", locale, getChromeCopy(locale).cookieBanner);
  return <CookieBannerClient locale={locale} copy={copy} />;
}
