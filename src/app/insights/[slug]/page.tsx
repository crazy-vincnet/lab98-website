import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INSIGHTS_PATH, insightHref } from "@/components/experiments/paths";
import { notesCopy } from "@/components/notes/copy";
import { DivisionDot, MetaLine } from "@/components/experiments/parts";
import { NoteBody } from "@/components/notes/note-body";
import { ContactBand } from "@/components/divisions/division-sections";
import { sortedNotes } from "@/components/notes/sorted";
import { ProjectCard } from "@/components/cards";
import { cx } from "@/components/ui";
import { divisionTheme, formatDate, getExperiment, getNote, type Note } from "@/lib/content";

const t = notesCopy.detail;

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return sortedNotes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: notesCopy.meta.notFoundTitle };
  return {
    title: { absolute: notesCopy.meta.detailTitle(note.title) },
    description: note.excerpt,
    authors: [{ name: note.author }],
    openGraph: { type: "article", title: note.title, description: note.excerpt, publishedTime: note.date },
  };
}

export default async function NotePage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const experiment = note.experiment ? getExperiment(note.experiment) : undefined;
  const index = sortedNotes.findIndex((n) => n.slug === note.slug);
  const newer = sortedNotes[index - 1];
  const older = sortedNotes[index + 1];

  return (
    <>
      <div className="wrap pt-8 md:pt-12">
        <Link href={INSIGHTS_PATH} className="label inline-flex min-h-11 items-center gap-2 tracking-normal text-gray underline-offset-4 hover:text-ink hover:underline hover:decoration-2">
          {t.back}
        </Link>
      </div>

      <div className="wrap grid gap-12 pb-16 pt-8 md:pb-24 md:pt-12 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,680px)_340px] xl:justify-between">
        <article className="min-w-0">
          <header className="border-b-2 border-ink pb-10">
            <MetaLine
              className="font-mono text-meta text-gray"
              items={[
                <span key="d" className="inline-flex items-center gap-2 uppercase">
                  <DivisionDot division={note.division} className="size-2" />
                  {divisionTheme[note.division].name}
                </span>,
                <span key="r" className="ko-tight">
                  {notesCopy.list.readTime(note.readingMinutes)}
                </span>,
                <time key="t" dateTime={note.date}>
                  {formatDate(note.date)}
                </time>,
                note.author,
              ]}
            />
            <h1 className="mt-6 animate-rise text-h1 text-balance">{note.title}</h1>
            <p className="mt-5 text-lead text-pretty text-gray">{note.excerpt}</p>
          </header>
          <div className="pt-10">
            <NoteBody blocks={note.body} />
          </div>
          <p className="mt-14 border-t-2 border-ink pt-5 font-mono text-meta text-gray">
            <span className="ko-tight">{t.writtenBy}</span> {note.author} · <time dateTime={note.date}>{formatDate(note.date)}</time>
          </p>
        </article>

        {experiment && (
          <aside aria-labelledby="related-project" className="lg:pt-2">
            <div className="lg:sticky lg:top-[120px]">
              <h2 id="related-project" className="label mb-3 tracking-normal text-gray">
                {t.experimentCard.label}
              </h2>
              <ProjectCard project={experiment} headingLevel="h3" />
            </div>
          </aside>
        )}
      </div>

      {/* Prev / next — a single item spans the full width (no empty cell). */}
      <nav aria-label={t.pager.label} className="wrap pb-20 md:pb-32">
        {(older || newer) && (
          <div className={cx("grid gap-[2px] border-2 border-ink bg-ink", older && newer && "sm:grid-cols-2")}>
            {older && <PagerLink note={older} dir="prev" />}
            {newer && <PagerLink note={newer} dir="next" alignEnd={!!older} />}
          </div>
        )}
        <Link href={INSIGHTS_PATH} className="label mt-8 inline-flex min-h-11 items-center gap-2 tracking-normal underline-offset-4 hover:underline hover:decoration-2">
          {t.backBottom}
        </Link>
      </nav>
      <ContactBand title={t.contactBand.title} cta={t.contactBand.cta} />
    </>
  );
}

function PagerLink({ note, dir, alignEnd = false }: { note: Note; dir: "prev" | "next"; alignEnd?: boolean }) {
  return (
    <Link
      href={insightHref(note.slug)}
      className={cx("group flex flex-col gap-2 bg-paper p-6 transition-colors duration-150 hover:bg-ink hover:text-paper md:p-8", alignEnd && "sm:items-end sm:text-right")}
    >
      <span className="label tracking-normal text-gray group-hover:text-ink-text">{dir === "prev" ? t.pager.prev : t.pager.next}</span>
      <time dateTime={note.date} className="font-mono text-meta text-gray group-hover:text-ink-text">
        {formatDate(note.date)}
      </time>
      <span className="text-title text-balance">{note.title}</span>
    </Link>
  );
}
