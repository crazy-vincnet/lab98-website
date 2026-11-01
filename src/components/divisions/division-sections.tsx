import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink, Lockup, SectionHead, Symbol, cx } from "@/components/ui";
import { InsightRow, ProjectCard } from "@/components/cards";
import { divisionCopy as C, routes } from "./copy";
import { divisionTheme, type DivisionInfo, type DivisionSlug, type Experiment, type Note } from "@/lib/content";

/**
 * Point-color filled button for a division page (brand rule: max ONE per screen).
 * Text color is chosen for contrast: white on Web Blue, ink on Node Green / Light Gold.
 */
const accentButton: Record<DivisionSlug, string> = {
  web: "border-web bg-web text-paper",
  ai: "border-ai bg-ai text-ink",
  faith: "border-faith bg-faith text-ink",
};

export function DivisionAccentLink({ division, href, children }: { division: DivisionSlug; href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center gap-2.5 whitespace-nowrap border-2 px-7 py-[18px] text-ui font-bold transition-[background-color,color,border-color,transform] duration-150 ease-[var(--ease-lab)] hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-ink active:translate-y-px",
        accentButton[division],
      )}
    >
      {children}
    </Link>
  );
}

/** Wraps a full-width section with the standard 2px top rule. Padding matches the home page rhythm. */
export function Section({ id, dark = false, className, children }: { id?: string; dark?: boolean; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cx("border-t-2 border-ink", dark && "bg-ink text-paper", className)}>
      <div className="wrap py-16 md:py-24 xl:py-28">{children}</div>
    </section>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ---------- Hero ---------- */

export function DivisionHero({ division, experimentCount }: { division: DivisionInfo; experimentCount: number }) {
  const theme = divisionTheme[division.slug];
  return (
    <section>
      <div className="wrap grid items-end gap-10 pb-14 pt-12 md:gap-14 md:pb-24 md:pt-20 lg:grid-cols-[1.25fr_1fr] lg:gap-16 xl:pb-28 xl:pt-24">
        <div className="animate-rise">
          {/* The one division logo above the fold (the header carries the master lockup). */}
          <Lockup division={division.slug} height={48} className="h-10 w-auto md:h-12" />
          <p className="label mt-10 flex items-center gap-2.5 text-gray md:mt-14">
            <i className={cx("size-2.5 rounded-full", theme.bg)} aria-hidden />
            {C.hero.eyebrowCode(division.short)} · <span className="ko-tight font-sans">{C.hero.eyebrowKo}</span>
          </p>
          <h1 className="mt-5 text-h1 text-balance">{division.headline}</h1>
          <p className="mt-6 max-w-[600px] text-lead text-pretty md:mt-8">{division.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-12">
            <DivisionAccentLink division={division.slug} href={routes.contact}>
              {C.hero.primaryCta(division.short)}
            </DivisionAccentLink>
            <ButtonLink href="#projects" variant="secondary">
              {C.hero.secondaryCta(division.short)} <span aria-hidden>→</span>
            </ButtonLink>
          </div>
        </div>

        {/* Type block: no logo inside (avoids a 3rd logo above the fold and the clear-space clash with the big name). */}
        <div
          className="flex aspect-square flex-col justify-between gap-8 bg-ink p-6 text-paper md:aspect-auto md:min-h-[360px] md:p-12 lg:aspect-square lg:min-h-0"
          aria-hidden
        >
          {/* Counts only — "LAB98 WEB" is already in the eyebrow, so the block does not repeat it. */}
          <div className="flex items-start justify-between gap-6">
            <p className="font-mono text-meta text-ink-text">
              {C.hero.blockServices} {pad2(division.services.length)}
              <br />
              {C.hero.blockProjects} {pad2(experimentCount)}
            </p>
            <i className={cx("size-11 shrink-0 rounded-full md:size-14 xl:size-[72px]", theme.bg)} />
          </div>
          <p className="font-logo text-display font-extrabold">{division.short}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- What we do ---------- */

export function Services({ division }: { division: DivisionInfo }) {
  const theme = divisionTheme[division.slug];
  return (
    <Section id="services">
      <SectionHead index={C.services.index} eyebrow={C.services.eyebrow} title={C.services.title} lead={C.services.lead} />
      {/* 1 column (number beside text from md) until lg, then 3 columns — keeps ≥ 18 Korean chars per line at 768. */}
      <ul className="grid border-l-2 border-t-2 border-ink lg:grid-cols-3">
        {division.services.map((s, i) => (
          <li key={s.title} className="border-b-2 border-r-2 border-ink p-7 md:grid md:grid-cols-[140px_1fr] md:gap-8 md:p-10 lg:block lg:p-8 xl:p-10">
            <div>
              <p className={cx("font-logo text-numeral font-extrabold tracking-tight", theme.text)}>{pad2(i + 1)}</p>
              <i className={cx("mt-5 block h-0.5 w-10", theme.bg)} aria-hidden />
            </div>
            <div className="mt-6 md:mt-0 lg:mt-8">
              <h3 className="text-title text-balance">{s.title}</h3>
              <p className="mt-3 text-body-sm text-gray text-pretty">{s.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- Weekly sprint ---------- */

const dayCodes: Record<string, string> = C.cycle.dayCodes;

export function CycleTimeline({ division }: { division: DivisionInfo }) {
  const theme = divisionTheme[division.slug];
  const steps = division.sampleCycle.map((s) => {
    const [day, ...rest] = s.split(" · ");
    return { day, body: rest.join(" · ") || day };
  });
  return (
    <Section dark id="cycle">
      <SectionHead dark index={C.cycle.index} eyebrow={C.cycle.eyebrow} title={C.cycle.title} lead={C.cycle.lead} />
      {/* Vertical timeline until lg; 4 columns from lg. */}
      <ol className="grid border-l-2 border-ink-line lg:grid-cols-4 lg:border-l-0 lg:border-t-2 lg:border-paper">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step.day + i} className="relative pb-10 pl-8 last:pb-0 md:pl-10 lg:pb-0 lg:pl-0 lg:pr-8 lg:pt-10">
              <span
                aria-hidden
                className={cx(
                  "absolute -left-[9px] top-1 size-4 rounded-full border-2 lg:-top-[9px] lg:left-0",
                  theme.border,
                  last ? "bg-ink" : theme.bg,
                )}
              />
              <p className={cx("font-mono text-meta font-bold", theme.textDark)}>
                {pad2(i + 1)} / {dayCodes[step.day] ?? step.day}
              </p>
              <p className="mt-3 text-body-sm text-ink-text">{step.day}</p>
              <h3 className="mt-1 text-title text-balance">{step.body}</h3>
            </li>
          );
        })}
      </ol>
      <div className="mt-12 overflow-x-auto border-2 border-ink-line px-4 py-4 font-mono text-code text-ink-text md:mt-16 md:px-7 md:py-6">
        <p>
          $ <b className="font-normal text-paper">{C.cycle.terminalCommand}</b> --division={division.slug}
        </p>
        <p>{C.cycle.terminalSteps}</p>
        <p>
          <span className={theme.textDark}>✓</span> <span className="font-sans">{C.cycle.terminalDone}</span>
          <span className="ml-1 inline-block h-[1.1em] w-[0.6em] translate-y-[3px] animate-blink bg-ink-text" aria-hidden />
        </p>
      </div>
    </Section>
  );
}

/* ---------- Projects ---------- */

export function RelatedExperiments({ division, items }: { division: DivisionInfo; items: Experiment[] }) {
  return (
    <Section id="projects">
      <SectionHead
        index={C.projects.index}
        eyebrow={C.projects.eyebrow}
        title={C.projects.title(division.short)}
        lead={C.projects.lead}
      />
      {items.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map((e) => (
            <ProjectCard key={e.code} project={e} />
          ))}
        </div>
      ) : (
        <p className="border-2 border-ink p-8 text-body text-gray text-pretty">{C.projects.empty}</p>
      )}
      <div className="mt-10 flex justify-center">
        <ButtonLink href={routes.projects} variant="secondary">
          {C.projects.allCta} <span aria-hidden>→</span>
        </ButtonLink>
      </div>
    </Section>
  );
}

/* ---------- Insights ---------- */

export function RelatedNotes({ items }: { items: Note[] }) {
  if (items.length === 0) return null;
  return (
    <Section id="insights">
      <SectionHead index={C.insights.index} eyebrow={C.insights.eyebrow} title={C.insights.title} lead={C.insights.lead} />
      <ul className="border-t-2 border-ink">
        {items.map((n) => (
          <li key={n.slug}>
            <InsightRow note={n} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- Division cards (other divisions / overview) ---------- */

/** Small colored text that switches to the on-ink token when the footer inverts. */
const cardFootText: Record<DivisionSlug, string> = {
  web: "text-web-text group-hover:text-web-text-dark",
  ai: "text-ai-text group-hover:text-ai-text-dark",
  faith: "text-faith-text group-hover:text-faith-text-dark",
};

/** Same hover language as ProjectCard: border stays, footer bar inverts, arrow nudges, title underlines. */
export function DivisionCard({ division, headingLevel = "h3" }: { division: DivisionInfo; headingLevel?: "h2" | "h3" }) {
  const theme = divisionTheme[division.slug];
  const Heading = headingLevel;
  return (
    <Link href={routes.division(division.slug)} className="group flex h-full flex-col border-2 border-ink bg-paper">
      <div className="flex flex-1 flex-col gap-5 p-7 md:p-10">
        {/* decorative: the heading below already names the division */}
        <span aria-hidden>
          <Symbol division={division.slug} size={72} className="size-14 md:size-[72px]" />
        </span>
        <Heading className="font-logo text-3xl font-extrabold leading-none tracking-[-0.02em] underline-offset-4 group-hover:underline md:text-4xl">
          Lab98 <span className="font-medium">{division.short}</span>
        </Heading>
        <p className="text-body-sm text-gray text-pretty">{division.summary}</p>
      </div>
      <div
        className={cx(
          "flex items-center justify-between gap-4 border-t-2 border-ink px-7 py-4 text-body-sm font-bold transition-colors group-hover:bg-ink md:px-10",
          cardFootText[division.slug],
        )}
      >
        <span className="flex items-center gap-2.5">
          <i className={cx("size-2 rounded-full", theme.bg)} aria-hidden />
          {C.divisionCard.cta(division.short)}
        </span>
        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}

export function OtherDivisions({ items, index }: { items: DivisionInfo[]; index?: string }) {
  return (
    <Section id="other-divisions">
      <SectionHead index={index} eyebrow={C.others.eyebrow} title={C.others.title} lead={C.others.lead} />
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((d) => (
          <DivisionCard key={d.slug} division={d} />
        ))}
      </div>
    </Section>
  );
}

/* ---------- Contact band ---------- */

export function ContactBand({
  title = C.contactBand.title,
  lead = C.contactBand.lead,
  cta = C.contactBand.cta,
  secondary,
}: {
  title?: string;
  lead?: string;
  cta?: string;
  /** optional secondary link-style CTA (label without the trailing arrow) */
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="border-t-2 border-ink bg-concrete">
      <div className="wrap flex flex-col gap-8 py-14 md:py-20 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div>
          <p className="label text-gray">{C.contactBand.eyebrow}</p>
          <h2 className="mt-4 text-h2 text-balance">{title}</h2>
          <p className="mt-4 max-w-[560px] text-body text-gray text-pretty">{lead}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:gap-4">
          <ButtonLink href={routes.contact}>{cta}</ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="secondary">
              {secondary.label} <span aria-hidden>→</span>
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
