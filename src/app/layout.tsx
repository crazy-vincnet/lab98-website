import type { Metadata } from "next";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/800.css";
import "@fontsource/ibm-plex-sans-kr/400.css";
import "@fontsource/ibm-plex-sans-kr/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/consent/cookie-banner";
import { site } from "@/lib/content";
import { RSS_PATH, RSS_TITLE, siteVerification } from "@/lib/seo";

/**
 * Root metadata defaults. Pages override title/description/canonical/openGraph per route.
 * No root `alternates.canonical` or `openGraph.url`: they'd be inherited by every page that doesn't set its own.
 * The RSS <link> is rendered in JSX below (React 19 hoists it into <head>) instead of `alternates.types`,
 * because a page's own `alternates` replaces the parent's wholesale and would drop it.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — 웹·프로그램 제작 · AI 교육 · 교회 프로그램`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
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
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.business.name,
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: site.name, locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: siteVerification(),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="flex min-h-svh flex-col">
        <link rel="alternate" type="application/rss+xml" title={RSS_TITLE} href={RSS_PATH} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper">
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
