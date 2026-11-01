import Image from "next/image";
import Link from "next/link";
import { divisionTheme, formatDate, type Note, type Project } from "@/lib/content";
import { cx } from "@/components/ui";
import { insightHref, projectHref } from "@/components/experiments/paths";

/**
 * Canonical cards shared by every page (home, services, projects, insights).
 * One hover language: border stays, the bottom bar (or row) inverts to ink, arrow nudges right,
 * title gets an underline. Works on white AND concrete backgrounds. No shadows, no radius.
 */

const cardCopy = {
  projectCta: "프로젝트 보기",
  minutes: (n: number) => `${n}분 읽기`,
  shotAlt: (client: string) => `${client} 웹사이트 데스크톱 첫 화면`,
};

/**
 * `sizes` default. Content box is at most 1280px (.wrap 1440 − 2×80). Widest card in use is half of it
 * (home lg first row, services md:grid-cols-2 → ≈628px); 3-col cards (≈411px) over-fetch slightly
 * rather than ever look soft. Pass `sizes` for a tighter hint in a known grid.
 */
const PROJECT_CARD_SIZES = "(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw";

/**
 * Image-led project card. Use in grids: `grid gap-6 md:grid-cols-2 xl:grid-cols-3`.
 * The screenshot is 1440×900 (16:10), cropped from the top.
 */
export function ProjectCard({
  project: p,
  headingLevel = "h3",
  sizes = PROJECT_CARD_SIZES,
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
  /** `next/image` sizes for the screenshot; match the grid the card sits in. */
  sizes?: string;
}) {
  const H = headingLevel;
  const theme = divisionTheme[p.division];
  return (
    <Link href={projectHref(p.slug)} className="group flex h-full flex-col border-2 border-ink bg-paper">
      <div className="relative aspect-16/10 overflow-hidden border-b-2 border-ink bg-concrete">
        <Image
          src={p.images.desktop}
          alt={cardCopy.shotAlt(p.client)}
          fill
          sizes={sizes}
          className="object-cover object-top"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
        <span className="flex items-center gap-2 font-mono text-meta font-bold text-gray">
          <i className={cx("size-2 rounded-full", theme.bg)} aria-hidden />
          {theme.name} · <span className="ko-tight">{p.type}</span>
        </span>
        <p className="text-body-sm font-bold">
          {p.client}
          {p.clientEn && <span className="ml-2 font-mono text-meta font-normal text-gray">{p.clientEn}</span>}
        </p>
        <H className="text-title text-balance underline-offset-4 group-hover:underline">{p.title}</H>
        <p className="text-body-sm text-pretty text-gray">{p.summary}</p>
        <p className="mt-auto pt-2 text-meta text-gray ko-tight">{p.scope}</p>
      </div>
      <div className="flex min-h-11 items-center justify-between border-t-2 border-ink px-6 py-4 text-body-sm font-bold transition-colors group-hover:bg-ink group-hover:text-paper md:px-8">
        {cardCopy.projectCta}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

/** Insight list row. Stack rows inside a container with `border-t-2 border-ink`. */
export function InsightRow({ note: n, headingLevel = "h3" }: { note: Note; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <Link href={insightHref(n.slug)} className="group grid gap-2 border-b-2 border-ink py-6 transition-colors hover:bg-concrete md:grid-cols-[160px_1fr_auto] md:items-baseline md:gap-8 md:px-4 md:py-8">
      <span className="font-mono text-meta text-gray">{formatDate(n.date)}</span>
      <span className="flex flex-col gap-2">
        <H className="flex items-baseline gap-3 text-title text-balance underline-offset-4 group-hover:underline">
          <i className={cx("size-2 shrink-0 translate-y-[-0.2em] rounded-full", divisionTheme[n.division].bg)} aria-hidden />
          {n.title}
        </H>
        <span className="text-body-sm text-gray text-pretty">{n.excerpt}</span>
      </span>
      <span className="flex items-center gap-3 font-mono text-meta text-gray">
        <span className="ko-tight">{cardCopy.minutes(n.readingMinutes)}</span>
        <span aria-hidden className="text-ink transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
