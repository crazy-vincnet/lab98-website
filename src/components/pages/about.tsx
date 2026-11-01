import type { Metadata } from "next";
import { AboutHero, DivisionsOverview, FounderWords, NameMeaning, Principles, Team } from "@/components/about/about-sections";
import { ContactBand } from "@/components/divisions/division-sections";
import { loadAboutCopy } from "@/components/about/load";
import { routes } from "@/components/divisions/copy";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { getSeoPage } from "@/components/seo/seo-copy";
import { getContent } from "@/lib/get-content";
import { getSiteContent } from "@/lib/site-content";
import { localePath, type Locale } from "@/lib/i18n";
import { ORG_ID, PERSON_ID, breadcrumb, graph, organization, person, webPage } from "@/lib/structured-data";

const PATH = "/about";

export const aboutMetadata = async (locale: Locale): Promise<Metadata> =>
  pageMetadata({ ...(await getSeoPage("about", locale)), path: PATH, locale });

export async function AboutPage({ locale }: { locale: Locale }) {
  const { title, description } = await getSeoPage("about", locale);
  const C = await loadAboutCopy(locale);
  const { site: siteInfo } = await getSiteContent(locale); // admin-editable (site.info)
  const path = localePath(locale, PATH);
  const crumbs = [{ name: C.meta.title, path }];
  const jsonLd = graph(
    webPage({ path, name: title, description, type: "AboutPage", crumbs, extra: { about: { "@id": ORG_ID }, mainEntity: { "@id": ORG_ID }, author: { "@id": PERSON_ID } }, locale }),
    organization(locale, siteInfo),
    person(locale, siteInfo),
    breadcrumb(path, crumbs, locale),
  );
  return (
    <>
      <JsonLd data={jsonLd} />
      <AboutHero locale={locale} />
      <FounderWords locale={locale} />
      <NameMeaning locale={locale} />
      <DivisionsOverview locale={locale} />
      <Principles locale={locale} />
      <Team locale={locale} />
      <ContactBand
        locale={locale}
        title={C.contactBand.title}
        lead={C.contactBand.lead}
        cta={C.contactBand.cta}
        secondary={{ label: C.contactBand.secondaryCta, href: routes.projects }}
      />
    </>
  );
}
