import type { Metadata } from "next";
import { site as koSite } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { siteVerificationMetadata } from "@/lib/site-settings";
import type { Locale } from "@/lib/i18n";
import { getSeoRoot, seoRootDefaults } from "@/components/seo/seo-copy";

/**
 * Root metadata defaults. Pages override title/description/canonical/openGraph per route.
 * No root `alternates.canonical` or `openGraph.url`: they'd be inherited by every page that doesn't set its own.
 * The RSS <link> is rendered in JSX below (React 19 hoists it into <head>) instead of `alternates.types`,
 * because a page's own `alternates` replaces the parent's wholesale and would drop it.
 */
const koMetadata: Metadata = {
  metadataBase: new URL(koSite.url),
  title: { default: seoRootDefaults("ko").titleDefault, template: `%s | ${koSite.name}` },
  description: koSite.description,
  applicationName: koSite.name,
  keywords: [...seoRootDefaults("ko").keywords],
  authors: [{ name: koSite.name, url: koSite.url }],
  creator: koSite.name,
  publisher: koSite.business.name,
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: koSite.name, locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};


const { site } = getContent("en");

/**
 * Root layout of the English tree (/en/...). Own <html lang="en">; mirrors app/(ko)/layout.tsx.
 * Page-level metadata comes from components/pages/* (pageMetadata with locale "en").
 */
const enMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: seoRootDefaults("en").titleDefault, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: [...seoRootDefaults("en").keywords],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.business.name,
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: site.name, locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};


/** Root <head> defaults per locale, without search verification (global-not-found is noindex and uses this). */
export const rootMetadata = async (locale: Locale): Promise<Metadata> => {
  const base = locale === "en" ? enMetadata : koMetadata;
  // Admin-editable (registry key "seo.root"): default <title> and keywords. Unchanged objects when nothing is overridden.
  const seo = await getSeoRoot(locale);
  const d = seoRootDefaults(locale);
  if (seo.titleDefault === d.titleDefault && seo.keywords.every((k, i) => k === d.keywords[i])) return base;
  const template = typeof base.title === "object" && base.title && "template" in base.title ? base.title.template : undefined;
  return { ...base, title: { default: seo.titleDefault, template: template ?? "%s" }, keywords: [...seo.keywords] };
};

/**
 * Root metadata for the public root layouts (`export const generateMetadata`). Adds the Google/Naver verification
 * meta tags from site_settings (edited in /admin/search; "use cache" + tag `site-settings`), env as fallback.
 */
export const rootMetadataWithVerification = async (locale: Locale): Promise<Metadata> => ({
  ...(await rootMetadata(locale)),
  verification: await siteVerificationMetadata(),
});
