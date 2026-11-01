import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards";
import { getProjectsPageCopy } from "@/components/experiments/copy.en";
import { loadProjectsPageCopy } from "@/components/experiments/load";
import { fill } from "@/lib/fill-template";
import { CtaBand } from "@/components/experiments/parts";
import { PROJECTS_PATH } from "@/components/experiments/paths";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { getSeoPage } from "@/components/seo/seo-copy";
import { getContent } from "@/lib/get-content";
import { getSiteContent } from "@/lib/site-content";
import { localePath, type Locale } from "@/lib/i18n";
import { ORG_ID, breadcrumb, graph, projectList, webPage } from "@/lib/structured-data";

export const projectsMetadata = async (locale: Locale): Promise<Metadata> =>
  pageMetadata({ ...(await getSeoPage("projects", locale)), path: PROJECTS_PATH, locale });

export async function ProjectsPage({ locale }: { locale: Locale }) {
  const t = await loadProjectsPageCopy(locale);
  const { projects } = await getSiteContent(locale); // admin-editable (projects.data)
  const { title, description } = await getSeoPage("projects", locale);
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
          {fill(t.index.lead, { count: projects.length })} {t.index.leadMore}
        </p>
        <p className="mt-8 font-mono text-meta font-bold">{fill(t.index.count, { count: projects.length })}</p>
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
