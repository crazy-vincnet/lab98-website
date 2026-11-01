import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ContactBand,
  DivisionAbout,
  DivisionHero,
  DivisionProjects,
  OtherDivisions,
  PraiseToolFeature,
  Process,
  Services,
  StatusNotice,
  pad2,
} from "@/components/divisions/division-sections";
import { loadDivisionCopy } from "@/components/divisions/load";
import { divisionHref } from "@/components/experiments/paths";
import { FaqSection } from "@/components/faq/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { getSeoService } from "@/components/seo/seo-copy";
import type { DivisionSlug } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { getSiteContent } from "@/lib/site-content";
import { localePath, type Locale } from "@/lib/i18n";
import { breadcrumb, faqPage, graph, service, webPage } from "@/lib/structured-data";

export const serviceStaticParams = (locale: Locale = "ko") => getContent(locale).divisions.map((d) => ({ slug: d.slug }));

export async function serviceMetadata(locale: Locale, params: Promise<{ slug: string }>): Promise<Metadata> {
  const { slug } = await params;
  const division = getContent(locale).getDivision(slug);
  if (!division) return {};
  const { title, description } = await getSeoService(locale, division.slug);
  return pageMetadata({ title, absoluteTitle: true, description, path: divisionHref(division.slug), locale });
}

export async function ServicePage({ locale, params }: { locale: Locale; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { divisions, faqs, projects, getDivision } = await getSiteContent(locale); // admin-editable (divisions.data, projects.data, faq.*)
  const C = await loadDivisionCopy(locale);
  const division = getDivision(slug);
  if (!division) notFound();

  const divisionProjects = projects.filter((p) => p.division === division.slug);
  const others = divisions.filter((d) => d.slug !== division.slug);

  // Section indices follow the order the sections actually render.
  let n = 0;
  const next = () => pad2(++n);

  const path = localePath(locale, divisionHref(division.slug));
  const faq = faqs[division.slug];
  const crumbs = [{ name: division.name, path }];
  const svc = service(division, locale);
  const seo = await getSeoService(locale, division.slug);
  const jsonLd = graph(
    webPage({ path, name: seo.title, description: seo.description, crumbs, extra: { mainEntity: { "@id": svc["@id"] } }, locale }),
    svc,
    breadcrumb(path, crumbs, locale),
    faqPage(path, faq, locale),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <DivisionHero division={division} locale={locale} />
      <StatusNotice division={division} locale={locale} />
      {division.slug === "faith" && <PraiseToolFeature index={next()} locale={locale} />}
      <DivisionAbout division={division} index={next()} locale={locale} />
      <Services division={division} index={next()} locale={locale} />
      <Process division={division} index={next()} locale={locale} />
      {divisionProjects.length > 0 && <DivisionProjects items={divisionProjects} index={next()} locale={locale} />}
      <FaqSection items={faq} index={next()} locale={locale} />
      <OtherDivisions items={others} index={next()} locale={locale} />
      <ContactBand
        locale={locale}
        title={C.contactBand.byDivision[division.slug].title}
        lead={C.contactBand.divisionLead}
        cta={division.cta.label}
      />
    </>
  );
}
