import Link from "next/link";
import { divisionTheme, formatDate, type Experiment, type Note } from "@/lib/content";
import { Progress, StatusTag, cx } from "@/components/ui";
import { insightHref, projectHref } from "@/components/experiments/paths";

/**
 * Canonical cards shared by every page (home, services, projects, insights).
 * One hover language: border stays, the bottom bar (or row) inverts to ink, arrow nudges right,
 * title gets an underline. Works on white AND concrete backgrounds. No shadows, no radius.
 */

const cardCopy = {
  projectCta: "프로젝트 보기",
  projectCtaDone: "결과 보기",
  readMore: "읽기",
  minutes: (n: number) => `${n}분 읽기`,
};

/** Project (case study) card. Use in grids: `grid gap-6 md:grid-cols-2`. */
export function ProjectCard({ project: p, headingLevel = "h3" }: { project: Experiment; headingLevel?: "h2" | "h3" }) {
  const done = p.status === "archived";
  const H = headingLevel;
  return (
    <Link href={projectHref(p.code)} className="group flex h-full flex-col border-2 border-ink bg-paper">
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-mono text-meta font-bold text-gray">
            <i className={cx("size-2 rounded-full", divisionTheme[p.division].bg)} aria-hidden />
            {p.label}
          </span>
          <StatusTag status={p.status} />
        </div>
        <H className="text-title text-balance underline-offset-4 group-hover:underline">{p.title}</H>
        <p className="text-body-sm text-gray text-pretty">{p.summary}</p>
        <div className="mt-auto pt-3">
          <Progress value={p.progress} muted={done} label={`${p.label} 진행률`} valueText={p.progressLabel} />
          <div className="mt-3 flex justify-between gap-4 font-mono text-micro text-gray">
            <span className="ko-tight">{p.stage}</span>
            <span>{p.progressLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t-2 border-ink px-6 py-4 text-body-sm font-bold transition-colors group-hover:bg-ink group-hover:text-paper md:px-8">
        {done ? cardCopy.projectCtaDone : cardCopy.projectCta}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
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
        {cardCopy.minutes(n.readingMinutes)}
        <span aria-hidden className="text-ink transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
