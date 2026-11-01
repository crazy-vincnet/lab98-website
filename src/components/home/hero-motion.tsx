"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { cx } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import { getHomeCopy } from "./copy.en";

/**
 * Shared pause state for the hero's looping motion (the block's dot cycle)
 * — WCAG 2.2.2 Pause, Stop, Hide. Renders the hero <section> with
 * `data-paused` so CSS-only loops can pause via `group-data-[paused]/motion:`.
 */
const MotionContext = createContext<{ paused: boolean; toggle: () => void; locale: Locale }>({ paused: false, toggle: () => {}, locale: "ko" });

export function useHeroMotion() {
  return useContext(MotionContext);
}

export function HeroMotion({ className, children, locale = "ko" }: { className?: string; children: ReactNode; locale?: Locale }) {
  const [paused, setPaused] = useState(false);
  return (
    <MotionContext.Provider value={{ paused, toggle: () => setPaused((p) => !p), locale }}>
      <section className={className} data-paused={paused || undefined}>
        {children}
      </section>
    </MotionContext.Provider>
  );
}

/**
 * Visible pause / play control (mono, 44×44 minimum). Hidden when the viewer
 * prefers reduced motion — nothing moves then.
 */
export function MotionToggle({ className }: { className?: string }) {
  const { paused, toggle, locale } = useHeroMotion();
  const { heroCopy } = getHomeCopy(locale);
  return (
    <button
      type="button"
      onClick={toggle}
      className={cx(
        "inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2 px-4 font-mono text-meta font-bold uppercase transition-colors duration-150 motion-reduce:hidden",
        className,
      )}
    >
      <span aria-hidden>{paused ? "▶" : "❚❚"}</span>
      {paused ? heroCopy.motionPlay : heroCopy.motionPause}
      <span className="sr-only"> — {heroCopy.motionSr}</span>
    </button>
  );
}
