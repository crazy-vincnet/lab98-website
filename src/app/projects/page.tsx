import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards";
import { projectsCopy as t } from "@/components/experiments/copy";
import { CtaBand } from "@/components/experiments/parts";
import { PROJECTS_PATH } from "@/components/experiments/paths";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { projects } from "@/lib/content";
import { ORG_ID, breadcrumb, graph, projectList, webPage } from "@/lib/structured-data";

export const ensureStatic = "navigation";

const title = `${t.meta.title} — 기관 홈페이지 제작 사례`;
const description = `${projects
  .slice(0, 3)
  .map((p) => p.client)
  .join(", ")} 등 Lab98 Dev가 기획부터 디자인, 개발까지 맡은 기관 홈페이지 제작 사례 ${projects.length}건을 화면과 주요 기능으로 소개해요.`;

export const metadata: Metadata = pageMetadata({ title, description, path: PROJECTS_PATH });

const crumbs = [{ name: t.meta.title, path: PROJECTS_PATH }];
const jsonLd = graph(
  webPage({
    path: PROJECTS_PATH,
    name: title,
    description,
    type: "CollectionPage",
    crumbs,
    extra: { mainEntity: { "@id": projectList(projects)["@id"] }, author: { "@id": ORG_ID } },
  }),
  projectList(projects),
  breadcrumb(PROJECTS_PATH, crumbs),
);

export default function ProjectsPage() {
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
              <ProjectCard project={p} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </section>
      <CtaBand eyebrow={t.cta.eyebrow} title={t.cta.title} lead={t.cta.lead} action={t.cta.action} />
    </>
  );
}
