import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, DivisionDot, MetaLine, Pager } from "@/components/experiments/parts";
import { divisionHref, INSIGHTS_PATH, insightHref, PRAISE_TOOL_PATH } from "@/components/experiments/paths";
import { notesCopy } from "@/components/notes/copy";
import { NoteBody } from "@/components/notes/note-body";
import { sortedNotes } from "@/components/notes/sorted";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { divisionTheme, formatDate, getNote, type DivisionSlug } from "@/lib/content";
import { blogPosting, breadcrumb, graph, webPage } from "@/lib/structured-data";

const t = notesCopy.detail;

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return sortedNotes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: notesCopy.meta.notFoundTitle, robots: { index: false } };
  return {
    ...pageMetadata({
      title: notesCopy.meta.detailTitle(note.title),
      absoluteTitle: true,
      ogTitle: note.title,
      description: note.excerpt,
      path: insightHref(note.slug),
      type: "article",
      publishedTime: note.date,
      modifiedTime: note.date,
      authors: [note.author],
    }),
    authors: [{ name: note.author, url: "/about" }],
  };
}

export default async function NotePage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const index = sortedNotes.findIndex((n) => n.slug === note.slug);
  const newer = sortedNotes[index - 1];
  const older = sortedNotes[index + 1];

  const path = insightHref(note.slug);
  const crumbs = [
    { name: notesCopy.meta.title, path: INSIGHTS_PATH },
    { name: note.title, path },
  ];
  const post = blogPosting(note);
  const jsonLd = graph(
    webPage({ path, name: note.title, description: note.excerpt, crumbs, extra: { mainEntity: { "@id": post["@id"] }, datePublished: note.date } }),
    post,
    breadcrumb(path, crumbs),
  );

  const explore = [
    ...t.explore.services.map((s) => ({ href: divisionHref(s.slug), title: s.title, body: s.body, division: s.slug })),
    { href: PRAISE_TOOL_PATH, title: t.explore.praiseTool.title, body: t.explore.praiseTool.body, division: "faith" as DivisionSlug },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="wrap pt-8 md:pt-12">
        <Link href={INSIGHTS_PATH} className="label ko-tight inline-flex min-h-11 items-center gap-2 text-gray underline-offset-4 hover:text-ink hover:underline hover:decoration-2">
          {t.back}
        </Link>
      </div>

      <article className="wrap pb-12 pt-8 md:pb-16 md:pt-12">
        <div className="max-w-[720px]">
          <header className="border-b-2 border-ink pb-10">
            <MetaLine
              className="font-mono text-meta text-gray"
              items={[
                <span key="d" className="inline-flex items-center gap-2 uppercase">
                  <DivisionDot division={note.division} className="size-2" />
                  {divisionTheme[note.division].name}
                </span>,
                <time key="t" dateTime={note.date}>
                  {formatDate(note.date)}
                </time>,
                <span key="r" className="ko-tight">
                  {notesCopy.list.readTime(note.readingMinutes)}
                </span>,
              ]}
            />
            <h1 className="mt-6 animate-rise text-h1 text-balance">{note.title}</h1>
            <p className="mt-5 text-lead text-pretty text-gray">{note.excerpt}</p>
            <p className="mt-6 text-body-sm">
              <span className="text-gray">{t.writtenBy}</span> <span className="font-bold">{note.author}</span>
            </p>
          </header>
          <div className="pt-10">
            <NoteBody blocks={note.body} />
          </div>
          <p className="mt-14 flex flex-wrap gap-x-2 border-t-2 border-ink pt-5 text-body-sm text-gray">
            <span>
              {t.writtenBy} <b className="text-ink">{note.author}</b>
            </span>
            <span aria-hidden>·</span>
            <time dateTime={note.date} className="font-mono text-meta">
              {formatDate(note.date)}
            </time>
          </p>
        </div>
      </article>

      <div className="wrap pb-20 md:pb-32">
        <Pager
          label={t.pager.label}
          prev={older && { href: insightHref(older.slug), dirLabel: t.pager.prev, meta: formatDate(older.date), title: older.title }}
          next={newer && { href: insightHref(newer.slug), dirLabel: t.pager.next, meta: formatDate(newer.date), title: newer.title }}
        />
        <Link href={INSIGHTS_PATH} className="label ko-tight mt-8 inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline hover:decoration-2">
          {t.backBottom}
        </Link>
      </div>

      <CtaBand eyebrow={t.cta.eyebrow} title={t.cta.title} lead={t.cta.lead} action={t.cta.action}>
        <nav aria-label={t.explore.label} className="mt-12 md:mt-16">
          <p className="label ko-tight mb-4 text-gray">{t.explore.label}</p>
          <ul className="grid gap-[2px] border-2 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
            {explore.map((e) => (
              <li key={e.href} className="flex">
                <Link href={e.href} className="group flex min-h-11 w-full flex-col gap-1 bg-paper p-5 transition-colors hover:bg-ink hover:text-paper md:p-6">
                  <span className="flex items-center justify-between gap-3 text-title-sm">
                    <span className="flex items-center gap-2">
                      <DivisionDot division={e.division} className="size-2" />
                      {e.title}
                    </span>
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                  <span className="text-body-sm text-gray group-hover:text-ink-text">{e.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </CtaBand>

    </>
  );
}
