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
import { divisions, getDivision, projects, symbolSrc } from "@/lib/content";

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
  // Absolute: the division name already carries the brand ("웹·프로그램 제작 | Lab98 Dev").
  const title = `${division.role} | ${division.name}`;
  return {
    title: { absolute: title },
    description: division.summary,
    alternates: { canonical: divisionHref(division.slug) },
    openGraph: { title, description: division.summary, images: [symbolSrc(division.slug)] },
  };
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

  return (
    <>
      <DivisionHero division={division} />
      <StatusNotice division={division} />
      {division.slug === "faith" && <PraiseToolFeature index={next()} />}
      <DivisionAbout division={division} index={next()} />
      <Services division={division} index={next()} />
      <Process division={division} index={next()} />
      {divisionProjects.length > 0 && <DivisionProjects items={divisionProjects} index={next()} />}
      <OtherDivisions items={others} index={next()} />
      <ContactBand
        title={divisionCopy.contactBand.byDivision[division.slug].title}
        lead={divisionCopy.contactBand.divisionLead}
        cta={division.cta.label}
      />
    </>
  );
}
