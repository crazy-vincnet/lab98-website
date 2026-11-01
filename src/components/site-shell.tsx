import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/consent/cookie-banner";
import { getChromeCopy } from "@/components/chrome/copy.en";
import { getContent } from "@/lib/get-content";
import { HTML_LANG, type Locale } from "@/lib/i18n";
import { RSS_PATH, RSS_TITLE } from "@/lib/seo";

/**
 * The <html> document shared by every root layout (one per locale group). Each layout supplies its own
 * `metadata`; this only renders the chrome: skip link, header, <main>, footer, cookie banner.
 */
export function SiteShell({ locale = "ko", children }: { locale?: Locale; children: ReactNode }) {
  const { nav } = getContent(locale);
  return (
    <html lang={HTML_LANG[locale]}>
      <body className="flex min-h-svh flex-col">
        {/* TODO(en): the RSS feed is Korean-only; English pages don't advertise it until English posts exist. */}
        {locale === "ko" && <link rel="alternate" type="application/rss+xml" title={RSS_TITLE} href={RSS_PATH} />}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper">
          {getChromeCopy(locale).skipToMain}
        </a>
        <SiteHeader locale={locale} nav={nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} />
        <CookieBanner locale={locale} />
      </body>
    </html>
  );
}
