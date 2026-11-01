import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Contact, Founder, Insights, PraiseToolBanner, Process, Projects, Services, TrustStrip } from "@/components/home/sections";
import { FaqSection } from "@/components/faq/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { ORG_ID, faqPage, graph, organization, person, webPage, website } from "@/lib/structured-data";

const seo = (locale: Locale) => {
  const { site } = getContent(locale);
  return locale === "en"
    ? {
        title: `${site.name} — Websites & Software · AI Training · Church Software`,
        description:
          "Lab98 builds custom websites, online stores and Mac/Windows software, teaches AI, and makes software for churches and mission organizations. We build from scratch and hand over the source code at launch.",
      }
    : {
        title: `${site.name} — 홈페이지·프로그램 제작 · AI 교육 · 교회 프로그램`,
        description:
          "홈페이지 제작, 쇼핑몰 제작, Mac·Windows 프로그램 개발부터 AI 교육, 교회·선교단체 프로그램까지 Lab98이 처음부터 맞춤으로 만들어요. 오픈할 때 소스 코드도 넘겨 드려요.",
      };
};

export const homeMetadata = (locale: Locale): Metadata => pageMetadata({ ...seo(locale), absoluteTitle: true, path: "/", locale });

// Fully static: all content comes from src/lib/content(.en).ts; motion and the D-day badge live in small client islands.
export function HomePage({ locale }: { locale: Locale }) {
  const { title, description } = seo(locale);
  const { faqs } = getContent(locale);
  const path = localePath(locale, "/");
  const jsonLd = graph(
    organization(locale),
    website(locale),
    person(locale),
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
