import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Contact, Founder, Insights, PraiseToolBanner, Process, Projects, Services, TrustStrip } from "@/components/home/sections";
import { FaqSection } from "@/components/faq/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { faqs, site } from "@/lib/content";
import { ORG_ID, faqPage, graph, organization, person, webPage, website } from "@/lib/structured-data";

const title = `${site.name} — 홈페이지·프로그램 제작 · AI 교육 · 교회 프로그램`;
const description =
  "홈페이지 제작, 쇼핑몰 제작, Mac·Windows 프로그램 개발부터 AI 교육, 교회·선교단체 프로그램까지 Lab98이 처음부터 맞춤으로 만들어요. 오픈할 때 소스 코드도 넘겨 드려요.";

export const metadata: Metadata = pageMetadata({ title, absoluteTitle: true, description, path: "/" });

const jsonLd = graph(
  organization(),
  website(),
  person(),
  webPage({ path: "/", name: title, description, extra: { about: { "@id": ORG_ID } } }),
  faqPage("/", faqs.home),
);

// Fully static: all content comes from src/lib/content.ts; motion and the D-day badge live in small client islands.
export default function Home() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <TrustStrip />
      <PraiseToolBanner />
      <Services />
      <Projects />
      <Process />
      <Founder />
      <Insights />
      <FaqSection items={faqs.home} />
      <Contact />
    </>
  );
}
