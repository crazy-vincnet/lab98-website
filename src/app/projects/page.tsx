import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards";
import { projectsCopy as t } from "@/components/experiments/copy";
import { CtaBand } from "@/components/experiments/parts";
import { PROJECTS_PATH } from "@/components/experiments/paths";
import { projects } from "@/lib/content";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: PROJECTS_PATH },
};

export default function ProjectsPage() {
  return (
    <>
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
