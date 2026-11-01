/**
 * English site chrome copy. Twin of ./copy.ts. Fully translated in stage 1 (header, footer, cookie banner,
 * legal-page labels, 404). Owner: translation agent "chrome" (review only).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { chromeCopy } from "./copy";

export const chromeCopyEn: Dict<typeof chromeCopy> = {
  skipToMain: "Skip to main content",
  header: {
    homeAria: "Lab98 home",
    cta: "Start a project",
    navAria: "Main menu",
    mobileNavAria: "Mobile menu",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    switcherAria: "Language",
  },
  footer: {
    company: "Company",
    services: "Services",
    follow: "Follow",
    companyLinks: { about: "About", process: "How we work", projects: "Projects", praiseTool: "Praise Tool", insights: "Insights", contact: "Contact" },
    legalNavAria: "Terms and policies",
    legal: { privacy: "Privacy Policy", terms: "Terms of Use", cookies: "Cookie Policy", cookieSettings: "Cookie settings", privacyRequest: "Privacy requests", unsubscribe: "Unsubscribe" },
    businessLine: (site) =>
      [
        `${site.name} is a brand of ${site.business.name}`,
        `Representative: ${site.business.representative}`,
        `Business reg. no. ${site.business.registrationNumber}`,
        site.business.address && `Address: ${site.business.address}`,
      ].filter(Boolean) as string[],
  },
  legalDoc: {
    effective: "Effective",
    bizLine: (biz) => ({
      prefix: `Business: ${biz.name} · Representative: ${biz.representative} · Business reg. no. ${biz.registrationNumber}`,
      address: biz.address ? ` · Address: ${biz.address}` : "",
      contact: " · Contact: ",
    }),
    toc: "Contents",
    history: "Revision history",
  },
  cookieBanner: {
    region: "Cookie notice",
    title: "Cookie notice",
    body: "Lab98 does not use advertising or tracking cookies. If we start using a visitor-statistics tool, we will only use it with your consent.",
    essentialOnly: "Essential only",
    allowAnalytics: "Allow analytics",
    settings: "Settings",
    policy: "Cookie Policy",
    panelTitle: "Cookie settings",
    essential: { name: "Essential", state: "Always on", desc: "Storage that remembers your cookie choice." },
    analytics: { name: "Analytics", desc: "Visitor statistics — we don't use any such tool right now." },
    save: "Save choice",
    close: "Close",
    saved: { essential: "Saved: essential only.", analytics: "Saved: analytics cookies allowed." },
  },
  notFound: {
    metaTitle: "Page not found",
    metaDescription: "The address may have changed, or the page is no longer available.",
    label: "404 · Not shipped",
    title: "We can't find that page",
    lead: "The address may have changed, or the page is no longer available. Head somewhere below.",
    home: "Go to the home page",
    projects: "See our projects",
  },
};

export function getChromeCopy(locale: Locale = "ko"): Dict<typeof chromeCopy> {
  return locale === "en" ? chromeCopyEn : chromeCopy;
}
