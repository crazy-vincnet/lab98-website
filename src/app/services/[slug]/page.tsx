import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ContactBand,
  CycleTimeline,
  DivisionHero,
  OtherDivisions,
  RelatedExperiments,
  RelatedNotes,
  Services,
} from "@/components/divisions/division-sections";
import { divisionCopy } from "@/components/divisions/copy";
import { divisionHref } from "@/components/experiments/paths";
import { divisions, experiments, getDivision, notes, symbolSrc } from "@/lib/content";

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
  const meta = divisionCopy.meta[division.slug];
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: divisionHref(division.slug) },
    openGraph: { title: meta.title, description: meta.description, images: [symbolSrc(division.slug)] },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const division = getDivision(slug);
  if (!division) notFound();

  const relatedExperiments = experiments.filter((e) => e.division === division.slug);
  const relatedNotes = notes.filter((n) => n.division === division.slug).sort((a, b) => b.date.localeCompare(a.date));
  const others = divisions.filter((d) => d.slug !== division.slug);

  return (
    <>
      <DivisionHero division={division} experimentCount={relatedExperiments.length} />
      <Services division={division} />
      <CycleTimeline division={division} />
      <RelatedExperiments division={division} items={relatedExperiments} />
      <RelatedNotes items={relatedNotes} />
      <OtherDivisions items={others} index={divisionCopy.others.index(relatedNotes.length > 0 ? 5 : 4)} />
      <ContactBand {...divisionCopy.contactBand.byDivision[division.slug]} />
    </>
  );
}
