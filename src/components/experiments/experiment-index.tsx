"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ProjectCard } from "@/components/cards";
import { Button, StatusTag, cx } from "@/components/ui";
import { divisionTheme, formatDate, type DivisionSlug, type Experiment, type ExperimentStatus } from "@/lib/content";
import { experimentsCopy as t } from "./copy";
import { projectHref } from "./paths";
import { ChipGroup, DivisionDot, FilterChip, statusName, statusOrder } from "./parts";

const divisionOrder: DivisionSlug[] = ["web", "ai", "faith"];

/**
 * Project list with client-side filters. Filter state lives only in React
 * state (no searchParams / useSearchParams), so the route prerenders fully.
 */
export function ExperimentIndex({ experiments }: { experiments: Experiment[] }) {
  const [division, setDivision] = useState<DivisionSlug | "all">("all");
  const [status, setStatus] = useState<ExperimentStatus | "all">("all");

  const results = experiments.filter((e) => (division === "all" || e.division === division) && (status === "all" || e.status === status));
  const filtered = division !== "all" || status !== "all";
  const reset = () => {
    setDivision("all");
    setStatus("all");
  };

  return (
    <>
      <div className="flex flex-col gap-4 border-y-2 border-ink py-6 md:gap-5">
        <ChipGroup id="exp-filter-division" legend={t.filters.division}>
          <FilterChip selected={division === "all"} onClick={() => setDivision("all")} count={experiments.length}>
            {t.filters.all}
          </FilterChip>
          {divisionOrder.map((d) => (
            <FilterChip key={d} selected={division === d} onClick={() => setDivision(d)} count={experiments.filter((e) => e.division === d).length}>
              <DivisionDot division={d} className="size-2" />
              {divisionTheme[d].name}
            </FilterChip>
          ))}
        </ChipGroup>
        <ChipGroup id="exp-filter-status" legend={t.filters.status}>
          <FilterChip selected={status === "all"} onClick={() => setStatus("all")}>
            {t.filters.all}
          </FilterChip>
          {statusOrder.map((s) => (
            <FilterChip key={s} selected={status === s} onClick={() => setStatus(s)} count={experiments.filter((e) => e.status === s).length}>
              {statusName[s]}
            </FilterChip>
          ))}
        </ChipGroup>
      </div>

      <div className="mt-6 flex min-h-11 flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-meta font-bold uppercase text-gray" aria-live="polite">
          {results.length} / {experiments.length} {t.filters.results}
        </p>
        {filtered && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 cursor-pointer items-center font-sans text-body-sm font-bold underline decoration-2 underline-offset-4 hover:text-gray"
          >
            {t.filters.reset}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-4 flex flex-col items-start gap-4 border-2 border-dashed border-ink px-6 py-12 md:px-10">
          <p className="label text-gray">{t.empty.eyebrow}</p>
          <p className="text-title text-balance">{t.empty.title}</p>
          <p className="text-body-sm text-gray">{t.empty.body}</p>
          <Button variant="secondary" size="sm" onClick={reset} className="mt-1">
            {t.empty.action}
          </Button>
        </div>
      ) : (
        <>
          <LabLogTable experiments={results} />
          <ul className="mt-4 grid gap-6 md:grid-cols-2 lg:hidden">
            {results.map((e) => (
              <li key={e.code}>
                <ProjectCard project={e} headingLevel="h2" />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

const cols =
  "grid grid-cols-[96px_80px_minmax(0,1fr)_96px_150px_104px] items-center gap-5 px-5 xl:grid-cols-[112px_96px_minmax(0,1fr)_112px_200px_116px] xl:gap-6";

/**
 * Desktop "lab log" (lg+). ARIA table semantics on a CSS grid, so each row can be
 * `relative` and the title link can stretch over the whole row (`after:inset-0`)
 * while its accessible name stays just the title.
 */
function LabLogTable({ experiments }: { experiments: Experiment[] }) {
  const captionId = useId();
  return (
    <div role="table" aria-labelledby={captionId} className="mt-4 hidden border-2 border-ink lg:block">
      <span id={captionId} className="sr-only">
        {t.index.listLabel}
      </span>
      <div role="rowgroup">
        <div role="row" className={cx(cols, "border-b-2 border-ink bg-concrete py-3 font-mono text-meta font-bold uppercase text-gray")}>
          <span role="columnheader">{t.table.code}</span>
          <span role="columnheader">{t.table.division}</span>
          <span role="columnheader">{t.table.title}</span>
          <span role="columnheader">{t.table.status}</span>
          <span role="columnheader">{t.table.progress}</span>
          <span role="columnheader" className="text-right">
            {t.table.started}
          </span>
        </div>
      </div>
      <div role="rowgroup">
        {experiments.map((e) => {
          const archived = e.status === "archived";
          return (
            <div
              key={e.code}
              role="row"
              className={cx(
                cols,
                "group relative border-b-2 border-ink py-5 transition-colors duration-150 last:border-b-0",
                "hover:bg-ink hover:text-paper has-[a:focus-visible]:bg-ink has-[a:focus-visible]:text-paper",
                "has-[a:focus-visible]:outline-3 has-[a:focus-visible]:-outline-offset-3 has-[a:focus-visible]:outline-red",
              )}
            >
              <span role="cell" className="font-mono text-meta font-bold">
                {e.label}
              </span>
              <span role="cell" className="flex items-center gap-2 font-mono text-meta uppercase">
                <DivisionDot division={e.division} />
                {divisionTheme[e.division].name}
              </span>
              <span role="cell" className="min-w-0">
                <Link
                  href={projectHref(e.code)}
                  className="block truncate text-title-sm underline-offset-4 outline-none after:absolute after:inset-0 group-hover:underline group-has-[a:focus-visible]:underline"
                >
                  {e.title}
                </Link>
                <span className="block truncate text-body-sm text-gray group-hover:text-ink-text group-has-[a:focus-visible]:text-ink-text">{e.summary}</span>
              </span>
              <span role="cell">
                <span className="group-hover:hidden group-has-[a:focus-visible]:hidden">
                  <StatusTag status={e.status} />
                </span>
                <span className="hidden group-hover:inline group-has-[a:focus-visible]:inline">
                  <StatusTag status={e.status} dark />
                </span>
              </span>
              <span role="cell" className="flex flex-col gap-2">
                <span
                  className="relative block h-2 bg-concrete group-hover:bg-ink-line group-has-[a:focus-visible]:bg-ink-line"
                  role="progressbar"
                  aria-valuenow={e.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={e.progressLabel}
                  aria-label={`${e.label} ${t.table.progressAria}`}
                >
                  <i
                    className={cx("absolute inset-y-0 left-0", archived ? "bg-gray group-hover:bg-ink-text" : "bg-ink group-hover:bg-paper group-has-[a:focus-visible]:bg-paper")}
                    style={{ width: `${e.progress}%` }}
                  />
                </span>
                <span aria-hidden className="font-mono text-micro text-gray group-hover:text-ink-text group-has-[a:focus-visible]:text-ink-text">
                  {e.progressLabel}
                </span>
              </span>
              <span role="cell" className="text-right font-mono text-meta text-gray group-hover:text-ink-text group-has-[a:focus-visible]:text-ink-text">
                <time dateTime={e.startedAt}>{formatDate(e.startedAt)}</time>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
