import Link from "next/link";
import { insightHref } from "@/components/experiments/paths";
import { DivisionDot, MetaLine } from "@/components/experiments/parts";
import { divisionTheme, formatDate, type Note } from "@/lib/content";
import { notesCopy as t } from "./copy";

/**
 * Hero item of the insights list. White card with a 2px border and a black top bar
 * (keeps the page near the 30% black target). Hover follows the canonical cards:
 * no layout shift, title underline, arrow nudge, bottom CTA bar inverts.
 */
export function FeaturedInsight({ note, experimentLabel }: { note: Note; experimentLabel?: string }) {
  return (
    <Link href={insightHref(note.slug)} className="group mt-10 flex flex-col border-2 border-ink bg-paper md:mt-12">
      <p className="flex items-center justify-between gap-4 bg-ink px-6 py-3 text-paper md:px-10">
        <span className="label">{t.list.featured}</span>
        <span className="font-mono text-meta" aria-hidden>
          {String(note.readingMinutes).padStart(2, "0")} {t.list.min}
        </span>
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
            experimentLabel,
            <span key="r" className="ko-tight">
              {t.list.readTime(note.readingMinutes)}
            </span>,
            <time key="t" dateTime={note.date}>
              {formatDate(note.date)}
            </time>,
          ]}
        />
      </div>
      <div className="flex items-center justify-between border-t-2 border-ink px-6 py-4 text-body-sm font-bold transition-colors group-hover:bg-ink group-hover:text-paper md:px-10">
        {t.list.read}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
