import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Contact, Founder, Insights, PraiseToolBanner, Process, Projects, Services, TrustStrip } from "@/components/home/sections";
import { FaqSection } from "@/components/faq/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { getSeoPage } from "@/components/seo/seo-copy";
import { getContent } from "@/lib/get-content";
import { getSiteContent } from "@/lib/site-content";
import { localePath, type Locale } from "@/lib/i18n";
import { ORG_ID, faqPage, graph, organization, person, webPage, website } from "@/lib/structured-data";

export const homeMetadata = async (locale: Locale): Promise<Metadata> =>
  pageMetadata({ ...(await getSeoPage("home", locale)), absoluteTitle: true, path: "/", locale });

// Fully static: all content comes from src/lib/content(.en).ts; motion and the D-day badge live in small client islands.
export async function HomePage({ locale }: { locale: Locale }) {
  const { title, description } = await getSeoPage("home", locale);
  const { faqs, site: siteInfo } = await getSiteContent(locale); // admin-editable (site.info, faq.home)
  const path = localePath(locale, "/");
  const jsonLd = graph(
    organization(locale, siteInfo),
    website(locale, siteInfo),
    person(locale, siteInfo),
    webPage({ path, name: title, description, extra: { about: { "@id": ORG_ID } }, locale }),
    faqPage(path, faqs.home, locale),
  );
  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero locale={locale} />
      <TrustStrip locale={locale} />
      <PraiseToolBanner locale={locale} />
      <Services locale={locale} />
      <Projects locale={locale} />
      <Process locale={locale} />
      <Founder locale={locale} />
      <Insights locale={locale} />
      <FaqSection items={faqs.home} locale={locale} />
      <Contact locale={locale} />
    </>
  );
}
