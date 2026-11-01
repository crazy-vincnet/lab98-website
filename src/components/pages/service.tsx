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
import { getDivisionCopy } from "@/components/divisions/copy.en";
import { divisionHref } from "@/components/experiments/paths";
import { FaqSection } from "@/components/faq/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import type { DivisionSlug } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { breadcrumb, faqPage, graph, service, webPage } from "@/lib/structured-data";

/** Search titles/descriptions per service page (absolute: the division name already carries the brand). */
const seo: Record<Locale, Record<DivisionSlug, { title: string; description: string }>> = {
  ko: {
    dev: {
      title: "홈페이지·쇼핑몰·프로그램 제작 | Lab98 Dev",
      description:
        "회사 홈페이지 제작, 쇼핑몰 제작, Mac·Windows 프로그램 개발을 템플릿 없이 맞춤으로 해요. 200만 원부터 시작하고, 오픈할 때 소스 코드까지 넘겨 드려요.",
    },
    ai: {
      title: "AI 교육 · 학교·기업 AI 강의 | Lab98 AI",
      description:
        "온라인·오프라인 AI 교육과 학교·기업 맞춤 AI 강의를 진행해요. 실습 중심으로 AI를 업무와 수업에 바로 쓰는 법을 알려 드리고, AI 커뮤니티도 열 예정이에요.",
    },
    faith: {
      title: "교회·선교단체 프로그램 제작 | Lab98 Faith",
      description:
        "교회와 선교단체에 필요한 프로그램을 만들고 배포하고 운영해요. 첫 제품은 찬양 가사 송출 프로그램 Praise Tool이고, 사역에 맞춘 교회 프로그램 제작도 맡아요.",
    },
  },
  en: {
    dev: {
      title: "Websites, Online Stores & Software Development | Lab98 Dev",
      description:
        "Custom company websites, online stores and Mac/Windows software, built without templates. Projects start at KRW 2M, and we hand over the source code at launch.",
    },
    ai: {
      title: "AI Training for Schools & Companies | Lab98 AI",
      description:
        "Online and in-person AI training, with courses tailored to schools and companies. Hands-on sessions that show you how to use AI in work and class right away; an AI community is on the way.",
    },
    faith: {
      title: "Software for Churches & Mission Organizations | Lab98 Faith",
      description:
        "We build, ship and operate software for churches and mission organizations. Our first product is Praise Tool, lyrics presentation software for worship, and we also build custom ministry software.",
    },
  },
};

export const serviceStaticParams = (locale: Locale = "ko") => getContent(locale).divisions.map((d) => ({ slug: d.slug }));

export async function serviceMetadata(locale: Locale, params: Promise<{ slug: string }>): Promise<Metadata> {
  const { slug } = await params;
  const division = getContent(locale).getDivision(slug);
  if (!division) return {};
  const { title, description } = seo[locale][division.slug];
  return pageMetadata({ title, absoluteTitle: true, description, path: divisionHref(division.slug), locale });
}

export async function ServicePage({ locale, params }: { locale: Locale; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { divisions, faqs, projects, getDivision } = getContent(locale);
  const C = getDivisionCopy(locale);
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
  const jsonLd = graph(
    webPage({ path, name: seo[locale][division.slug].title, description: seo[locale][division.slug].description, crumbs, extra: { mainEntity: { "@id": svc["@id"] } }, locale }),
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
