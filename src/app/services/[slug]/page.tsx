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
import { divisionCopy } from "@/components/divisions/copy";
import { divisionHref } from "@/components/experiments/paths";
import { FaqSection } from "@/components/faq/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { divisions, faqs, getDivision, projects, type DivisionSlug } from "@/lib/content";
import { breadcrumb, faqPage, graph, service, webPage } from "@/lib/structured-data";

/** Search titles/descriptions per service page (absolute: the division name already carries the brand). */
const seo: Record<DivisionSlug, { title: string; description: string }> = {
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
};

// Service (division) pages are public, content-only pages: require complete static output.
// See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/ensureStatic.md
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return divisions.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const division = getDivision(slug);
  if (!division) return {};
  const { title, description } = seo[division.slug];
  return pageMetadata({ title, absoluteTitle: true, description, path: divisionHref(division.slug) });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const division = getDivision(slug);
  if (!division) notFound();

  const divisionProjects = projects.filter((p) => p.division === division.slug);
  const others = divisions.filter((d) => d.slug !== division.slug);

  // Section indices follow the order the sections actually render.
  let n = 0;
  const next = () => pad2(++n);

  const path = divisionHref(division.slug);
  const faq = faqs[division.slug];
  const crumbs = [{ name: division.name, path }];
  const svc = service(division);
  const jsonLd = graph(
    webPage({ path, name: seo[division.slug].title, description: seo[division.slug].description, crumbs, extra: { mainEntity: { "@id": svc["@id"] } } }),
    svc,
    breadcrumb(path, crumbs),
    faqPage(path, faq),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <DivisionHero division={division} />
      <StatusNotice division={division} />
      {division.slug === "faith" && <PraiseToolFeature index={next()} />}
      <DivisionAbout division={division} index={next()} />
      <Services division={division} index={next()} />
      <Process division={division} index={next()} />
      {divisionProjects.length > 0 && <DivisionProjects items={divisionProjects} index={next()} />}
      <FaqSection items={faq} index={next()} />
      <OtherDivisions items={others} index={next()} />
      <ContactBand
        title={divisionCopy.contactBand.byDivision[division.slug].title}
        lead={divisionCopy.contactBand.divisionLead}
        cta={division.cta.label}
      />
    </>
  );
}
