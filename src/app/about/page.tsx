import type { Metadata } from "next";
import { AboutHero, DivisionsOverview, FounderWords, NameMeaning, Principles, Team } from "@/components/about/about-sections";
import { ContactBand } from "@/components/divisions/division-sections";
import { aboutCopy } from "@/components/about/copy";
import { routes } from "@/components/divisions/copy";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { site } from "@/lib/content";
import { ORG_ID, PERSON_ID, breadcrumb, graph, organization, person, webPage } from "@/lib/structured-data";

const PATH = "/about";
const title = "회사 소개 — 사람을 돕는 기술";
const description = `${site.name}은 홈페이지·프로그램 제작(Dev), AI 교육(AI), 교회 프로그램(Faith)을 하는 회사예요. 이름에 담긴 98의 뜻과 파운더 ${site.founder.display}을 소개해요.`;

export const metadata: Metadata = pageMetadata({ title, description, path: PATH });

const crumbs = [{ name: aboutCopy.meta.title, path: PATH }];
const jsonLd = graph(
  webPage({ path: PATH, name: title, description, type: "AboutPage", crumbs, extra: { about: { "@id": ORG_ID }, mainEntity: { "@id": ORG_ID }, author: { "@id": PERSON_ID } } }),
  organization(),
  person(),
  breadcrumb(PATH, crumbs),
);

export default function AboutPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <AboutHero />
      <FounderWords />
      <NameMeaning />
      <DivisionsOverview />
      <Principles />
      <Team />
      <ContactBand
        title={aboutCopy.contactBand.title}
        lead={aboutCopy.contactBand.lead}
        cta={aboutCopy.contactBand.cta}
        secondary={{ label: aboutCopy.contactBand.secondaryCta, href: routes.projects }}
      />
    </>
  );
}
