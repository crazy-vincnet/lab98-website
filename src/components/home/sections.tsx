import Link from "next/link";
import type { ReactNode } from "react";
import { InsightRow, ProjectCard } from "@/components/cards";
import { ButtonLink, SectionHead, Symbol, cx } from "@/components/ui";
import { divisions, experiments, notes, site, type Division, type DivisionSlug } from "@/lib/content";
import { ContactForm } from "./contact-form";
import { aboutCopy, anchors, contactCopy, divisionsCopy, experimentsCopy, notesCopy, processCopy, routes, serviceLabel } from "./copy";

/* Consistent section rhythm: 64 / 96 / 112px vertical padding. */
function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cx("border-t-2 border-ink", className)}>
      <div className="wrap py-16 md:py-24 xl:py-28">{children}</div>
    </section>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cx("inline-block transition-transform duration-200 ease-[var(--ease-lab)] group-hover:translate-x-1", className)}>
      →
    </span>
  );
}

/* Full Tailwind class names per division (hover/inverted states). */
const footText: Record<DivisionSlug, string> = {
  web: "text-web-text group-hover:text-web-text-dark group-focus-visible:text-web-text-dark",
  ai: "text-ai-text group-hover:text-ai-text-dark group-focus-visible:text-ai-text-dark",
  faith: "text-faith-text group-hover:text-faith-text-dark group-focus-visible:text-faith-text-dark",
};

/** Card inversion on hover / keyboard focus — no shadows, no radius. */
const invert = "group-hover:bg-ink group-hover:text-paper group-focus-visible:bg-ink group-focus-visible:text-paper";
const swapOff = "group-hover:hidden group-focus-visible:hidden";
const subText = "text-gray group-hover:text-ink-text group-focus-visible:text-ink-text";

/* ---------------------------------------------------------------- 01 About */

export function About() {
  return (
    <Section id={anchors.about}>
      <SectionHead
        index={aboutCopy.index}
        eyebrow={aboutCopy.eyebrow}
        title={`${aboutCopy.title[0]} ${aboutCopy.title[1]}`}
        lead={aboutCopy.lead}
      />
      {/* 3 columns from lg; 768–1023 uses full-width rows (numeral left, text right). */}
      <ol className="grid border-l-2 border-t-2 border-ink lg:grid-cols-3">
        {aboutCopy.principles.map((p, i) => (
          <li key={p.title} className="border-b-2 border-r-2 border-ink p-7 md:max-lg:grid md:max-lg:grid-cols-[96px_1fr] md:max-lg:gap-x-8 md:p-8 xl:p-10">
            <span className="block font-logo text-numeral font-extrabold tracking-[-0.03em] md:max-lg:row-span-2">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-6 text-title text-balance md:max-lg:mt-0 lg:mt-8">{p.title}</h3>
            <p className="mt-3 text-body-sm text-gray text-pretty">{p.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------- 02 Services */

export function Services() {
  return (
    <Section id={anchors.services}>
      <SectionHead index={divisionsCopy.index} eyebrow={divisionsCopy.eyebrow} title={divisionsCopy.title} lead={divisionsCopy.lead} />
      {/* 3 columns from lg; at 768 three columns are too narrow (QA: 8–10 chars/line). */}
      <ul className="grid gap-4 md:gap-5 lg:grid-cols-3 xl:gap-6">
        {divisions.map((d) => (
          <li key={d.slug} className="flex">
            <Link href={routes.division(d.slug)} className="group flex w-full outline-offset-4">
              <article className={cx("flex w-full flex-col gap-5 border-2 border-ink bg-paper p-7 transition-colors duration-200 md:p-8 lg:min-h-[420px] xl:p-10", invert)}>
                {/* Symbols are decorative here: the h3 already names the service. */}
                <span className={cx("block", swapOff)} aria-hidden>
                  <Symbol division={d.slug} size={72} className="size-14 md:size-[72px]" />
                </span>
                <span className="hidden group-hover:block group-focus-visible:block" aria-hidden>
                  <Symbol division={d.slug} inverse size={72} className="size-14 md:size-[72px]" />
                </span>
                <h3 className="font-logo text-h3 font-extrabold leading-none tracking-[-0.02em]">
                  Lab98 <span className="font-medium">{d.short}</span>
                </h3>
                <p className={cx("text-body-sm text-pretty", subText)}>{d.summary}</p>
                <div className="mt-auto flex items-center justify-between border-t-2 border-current pt-5">
                  <span className={cx("label ko-tight", footText[d.slug])}>{divisionsCopy.cardFoot(d.short)}</span>
                  <Arrow className="font-bold" />
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------- 03 Projects */

export function Projects() {
  const latest = [...experiments].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 4);
  return (
    <Section id={anchors.projects} className="bg-concrete">
      <SectionHead index={experimentsCopy.index} eyebrow={experimentsCopy.eyebrow} title={experimentsCopy.title} lead={experimentsCopy.lead} />
      <div className="grid gap-4 md:grid-cols-2 md:gap-5 xl:gap-6">
        {latest.map((e) => (
          <ProjectCard key={e.code} project={e} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <ButtonLink href={routes.experiments} variant="secondary" className="group w-full sm:w-auto">
          {experimentsCopy.more} <Arrow />
        </ButtonLink>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ 04 Process */

export function Process() {
  const sample = experiments.find((e) => e.status === "live" && e.result) ?? experiments[0];
  return (
    <section id={anchors.process} className="border-t-2 border-ink bg-ink text-paper">
      <div className="wrap py-16 md:py-24 xl:py-28">
        <SectionHead dark index={processCopy.index} eyebrow={processCopy.eyebrow} title={processCopy.title} lead={processCopy.lead} />
        <ol className="grid border-t-2 border-paper md:grid-cols-2 xl:grid-cols-4">
          {processCopy.steps.map((s, i) => (
            <li
              key={s.key}
              className={cx(
                "border-b border-ink-line py-6 md:p-8 md:pl-0 xl:border-b-0",
                i % 2 === 1 && "md:border-l md:pl-8 xl:pl-8",
                i > 0 && "xl:border-l xl:pl-8",
              )}
            >
              <p className="font-mono text-meta font-bold text-red-text-dark">
                {String(i + 1).padStart(2, "0")} / {s.key}
              </p>
              <h3 className="mt-4 text-title text-balance md:mt-6">{s.title}</h3>
              <p className="mt-3 text-body-sm text-ink-text text-pretty">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 border-2 border-ink-line bg-ink-2 font-mono text-code text-ink-text md:mt-16">
          <div className="flex items-center gap-2 border-b-2 border-ink-line px-4 py-2.5 md:px-7" aria-hidden>
            <i className="size-2.5 rounded-full bg-red" />
            <i className="size-2.5 rounded-full bg-ink-line" />
            <i className="size-2.5 rounded-full bg-ink-line" />
            <span className="ml-3 text-micro uppercase">~/lab98 — {sample.label.toLowerCase()}</span>
          </div>
          <div className="px-4 py-4 md:px-7 md:py-6">
            <p>
              <span className="text-red-text-dark">$</span> <span className="text-paper">{processCopy.terminalCommand(sample.code)}</span>
            </p>
            {/* Korean values are set in the sans face so they don't inherit mono spacing. */}
            <p>
              → goal: <span className="font-sans">{sample.hypothesis}</span>
            </p>
            <p>
              → metric: <span className="font-sans">{sample.successMetric}</span>
            </p>
            {sample.result && (
              <p>
                → result: <span className="font-sans">{sample.result}</span>
              </p>
            )}
            {/* Brand: success is paper/bold, not AI green (division colors only mean their division). */}
            <p className="font-bold text-paper">{processCopy.terminalDone}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- 05 Insights */

export function Insights() {
  const latest = [...notes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return (
    <Section id={anchors.insights}>
      <SectionHead index={notesCopy.index} eyebrow={notesCopy.eyebrow} title={notesCopy.title} lead={notesCopy.lead} />
      <ul className="border-t-2 border-ink">
        {latest.map((n) => (
          <li key={n.slug}>
            <InsightRow note={n} />
          </li>
        ))}
      </ul>
      <div className="mt-10 flex justify-end">
        <Link
          href={routes.notes}
          className="group inline-flex min-h-11 items-center gap-2 border-b-2 border-ink text-body-sm font-bold transition-colors hover:border-red hover:text-red-text"
        >
          {notesCopy.more} <Arrow />
        </Link>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ 06 Contact */

export function Contact() {
  const interests = [
    { value: "master" as Division, label: contactCopy.form.interestAll },
    ...divisions.map((d) => ({ value: d.slug as Division, label: serviceLabel[d.slug] })),
  ];
  return (
    <Section id={anchors.contact}>
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 xl:gap-20">
        <div>
          <p className="label mb-6 text-gray">
            {contactCopy.index} — {contactCopy.eyebrow}
          </p>
          <h2 className="text-h2 text-balance">
            {contactCopy.title[0]} {contactCopy.title[1]}
          </h2>
          <p className="mt-5 max-w-[480px] text-body text-gray text-pretty">
            {contactCopy.lead} {site.replyTime}.
          </p>
          <dl className="mt-10 grid grid-cols-[88px_1fr] items-center gap-y-1 text-body md:grid-cols-[120px_1fr]">
            <dt className="label text-gray">{contactCopy.infoEmail}</dt>
            <dd className="min-w-0">
              <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center break-all underline decoration-2 underline-offset-4 transition-colors hover:text-red-text">
                {site.email}
              </a>
            </dd>
            <dt className="label text-gray">{contactCopy.infoWeb}</dt>
            <dd className="py-2">{site.url.replace(/^https?:\/\//, "")}</dd>
          </dl>
        </div>
        <ContactForm to={site.email} interests={interests} />
      </div>
    </Section>
  );
}
