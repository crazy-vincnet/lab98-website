import type { Metadata } from "next";
import { site as koSite } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { siteVerification } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

/**
 * Root metadata defaults. Pages override title/description/canonical/openGraph per route.
 * No root `alternates.canonical` or `openGraph.url`: they'd be inherited by every page that doesn't set its own.
 * The RSS <link> is rendered in JSX below (React 19 hoists it into <head>) instead of `alternates.types`,
 * because a page's own `alternates` replaces the parent's wholesale and would drop it.
 */
const koMetadata: Metadata = {
  metadataBase: new URL(koSite.url),
  title: { default: `${koSite.name} — 웹·프로그램 제작 · AI 교육 · 교회 프로그램`, template: `%s | ${koSite.name}` },
  description: koSite.description,
  applicationName: koSite.name,
  keywords: [
    "Lab98",
    "랩98",
    "홈페이지 제작",
    "웹사이트 제작",
    "쇼핑몰 제작",
    "반응형 웹사이트",
    "프로그램 개발",
    "Mac 프로그램",
    "Windows 프로그램",
    "AI 교육",
    "기업 AI 교육",
    "AI 커뮤니티",
    "교회 프로그램",
    "선교단체 웹사이트",
    "찬양 가사 송출",
    "Praise Tool",
    "website development",
    "web design Korea",
    "AI training",
    "church software",
  ],
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
  verification: siteVerification(),
};


const { site } = getContent("en");

/**
 * Root layout of the English tree (/en/...). Own <html lang="en">; mirrors app/(ko)/layout.tsx.
 * Page-level metadata comes from components/pages/* (pageMetadata with locale "en").
 */
const enMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Websites & Software · AI Training · Church Software`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Lab98",
    "custom website development",
    "web design Korea",
    "online store development",
    "Mac software development",
    "Windows software development",
    "AI training",
    "corporate AI training",
    "AI community",
    "church software",
    "mission organization website",
    "worship lyrics software",
    "Praise Tool",
    // TODO(en): review keywords with the translator / SEO owner
  ],
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
  verification: siteVerification(),
};


/** Root <head> defaults per locale; used by each root layout and by global-not-found. */
export const rootMetadata = (locale: Locale): Metadata => (locale === "en" ? enMetadata : koMetadata);
