import Link from "next/link";
import { insightHref } from "@/components/experiments/paths";
import { DivisionDot, MetaLine } from "@/components/experiments/parts";
import { divisionTheme, formatDate, type Note } from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n";
import { getNotesCopy } from "./copy.en";

/**
 * Hero item of the insights list. White card with a 2px border and a black top bar.
 * Hover follows the canonical cards: no layout shift, title underline, arrow nudge, bottom CTA bar inverts.
 */
export function FeaturedInsight({ note, locale = "ko" }: { note: Note; locale?: Locale }) {
  const t = getNotesCopy(locale);
  return (
    <Link href={localePath(locale, insightHref(note.slug))} className="group flex flex-col border-2 border-ink bg-paper">
      <p className="flex items-center justify-between gap-4 bg-ink px-6 py-3 text-paper md:px-10">
        <span className="label">{t.list.featured}</span>
        <time dateTime={note.date} className="font-mono text-meta">
          {formatDate(note.date, locale)}
        </time>
      </p>
      <div className="flex flex-col gap-5 p-6 md:p-10 xl:p-14">
        <h2 className="text-h2 text-balance underline-offset-8 group-hover:underline">{note.title}</h2>
        <p className="max-w-[640px] text-lead text-pretty text-gray">{note.excerpt}</p>
        <MetaLine
          className="font-mono text-meta text-gray"
          items={[
            <span key="d" className="inline-flex items-center gap-2 uppercase">
              <DivisionDot division={note.division} className="size-2" />
              {divisionTheme[note.division].name}
            </span>,
            <span key="a" className="font-sans ko-tight">
              {t.list.by} {note.author}
            </span>,
            <span key="r" className="ko-tight">
              {t.list.readTime(note.readingMinutes)}
            </span>,
          ]}
        />
      </div>
      <div className="flex min-h-11 items-center justify-between border-t-2 border-ink px-6 py-4 text-body-sm font-bold transition-colors group-hover:bg-ink group-hover:text-paper md:px-10">
        {t.list.read}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
