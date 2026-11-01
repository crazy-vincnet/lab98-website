"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui";
import { useHeroMotion } from "./hero-motion";
import { useReducedMotion } from "./use-reduced-motion";

export type TerminalItem = {
  /** project slug, e.g. "ai-042" */
  code: string;
  /** e.g. "AI-042 · LIVE · WEEK 4 / 4" */
  status: string;
};

type Phase = "typing" | "hold" | "erasing";
type State = { idx: number; chars: number; phase: Phase };

const command = (code: string) => `lab98 ship --project=${code}`;

const TYPE_MS = 55;
const ERASE_MS = 22;
const HOLD_MS = 2600;
const GAP_MS = 350;

/**
 * Hero command line that types `$ lab98 ship --project=…` for each active
 * project, then prints its status. Prerender / no-JS / reduced motion:
 * the first command is shown in full, statically. Pauses (freezes mid-type)
 * on hover and when the hero pause toggle is on.
 */
export function HeroTerminal({ items }: { items: TerminalItem[] }) {
  const reduced = useReducedMotion();
  const { paused } = useHeroMotion();
  const [hovered, setHovered] = useState(false);
  const [state, setState] = useState<State>({ idx: 0, chars: command(items[0].code).length, phase: "hold" });
  const frozen = paused || hovered;

  useEffect(() => {
    if (reduced || frozen || items.length < 2) return;
    const full = command(items[state.idx].code).length;
    let delay: number;
    let next: State;
    if (state.phase === "typing") {
      delay = TYPE_MS;
      next = state.chars + 1 >= full ? { ...state, chars: full, phase: "hold" } : { ...state, chars: state.chars + 1 };
    } else if (state.phase === "hold") {
      delay = HOLD_MS;
      next = { ...state, phase: "erasing" };
    } else if (state.chars > 0) {
      delay = ERASE_MS;
      next = { ...state, chars: state.chars - 1 };
    } else {
      delay = GAP_MS;
      next = { idx: (state.idx + 1) % items.length, chars: 0, phase: "typing" };
    }
    const t = window.setTimeout(() => setState(next), delay);
    return () => window.clearTimeout(t);
  }, [state, reduced, frozen, items]);

  const current = items[reduced ? 0 : state.idx];
  const text = reduced ? command(current.code) : command(current.code).slice(0, state.chars);
  const showStatus = reduced || state.phase === "hold";

  return (
    <div className="font-mono text-code" aria-hidden onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <p className="flex min-w-0 items-center whitespace-nowrap text-gray">
        <span className="mr-2 text-gray">$</span>
        <span className="truncate text-ink">{text}</span>
        <i className={cx("ml-0.5 inline-block h-[1.15em] w-[0.6em] shrink-0 bg-ink", showStatus && !frozen && "animate-blink")} />
      </p>
      <p className={cx("whitespace-nowrap text-gray transition-opacity duration-300", showStatus ? "opacity-100" : "opacity-0")}>
        <span className="font-bold text-ink">→</span> {current.status}
      </p>
    </div>
  );
}
