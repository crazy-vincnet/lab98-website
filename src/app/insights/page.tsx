import type { Metadata } from "next";
import { InsightRow } from "@/components/cards";
import { INSIGHTS_PATH } from "@/components/experiments/paths";
import { notesCopy as t } from "@/components/notes/copy";
import { FeaturedInsight } from "@/components/notes/featured-insight";
import { sortedNotes } from "@/components/notes/sorted";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: INSIGHTS_PATH },
};

export default function InsightsPage() {
  const [featured, ...rest] = sortedNotes;

  return (
    <>
      <section className="wrap pb-10 pt-14 md:pb-14 md:pt-24">
        <p className="label animate-rise text-gray">{t.index.eyebrow}</p>
        <h1 className="mt-5 animate-rise text-h1 text-balance">{t.index.title}</h1>
        <p className="mt-5 max-w-[640px] animate-rise text-lead text-pretty text-gray">{t.index.lead}</p>
      </section>
      <section className="wrap pb-20 md:pb-32" aria-label={t.index.listLabel}>
        {featured && <FeaturedInsight note={featured} />}
        {rest.length > 0 && (
          <div className="mt-12 md:mt-16">
            <p className="label ko-tight mb-4 text-gray">{t.index.moreLabel}</p>
            <ul className="border-t-2 border-ink">
              {rest.map((n) => (
                <li key={n.slug}>
                  <InsightRow note={n} headingLevel="h2" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
