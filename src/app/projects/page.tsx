import type { Metadata } from "next";
import { ExperimentIndex } from "@/components/experiments/experiment-index";
import { experimentsCopy as t } from "@/components/experiments/copy";
import { MetaLine, experimentSummaryParts } from "@/components/experiments/parts";
import { experiments } from "@/lib/content";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export default function ProjectsPage() {
  return (
    <>
      <section className="wrap pb-10 pt-14 md:pb-14 md:pt-24">
        <p className="label animate-rise text-gray">{t.index.eyebrow}</p>
        <h1 className="mt-5 animate-rise text-h1 text-balance">{t.index.title}</h1>
        <p className="mt-5 max-w-[640px] animate-rise text-lead text-pretty text-gray">{t.index.lead}</p>
        <p className="mt-8">
          <MetaLine items={experimentSummaryParts(experiments)} className="font-mono text-meta font-bold" />
        </p>
      </section>
      <section className="wrap pb-20 md:pb-32" aria-label={t.index.listLabel}>
        <ExperimentIndex experiments={experiments} />
      </section>
    </>
  );
}
