import { SiteHeaderClient } from "@/components/site-header-client";
import { getChromeCopy } from "@/components/chrome/copy.en";
import { getSiteContent } from "@/lib/site-content";
import { getCopy } from "@/lib/copy-store";
import type { Locale } from "@/lib/i18n";

/** Server wrapper: merges the admin-editable header copy (registry key "chrome.header") and hands it to the client header as props. */
export async function SiteHeader({ locale = "ko" }: { locale?: Locale }) {
  const { nav } = await getSiteContent(locale); // admin-editable site data
  const copy = await getCopy("chrome.header", locale, getChromeCopy(locale).header);
  return <SiteHeaderClient locale={locale} nav={nav} copy={copy} />;
}
