import { ButtonLink, statusMonoLabel as statusLabel } from "@/components/ui";
import { divisions, experiments, site, type Experiment } from "@/lib/content";
import { anchors, heroCopy } from "./copy";
import { HeroBlock } from "./hero-block";
import { HeroMotion, MotionToggle } from "./hero-motion";
import { HeroTerminal, type TerminalItem } from "./hero-terminal";

/** Stagger helper for the entrance animation. */
const rise = (i: number) => ({ animationDelay: `${80 + i * 90}ms` });

export function Hero() {
  const running = experiments.filter((e) => e.status !== "archived");
  const terminalItems: TerminalItem[] = running.map((e) => ({
    code: e.code,
    status: `${e.label} · ${statusLabel[e.status]} · ${e.progressLabel}`,
  }));
  // "We test, we ship." → ["We test,", "we ship"] + red dot for the period.
  const [line1, line2] = site.slogan.replace(/\.$/, "").split(/(?<=,)\s+/);

  return (
    <HeroMotion className="group/motion overflow-hidden">
      <div className="wrap grid items-end gap-10 pb-14 pt-10 md:gap-14 md:pb-20 md:pt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-12 lg:pb-24 lg:pt-20 xl:gap-16 xl:pb-28 xl:pt-24">
        <div className="min-w-0">
          <div className="mb-6 animate-rise motion-reduce:animate-none md:mb-8" style={rise(0)}>
            <HeroTerminal items={terminalItems} />
            <p className="sr-only">{heroCopy.srRunning}: {running.map((e) => e.label).join(", ")}</p>
          </div>
          <h1 className="animate-rise motion-reduce:animate-none font-logo text-display-xl font-extrabold" style={rise(1)}>
            <span className="block">{line1}</span>
            <span className="block">
              {line2}
              <span className="ml-[0.06em] inline-block size-[0.2em] rounded-full bg-red" aria-hidden />
              <span className="sr-only">.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-[560px] animate-rise motion-reduce:animate-none text-lead text-pretty md:mt-10" style={rise(2)}>
            <strong className="font-bold">{site.tagline}.</strong> {heroCopy.lead}
          </p>
          <div className="mt-8 flex animate-rise motion-reduce:animate-none flex-col gap-3 sm:flex-row sm:gap-4 md:mt-12" style={rise(3)}>
            {/* The one point-color button on this screen. */}
            <ButtonLink href={`#${anchors.contact}`} variant="accent">
              {heroCopy.ctaPrimary}
            </ButtonLink>
            <ButtonLink href={`#${anchors.projects}`} variant="secondary">
              {heroCopy.ctaSecondary} <span aria-hidden>→</span>
            </ButtonLink>
          </div>
        </div>
        <div className="animate-rise motion-reduce:animate-none" style={rise(2)}>
          <HeroBlock divisions={divisions.map(({ slug, short, name }) => ({ slug, short, name }))} />
        </div>
      </div>
      <Ticker items={experiments} />
    </HeroMotion>
  );
}

const tickerDot: Record<Experiment["division"], string> = { web: "bg-web", ai: "bg-ai", faith: "bg-faith" };

/**
 * Thin mono strip of project codes + status. Pure CSS loop; pauses on hover,
 * on keyboard focus of the strip's control, and via the pause toggle (WCAG 2.2.2).
 */
function Ticker({ items }: { items: Experiment[] }) {
  // Each half must be wider than the viewport for a seamless loop.
  const half = [...items, ...items];
  return (
    <div className="group/ticker flex items-stretch border-y-2 border-ink bg-ink text-paper">
      <div className="relative min-w-0 flex-1 overflow-hidden py-3" aria-hidden>
        <style href="lab98-home-ticker" precedence="default">{`@keyframes lab98-ticker{to{transform:translateX(-50%)}}`}</style>
        <div className="flex w-max animate-[lab98-ticker_48s_linear_infinite] group-hover/ticker:[animation-play-state:paused] group-focus-within/ticker:[animation-play-state:paused] group-data-[paused]/motion:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0">
              {half.map((e, i) => (
                <li key={`${e.code}-${i}`} className="flex items-center gap-2.5 whitespace-nowrap px-5 font-mono text-meta uppercase">
                  <i className={`size-2 rounded-full ${e.status === "archived" ? "bg-gray" : tickerDot[e.division]}`} />
                  <span className="font-bold">{e.label}</span>
                  <span className={e.status === "live" ? "text-red-text-dark" : "text-ink-text"}>{statusLabel[e.status]}</span>
                  <span className="text-ink-text">· {e.progressLabel}</span>
                  <span className="pl-5 text-ink-text/60">/</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <MotionToggle className="border-l-2 border-ink-line bg-ink text-paper hover:bg-paper hover:text-ink focus-visible:outline-paper focus-visible:-outline-offset-4" />
    </div>
  );
}
