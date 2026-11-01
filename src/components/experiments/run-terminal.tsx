import type { ReactNode } from "react";
import { cx } from "@/components/ui";
import { divisionTheme, formatDate, type Experiment } from "@/lib/content";
import { experimentsCopy } from "./copy";

const t = experimentsCopy.terminal;

/** Korean values inside the mono terminal: brand sans, no mono word gaps. */
function Ko({ children }: { children: ReactNode }) {
  return <span className="font-sans">{children}</span>;
}

/** Dark terminal box summarizing a project run. Every line comes from data. */
export function RunTerminal({ experiment: e, className }: { experiment: Experiment; className?: string }) {
  const theme = divisionTheme[e.division];
  return (
    <div className={cx("border-2 border-ink-line bg-ink px-4 py-4 font-mono text-code text-ink-text md:px-7 md:py-6", className)}>
      <p className="mb-3 flex items-center justify-between gap-3 border-b border-ink-line pb-3 text-micro uppercase">
        <span>{t.heading}</span>
        <span className="flex items-center gap-2">
          <i aria-hidden className={cx("size-2 rounded-full", theme.bg)} />
          {e.label}
        </span>
      </p>
      <div className="flex flex-col">
        <p className="break-all">
          $ <b className="font-normal text-paper">{t.command}
            {e.code}</b>
        </p>
        <p>→ division: {theme.name.toLowerCase()} · started: {formatDate(e.startedAt)}</p>
        <p>→ goal: <Ko>{e.hypothesis}</Ko></p>
        <p>→ metric: <Ko>{e.successMetric}</Ko></p>
        <p>
          → stage: <Ko>{e.stage}</Ko> · {e.progressLabel} · {e.progress}%
        </p>
        {e.result && (
          <p>
            → result: <Ko>{e.result}</Ko>
          </p>
        )}
        {e.status === "live" && <p className="font-bold text-paper">{t.live}</p>}
        {e.status === "running" && (
          <p className="text-paper">
            {t.running}
            <span aria-hidden className="ml-1 inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] animate-blink bg-paper" />
          </p>
        )}
        {e.status === "archived" && <p className="text-paper">{t.archived}</p>}
      </div>
    </div>
  );
}
