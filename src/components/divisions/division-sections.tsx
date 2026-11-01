import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink, Lockup, SectionHead, Symbol, Tag, cx } from "@/components/ui";
import { ProjectCard } from "@/components/cards";
import { divisionCopy as C, routes } from "./copy";
import { divisionTheme, type DivisionInfo, type DivisionSlug, type Project } from "@/lib/content";

/**
 * Point-color filled button for a division page (brand rule: max ONE per screen).
 * Text color is chosen for contrast: white on Dev Blue, ink on Node Green / Light Gold.
 */
const accentButton: Record<DivisionSlug, string> = {
  dev: "border-dev bg-dev text-paper",
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

export const pad2 = (n: number) => String(n).padStart(2, "0");

/* ---------- Hero ---------- */

export function DivisionHero({ division }: { division: DivisionInfo }) {
  const theme = divisionTheme[division.slug];
  const secondary = C.hero.secondary[division.slug];
  return (
    <section>
      <div className="wrap grid items-end gap-10 pb-12 pt-12 md:gap-14 md:pb-16 md:pt-20 lg:grid-cols-[1.25fr_1fr] lg:gap-16 xl:pt-24">
        <div className="animate-rise">
          {/* The one division logo above the fold (the header carries the master lockup). */}
          <Lockup division={division.slug} height={48} className="h-10 w-auto md:h-12" />
          <p className="label mt-10 flex items-center gap-2.5 text-gray md:mt-14">
            <i className={cx("size-2.5 rounded-full", theme.bg)} aria-hidden />
            {C.hero.eyebrowCode(division.short)} · <span className="ko-tight font-sans">{division.role}</span>
          </p>
          <h1 className="mt-5 text-h1 text-balance">{division.headline}</h1>
          <p className="mt-6 max-w-[600px] text-lead text-pretty md:mt-8">{division.summary}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-12">
            <DivisionAccentLink division={division.slug} href={routes.contact}>
              {division.cta.label}
            </DivisionAccentLink>
            <ButtonLink href={secondary.href} variant="secondary">
              {secondary.label} <span aria-hidden>→</span>
            </ButtonLink>
          </div>
        </div>

        {/* Type block: no logo inside (avoids a 2nd division logo above the fold). */}
        <div
          className="flex aspect-square flex-col justify-between gap-8 bg-ink p-6 text-paper md:aspect-auto md:min-h-[360px] md:p-12 lg:aspect-square lg:min-h-0"
          aria-hidden
        >
          <div className="flex items-start justify-between gap-6">
            <p className="font-mono text-meta text-ink-text">
              {C.hero.blockServices} {pad2(division.services.length)}
            </p>
            <i className={cx("size-11 shrink-0 rounded-full md:size-14 xl:size-[72px]", theme.bg)} />
          </div>
          <p className="font-logo text-display font-extrabold">{division.short}</p>
        </div>
      </div>

      {/* Facts: strong 3-cell row */}
      <div className="wrap pb-14 md:pb-20">
        <dl aria-label={C.hero.factsLabel} className="grid border-2 border-ink sm:grid-cols-3">
          {division.facts.map((f, i) => (
            <div key={f.label} className={cx("p-6 md:p-8", i > 0 && "border-t-2 border-ink sm:border-l-2 sm:border-t-0")}>
              <dt className={cx("label flex items-center gap-2 tracking-normal", theme.text)}>
                <i className={cx("size-2 rounded-full", theme.bg)} aria-hidden />
                {f.label}
              </dt>
              <dd className="mt-3 text-h3 text-balance">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- Status notice (e.g. AI community "오픈 예정") ---------- */

export function StatusNotice({ division }: { division: DivisionInfo }) {
  if (!division.status) return null;
  const theme = divisionTheme[division.slug];
  return (
    <section className="border-t-2 border-ink bg-ink text-paper" aria-label={division.status.label}>
      <div className="wrap flex flex-col gap-4 py-8 md:flex-row md:items-center md:gap-8 md:py-10">
        <p className={cx("flex shrink-0 items-center gap-2.5 font-mono text-meta font-bold", theme.textDark)}>
          <i className={cx("size-2.5 rounded-full", theme.bg)} aria-hidden />
          {C.status.eyebrow} · <span className="ko-tight font-sans">{division.status.label}</span>
        </p>
        <p className="text-body text-pretty">{division.status.body}</p>
      </div>
    </section>
  );
}

/* ---------- Description ("why") ---------- */

export function DivisionAbout({ division, index }: { division: DivisionInfo; index?: string }) {
  const contrast = division.slug === "ai" ? C.about.aiContrast : null;
  const theme = divisionTheme[division.slug];
  return (
    <Section id="about">
      <SectionHead index={index} eyebrow={C.about.eyebrow} title={C.about.byDivision[division.slug].title} className="lg:mb-10" />
      <div className="grid gap-3 lg:grid-cols-[280px_1fr] lg:gap-12">
        <span aria-hidden className="hidden lg:block" />
        <div>
          <p className="max-w-[720px] text-lead text-pretty">{division.description}</p>
          {contrast && (
            <div className="mt-10 grid border-2 border-ink md:mt-14 md:grid-cols-2">
              <div className="p-6 md:p-8">
                <p className="label tracking-normal text-gray">{contrast.not.note}</p>
                <p className="mt-3 text-h3 text-gray line-through decoration-2">{contrast.not.label}</p>
              </div>
              <div className="border-t-2 border-ink p-6 md:border-l-2 md:border-t-0 md:p-8">
                <p className={cx("label flex items-center gap-2 tracking-normal", theme.text)}>
                  <i className={cx("size-2 rounded-full", theme.bg)} aria-hidden />
                  {contrast.is.note}
                </p>
                <p className="mt-3 text-h3">{contrast.is.label}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ---------- Faith: Praise Tool feature ---------- */

export function PraiseToolFeature({ index }: { index?: string }) {
  const P = C.praiseTool;
  const theme = divisionTheme.faith;
  return (
    <section id="praise-tool" className="border-t-2 border-ink bg-ink text-paper">
      <div className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16 xl:py-28">
        <div>
          <p className={cx("label flex items-center gap-2.5", theme.textDark)}>
            <i className={cx("size-2.5 rounded-full", theme.bg)} aria-hidden />
            {index && <>{index} — </>}
            <span className="ko-tight font-sans">{P.eyebrow}</span>
          </p>
          <h2 className="mt-5 text-h1 text-balance">{P.title}</h2>
          <p className="mt-6 max-w-[600px] text-lead text-ink-text text-pretty">{P.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-12">
            <ButtonLink href={routes.praiseTool} variant="inverse">
              {P.primaryCta} <span aria-hidden>→</span>
            </ButtonLink>
            {/* Outline button on ink (no matching ButtonLink variant). */}
            <Link
              href={routes.praiseToolNotify}
              className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap border-2 border-paper bg-ink px-7 py-[18px] text-base font-bold leading-none text-paper transition-[background-color,color,transform] duration-150 ease-[var(--ease-lab)] hover:bg-paper hover:text-ink active:translate-y-px"
            >
              {P.secondaryCta}
            </Link>
          </div>
        </div>
        <dl className="border-2 border-paper">
          {P.facts.map((f, i) => (
            <div key={f.label} className={cx("grid grid-cols-[80px_1fr] items-baseline gap-4 p-5 md:p-7", i > 0 && "border-t-2 border-paper")}>
              <dt className="label tracking-normal text-ink-text">{f.label}</dt>
              <dd className="text-title">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- What we do ---------- */

export function Services({ division, index }: { division: DivisionInfo; index?: string }) {
  const theme = divisionTheme[division.slug];
  const statusTitle = C.statusService[division.slug];
  const cols = division.services.length === 4 ? "lg:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-3";
  return (
    <Section id="services">
      <SectionHead index={index} eyebrow={C.services.eyebrow} title={C.services.title} />
      <ul className={cx("grid border-l-2 border-t-2 border-ink", cols)}>
        {division.services.map((s, i) => {
          const status = division.status && s.title === statusTitle ? division.status : null;
          return (
            <li key={s.title} className="border-b-2 border-r-2 border-ink p-7 md:grid md:grid-cols-[140px_1fr] md:gap-8 md:p-10 lg:block lg:p-8 xl:p-10">
              <div>
                <p className={cx("font-logo text-numeral font-extrabold tracking-tight", theme.text)}>{pad2(i + 1)}</p>
                <i className={cx("mt-5 block h-0.5 w-10", theme.bg)} aria-hidden />
              </div>
              <div className="mt-6 md:mt-0 lg:mt-8">
                {status && (
                  <Tag caps={false} solid className="mb-3">
                    {status.label}
                  </Tag>
                )}
                <h3 className="text-title text-balance">{s.title}</h3>
                <p className="mt-3 text-body-sm text-gray text-pretty">{s.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/* ---------- Process (numbered steps) ---------- */

export function Process({ division, index }: { division: DivisionInfo; index?: string }) {
  const theme = divisionTheme[division.slug];
  const head = C.process.byDivision[division.slug];
  const highlight = C.process.highlight[division.slug];
  const cols = division.process.length > 4 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4";
  return (
    <Section dark id="process">
      <SectionHead dark index={index} eyebrow={C.process.eyebrow} title={head.title} lead={head.lead} />
      <ol className={cx("grid border-l-2 border-t-2 border-ink-line", cols)}>
        {division.process.map((step, i) => {
          const hl = highlight?.step === step.title ? highlight : null;
          return (
            <li
              key={step.title}
              className={cx(
                "flex flex-col gap-3 border-b-2 border-r-2 border-ink-line p-7 md:p-8 xl:p-10",
                hl && "relative bg-paper text-ink outline-2 -outline-offset-2 outline-paper",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <p className={cx("font-mono text-meta font-bold", hl ? theme.text : theme.textDark)}>STEP {pad2(i + 1)}</p>
                {hl && (
                  <Tag caps={false} dot={division.slug}>
                    {hl.badge}
                  </Tag>
                )}
              </div>
              <h3 className="mt-2 text-title text-balance">{step.title}</h3>
              <p className={cx("text-body-sm text-pretty", hl ? "text-gray" : "text-ink-text")}>{step.body}</p>
              {hl && <p className="mt-auto border-t-2 border-ink pt-4 text-body-sm font-bold text-pretty">{hl.note}</p>}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

/* ---------- Dev: projects ---------- */

export function DivisionProjects({ items, index }: { items: Project[]; index?: string }) {
  if (items.length === 0) return null;
  return (
    <Section id="projects">
      <SectionHead index={index} eyebrow={C.projects.eyebrow} title={C.projects.title} lead={C.projects.lead} />
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <ButtonLink href={routes.projects} variant="secondary">
          {C.projects.allCta} <span aria-hidden>→</span>
        </ButtonLink>
      </div>
    </Section>
  );
}

/* ---------- Division cards (other divisions / overview) ---------- */

/** Small colored text that switches to the on-ink token when the footer inverts. */
const cardFootText: Record<DivisionSlug, string> = {
  dev: "text-dev-text group-hover:text-dev-text-dark",
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
          <Symbol division={division.slug} size={72} alt="" className="size-14 md:size-[72px]" />
        </span>
        <div>
          <Heading className="font-logo text-3xl font-extrabold leading-none tracking-[-0.02em] underline-offset-4 group-hover:underline md:text-4xl">
            Lab98 <span className="font-medium">{division.short}</span>
          </Heading>
          <p className={cx("mt-3 text-body-sm font-bold", theme.text)}>{division.role}</p>
        </div>
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
