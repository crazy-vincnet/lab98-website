import type { ReactNode } from "react";
import { cx, statusLabel, statusMonoLabel } from "@/components/ui";
import { experimentsCopy } from "./copy";
import { divisionTheme, type Division, type Experiment, type ExperimentStatus } from "@/lib/content";

/** Small round division marker (point color used only as a dot). */
export function DivisionDot({ division, className }: { division: Division; className?: string }) {
  return <i aria-hidden className={cx("inline-block size-2.5 shrink-0 rounded-full", divisionTheme[division].bg, className)} />;
}

/**
 * Toggle chip used by the client-side filters. 2px border, selected = ink fill.
 * Labels are sans (Korean-safe, same family as the contact-form chips); the count stays mono.
 * A chip with `count === 0` is disabled so it never leads to an empty result.
 */
export function FilterChip({ selected, onClick, children, count }: { selected: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  const empty = count === 0 && !selected;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={empty}
      className={cx(
        "inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border-2 px-3.5 font-sans text-body-sm font-bold leading-none transition-colors duration-150",
        selected ? "border-ink bg-ink text-paper" : "border-ink bg-paper text-ink hover:bg-concrete",
        "disabled:cursor-not-allowed disabled:border-line disabled:text-gray disabled:hover:bg-paper",
      )}
    >
      {children}
      {count !== undefined && <span className={cx("font-mono text-meta font-normal", selected ? "text-ink-text" : "text-gray")}>{count}</span>}
    </button>
  );
}

/**
 * Labelled chip row for a filter dimension. On mobile the chips scroll sideways
 * (no lone chip on a second line); from md they wrap.
 */
export function ChipGroup({ id, legend, children }: { id: string; legend: string; children: ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-5">
      <p id={id} className="label w-24 shrink-0 tracking-normal text-gray">
        {legend}
      </p>
      <div className="-mx-5 -my-2 flex gap-2 overflow-x-auto px-5 py-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">{children}</div>
    </div>
  );
}

export const statusOrder: ExperimentStatus[] = ["live", "running", "archived"];
export const statusName: Record<ExperimentStatus, string> = statusLabel;

/** Summary parts (`6 PROJECTS`, `2 LIVE`, `2 IN PROGRESS`, `2 DONE`) computed from data. Render with `MetaLine`. */
export function experimentSummaryParts(list: Experiment[]) {
  const parts = [`${list.length} ${experimentsCopy.index.summaryNoun}`];
  for (const s of statusOrder) parts.push(`${list.filter((e) => e.status === s).length} ${statusMonoLabel[s]}`);
  return parts;
}

/**
 * Mono meta line whose items never break internally; the `·` separator stays
 * attached to the preceding item so no line ends or starts with a lone dot.
 */
export function MetaLine({ items, className }: { items: ReactNode[]; className?: string }) {
  const shown = items.filter((x) => x !== null && x !== undefined && x !== false);
  return (
    <span className={cx("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {shown.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
          {item}
          {i < shown.length - 1 && <span aria-hidden>·</span>}
        </span>
      ))}
    </span>
  );
}
