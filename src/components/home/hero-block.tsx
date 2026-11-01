"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cx } from "@/components/ui";
import type { Division, DivisionSlug } from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n";
import { routes } from "./copy";
import { MotionToggle, useHeroMotion, type HeroCopy } from "./hero-motion";
import { useReducedMotion } from "./use-reduced-motion";

/** Full class names so Tailwind can detect them. */
const dotBg: Record<Division, string> = { master: "bg-red", dev: "bg-dev", ai: "bg-ai", faith: "bg-faith" };
const textDark: Record<Division, string> = {
  master: "text-red-text-dark",
  dev: "text-dev-text-dark",
  ai: "text-ai-text-dark",
  faith: "text-faith-text-dark",
};
const hoverTextDark: Record<DivisionSlug, string> = {
  dev: "hover:text-dev-text-dark focus-visible:text-dev-text-dark",
  ai: "hover:text-ai-text-dark focus-visible:text-ai-text-dark",
  faith: "hover:text-faith-text-dark focus-visible:text-faith-text-dark",
};

const CYCLE_MS = 2500;

/**
 * The black "Lab 98" block. The dot cycles master → dev → ai → faith; hovering
 * or focusing a division name pins that division. Red master is the static
 * state (prerender, no JS, reduced motion). The cycle stops while the block
 * is hovered / focused and when the pause toggle (top-left, hidden under
 * reduced motion) is on.
 */
export function HeroBlock({ divisions, copy: heroCopy, locale = "ko" }: { divisions: { slug: DivisionSlug; short: string; name: string }[]; copy: HeroCopy; locale?: Locale }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<Division>("master");
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { paused } = useHeroMotion();

  useEffect(() => {
    if (reduced || pinned || hovered || paused) return;
    const t = window.setInterval(() => {
      setActive((a) => {
        const seq: Division[] = ["master", "dev", "ai", "faith"];
        return seq[(seq.indexOf(a) + 1) % seq.length];
      });
    }, CYCLE_MS);
    return () => window.clearInterval(t);
  }, [reduced, pinned, hovered, paused]);

  const activeName = active === "master" ? "Lab98" : (divisions.find((d) => d.slug === active)?.name ?? "Lab98");
  const pin = (d: Division) => {
    setPinned(true);
    setActive(d);
  };
  const release = () => setPinned(false);

  return (
    <div
      className="relative flex min-h-[340px] flex-col justify-between gap-6 bg-ink p-6 text-paper sm:aspect-[4/3] sm:min-h-0 md:p-10 lg:aspect-square xl:p-12"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="-mx-2 -mt-2.5 flex items-center justify-between gap-4 text-ink-text motion-reduce:justify-end">
        <MotionToggle className="px-2 text-ink-text hover:text-paper focus-visible:outline-paper" />
        <ul className="flex items-center" aria-label={heroCopy.blockDivisionsLabel}>
          {divisions.map((d, i) => (
            <li key={d.slug} className="flex items-center">
              {i > 0 && <span className="font-mono text-meta" aria-hidden>·</span>}
              <Link
                href={localePath(locale, routes.division(d.slug))}
                onMouseEnter={() => pin(d.slug)}
                onMouseLeave={release}
                onFocus={() => pin(d.slug)}
                onBlur={release}
                className={cx(
                  // 44×44 touch target, 16px link text (no link text < 14px on mobile)
                  "inline-flex min-h-11 min-w-11 items-center justify-center px-2 font-mono text-body-sm leading-none font-bold uppercase tracking-[0.06em] underline-offset-4 transition-colors duration-200 hover:underline",
                  hoverTextDark[d.slug],
                  pinned && active === d.slug && textDark[d.slug],
                )}
              >
                {d.short}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="font-logo text-display font-extrabold" aria-hidden>
        Lab
        <br />
        98
      </p>

      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-meta uppercase text-ink-text">
          <span className="block">{heroCopy.blockCaption}</span>
          <span key={active} className={cx("block animate-rise motion-reduce:animate-none font-bold [animation-duration:400ms]", textDark[active])}>
            {activeName}
          </span>
        </p>
        <span
          className={cx(
            "shrink-0 rounded-full transition-[background-color,transform,width,height] duration-500 ease-[var(--ease-lab)]",
            // Master red stays small so it doesn't compete with the red CTA; division colors get the big dot.
            active === "master" ? "size-6 md:size-8" : "size-11 md:size-16 xl:size-[72px]",
            dotBg[active],
            pinned && "scale-110",
          )}
          aria-hidden
        />
      </div>
    </div>
  );
}
