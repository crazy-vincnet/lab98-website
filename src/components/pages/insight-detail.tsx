import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, DivisionDot, MetaLine, Pager } from "@/components/experiments/parts";
import { divisionHref, INSIGHTS_PATH, insightHref, PRAISE_TOOL_PATH } from "@/components/experiments/paths";
import { getNotesCopy } from "@/components/notes/copy.en";
import { loadNotesCopy } from "@/components/notes/load";
import { fill } from "@/lib/fill-template";
import { NoteBody } from "@/components/notes/note-body";
import { RichBody } from "@/components/notes/rich-body";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { divisionTheme, formatDate, type DivisionSlug } from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n";
import { getInsight, getInsightLanguages, getInsights, getInsightSlugs, type InsightItem } from "@/lib/insights";
import { blogPosting, breadcrumb, graph, webPage } from "@/lib/structured-data";

/** Static notes + posts that are live at build time. Posts added later are rendered on first visit and cached (tag `posts`). */
export const insightStaticParams = (locale: Locale = "ko") => getInsightSlugs(locale);

export async function insightMetadata(locale: Locale, params: Promise<{ slug: string }>): Promise<Metadata> {
  const { slug } = await params;
  const notesCopy = getNotesCopy(locale);
  const note = await getInsight(locale, slug);
  if (!note) return { title: notesCopy.meta.notFoundTitle, robots: { index: false } };
  const meta = pageMetadata({
    title: notesCopy.meta.detailTitle(note.metaTitle || note.title),
    absoluteTitle: true,
    ogTitle: note.metaTitle || note.title,
    description: note.metaDescription || note.excerpt,
    path: insightHref(note.slug),
    type: "article",
    publishedTime: note.published ?? note.date,
    modifiedTime: note.updated ?? note.published ?? note.date,
    authors: [note.author],
    locale,
    // A post's own social image (SEO field) replaces the generated card.
    ...(note.ogImage ? { images: [{ url: note.ogImage.url, alt: note.ogImage.alt || note.title }] } : {}),
  });
  // DB posts only list a hreflang twin when the other language really exists (static notes exist in both).
  const languages = note.source === "db" ? await getInsightLanguages(note, locale) : undefined;
  return {
    ...meta,
    alternates: note.source === "db" ? { canonical: meta.alternates?.canonical, ...(languages ? { languages } : {}) } : meta.alternates,
    authors: [{ name: note.author, url: localePath(locale, "/about") }],
  };
}

export async function InsightPage({ locale, params }: { locale: Locale; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const notesCopy = await loadNotesCopy(locale);
  const lp = (path: string) => localePath(locale, path);
  const note = await getInsight(locale, slug);
  if (!note) notFound();

  const sortedNotes = await getInsights(locale);
  const index = sortedNotes.findIndex((n) => n.slug === note.slug);
  const newer = sortedNotes[index - 1];
  const older = sortedNotes[index + 1];

  const path = lp(insightHref(note.slug));
  const crumbs = [
    { name: notesCopy.meta.title, path: lp(INSIGHTS_PATH) },
    { name: note.title, path },
  ];
  const post = blogPosting(note, locale);
  const jsonLd = graph(
    webPage({ path, name: note.title, description: note.excerpt, crumbs, extra: { mainEntity: { "@id": post["@id"] }, datePublished: note.date }, locale }),
    post,
    breadcrumb(path, crumbs, locale),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <InsightArticle note={note} locale={locale} newer={newer} older={older} />
    </>
  );
}

/** The article itself (header, body, pager, CTA). Shared by the public page and the admin preview, so they cannot drift. */
export async function InsightArticle({ note, locale, newer, older }: { note: InsightItem; locale: Locale; newer?: InsightItem; older?: InsightItem }) {
  const notesCopy = await loadNotesCopy(locale);
  const t = notesCopy.detail;
  const lp = (path: string) => localePath(locale, path);
  const explore = [
    ...t.explore.services.map((s) => ({ href: lp(divisionHref(s.slug)), title: s.title, body: s.body, division: s.slug as DivisionSlug })),
    { href: lp(PRAISE_TOOL_PATH), title: t.explore.praiseTool.title, body: t.explore.praiseTool.body, division: "faith" as DivisionSlug },
  ];

  return (
    <>
      <div className="wrap pt-8 md:pt-12">
        <Link href={lp(INSIGHTS_PATH)} className="label ko-tight inline-flex min-h-11 items-center gap-2 text-gray underline-offset-4 hover:text-ink hover:underline hover:decoration-2">
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
                  {formatDate(note.date, locale)}
                </time>,
                <span key="r" className="ko-tight">
                  {fill(notesCopy.list.readTime, { min: note.readingMinutes })}
                </span>,
              ]}
            />
            <h1 className="mt-6 animate-rise text-h1 text-balance">{note.title}</h1>
            <p className="mt-5 text-lead text-pretty text-gray">{note.excerpt}</p>
            <p className="mt-6 text-body-sm">
              <span className="text-gray">{t.writtenBy}</span> <span className="font-bold">{note.author}</span>
            </p>
          </header>
          {note.cover && (
            <figure className="mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element -- storage URL, size known from the media library */}
              <img src={note.cover.url} alt={note.cover.alt} width={note.cover.width ?? undefined} height={note.cover.height ?? undefined} decoding="async" className="h-auto w-full border-2 border-ink" />
            </figure>
          )}
          <div className="pt-10">{note.doc ? <RichBody doc={note.doc} /> : <NoteBody blocks={note.body} />}</div>
          <p className="mt-14 flex flex-wrap gap-x-2 border-t-2 border-ink pt-5 text-body-sm text-gray">
            <span>
              {t.writtenBy} <b className="text-ink">{note.author}</b>
            </span>
            <span aria-hidden>·</span>
            <time dateTime={note.date} className="font-mono text-meta">
              {formatDate(note.date, locale)}
            </time>
          </p>
        </div>
      </article>

      <div className="wrap pb-20 md:pb-32">
        <Pager
          label={t.pager.label}
          prev={older && { href: lp(insightHref(older.slug)), dirLabel: t.pager.prev, meta: formatDate(older.date, locale), title: older.title }}
          next={newer && { href: lp(insightHref(newer.slug)), dirLabel: t.pager.next, meta: formatDate(newer.date, locale), title: newer.title }}
        />
        <Link href={lp(INSIGHTS_PATH)} className="label ko-tight mt-8 inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline hover:decoration-2">
          {t.backBottom}
        </Link>
      </div>

      <CtaBand eyebrow={t.cta.eyebrow} title={t.cta.title} lead={t.cta.lead} action={t.cta.action} locale={locale}>
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
