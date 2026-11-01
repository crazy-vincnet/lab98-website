import type { Metadata } from "next";
import { InsightRow } from "@/components/cards";
import { MetaLine } from "@/components/experiments/parts";
import { notesCopy as t } from "@/components/notes/copy";
import { FeaturedInsight } from "@/components/notes/featured-insight";
import { NoteIndex } from "@/components/notes/note-index";
import { noteExperimentLabel, sortedNotes } from "@/components/notes/sorted";
import { formatDate } from "@/lib/content";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export default function InsightsPage() {
  const items = sortedNotes.map(({ slug, division }) => ({ slug, division }));
  // Any note can become the featured one once a filter is applied, so render both forms.
  const featured = Object.fromEntries(sortedNotes.map((n) => [n.slug, <FeaturedInsight key={n.slug} note={n} experimentLabel={noteExperimentLabel(n.experiment)} />]));
  const rows = Object.fromEntries(sortedNotes.map((n) => [n.slug, <InsightRow key={n.slug} note={n} headingLevel="h2" />]));
  const latest = sortedNotes[0];

  return (
    <>
      <section className="wrap pb-10 pt-14 md:pb-14 md:pt-24">
        <p className="label animate-rise text-gray">{t.index.eyebrow}</p>
        <h1 className="mt-5 animate-rise text-h1 text-balance">{t.index.title}</h1>
        <p className="mt-5 max-w-[640px] animate-rise text-lead text-pretty text-gray">{t.index.lead}</p>
        <p className="mt-8">
          <MetaLine
            className="font-mono text-meta font-bold"
            items={[`${sortedNotes.length} ${t.index.summaryNoun}`, `${t.index.latest} ${latest ? formatDate(latest.date) : "—"}`]}
          />
        </p>
      </section>
      <section className="wrap pb-20 md:pb-32" aria-label={t.index.listLabel}>
        <NoteIndex items={items} featured={featured} rows={rows} />
      </section>
    </>
  );
}
