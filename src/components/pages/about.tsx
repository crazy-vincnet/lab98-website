import type { Metadata } from "next";
import { AboutHero, DivisionsOverview, FounderWords, NameMeaning, Principles, Team } from "@/components/about/about-sections";
import { ContactBand } from "@/components/divisions/division-sections";
import { getAboutCopy } from "@/components/about/copy.en";
import { routes } from "@/components/divisions/copy";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { ORG_ID, PERSON_ID, breadcrumb, graph, organization, person, webPage } from "@/lib/structured-data";

const PATH = "/about";

const seo = (locale: Locale) => {
  const { site } = getContent(locale);
  return locale === "en"
    ? {
        title: "About — Technology that helps people",
        description: `${site.name} is a company with three divisions: web and software development (Dev), AI training (AI) and software for churches (Faith). Learn what the 98 in our name means and meet our founder, ${site.founder.display}.`,
      }
    : {
        title: "회사 소개 — 사람을 돕는 기술",
        description: `${site.name}은 홈페이지·프로그램 제작(Dev), AI 교육(AI), 교회 프로그램(Faith)을 하는 회사예요. 이름에 담긴 98의 뜻과 파운더 ${site.founder.display}을 소개해요.`,
      };
};

export const aboutMetadata = (locale: Locale): Metadata => pageMetadata({ ...seo(locale), path: PATH, locale });

export function AboutPage({ locale }: { locale: Locale }) {
  const { title, description } = seo(locale);
  const C = getAboutCopy(locale);
  const path = localePath(locale, PATH);
  const crumbs = [{ name: C.meta.title, path }];
  const jsonLd = graph(
    webPage({ path, name: title, description, type: "AboutPage", crumbs, extra: { about: { "@id": ORG_ID }, mainEntity: { "@id": ORG_ID }, author: { "@id": PERSON_ID } }, locale }),
    organization(locale),
    person(locale),
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
