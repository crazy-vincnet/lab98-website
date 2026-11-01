import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards";
import { getProjectsPageCopy } from "@/components/experiments/copy.en";
import { CtaBand } from "@/components/experiments/parts";
import { PROJECTS_PATH } from "@/components/experiments/paths";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { ORG_ID, breadcrumb, graph, projectList, webPage } from "@/lib/structured-data";

const seo = (locale: Locale) => {
  const t = getProjectsPageCopy(locale);
  const { projects } = getContent(locale);
  const first3 = projects.slice(0, 3).map((p) => p.client).join(", ");
  return locale === "en"
    ? {
        title: `${t.meta.title} — Organization website case studies`,
        description: `${projects.length} organization websites that Lab98 Dev planned, designed and built, including ${first3}, shown with their screens and key features.`,
      }
    : {
        title: `${t.meta.title} — 기관 홈페이지 제작 사례`,
        description: `${first3} 등 Lab98 Dev가 기획부터 디자인, 개발까지 맡은 기관 홈페이지 제작 사례 ${projects.length}건을 화면과 주요 기능으로 소개해요.`,
      };
};

export const projectsMetadata = (locale: Locale): Metadata => pageMetadata({ ...seo(locale), path: PROJECTS_PATH, locale });

export function ProjectsPage({ locale }: { locale: Locale }) {
  const t = getProjectsPageCopy(locale);
  const { projects } = getContent(locale);
  const { title, description } = seo(locale);
  const path = localePath(locale, PROJECTS_PATH);
  const crumbs = [{ name: t.meta.title, path }];
  const jsonLd = graph(
    webPage({
      path,
      name: title,
      description,
      type: "CollectionPage",
      crumbs,
      extra: { mainEntity: { "@id": projectList(projects, locale)["@id"] }, author: { "@id": ORG_ID } },
      locale,
    }),
    projectList(projects, locale),
    breadcrumb(path, crumbs, locale),
  );
  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="wrap pb-10 pt-14 md:pb-14 md:pt-24">
        <p className="label animate-rise text-gray">{t.index.eyebrow}</p>
        <h1 className="mt-5 animate-rise text-h1 text-balance">{t.index.title}</h1>
        <p className="mt-5 max-w-[720px] animate-rise text-lead text-pretty text-gray">
          {t.index.lead(projects.length)} {t.index.leadMore}
        </p>
        <p className="mt-8 font-mono text-meta font-bold">{t.index.count(projects.length)}</p>
      </section>
      <section className="wrap pb-20 md:pb-32" aria-label={t.index.listLabel}>
        <ul className="grid gap-6 border-t-2 border-ink pt-10 md:grid-cols-2 md:pt-12 xl:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} headingLevel="h2" locale={locale} />
            </li>
          ))}
        </ul>
      </section>
      <CtaBand eyebrow={t.cta.eyebrow} title={t.cta.title} lead={t.cta.lead} action={t.cta.action} locale={locale} />
    </>
  );
}
