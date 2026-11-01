import Link from "next/link";
import type { ReactNode } from "react";
import { InsightRow, ProjectCard } from "@/components/cards";
import { ButtonLink, SectionHead, Symbol, cx } from "@/components/ui";
import type { Division, DivisionSlug } from "@/lib/content";
import { getSiteContent } from "@/lib/site-content";
import { localePath, type Locale } from "@/lib/i18n";
import { getInsights } from "@/lib/insights";
import { ContactForm } from "./contact-form";
import { anchors, clientShort, routes } from "./copy";
import { fill } from "@/lib/fill-template";
import { loadHomeCopy } from "./load";
import { PraiseCountdown } from "./praise-countdown";

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
  dev: "text-dev-text group-hover:text-dev-text-dark group-focus-visible:text-dev-text-dark",
  ai: "text-ai-text group-hover:text-ai-text-dark group-focus-visible:text-ai-text-dark",
  faith: "text-faith-text group-hover:text-faith-text-dark group-focus-visible:text-faith-text-dark",
};

/** Card inversion on hover / keyboard focus — no shadows, no radius. */
const invert = "group-hover:bg-ink group-hover:text-paper group-focus-visible:bg-ink group-focus-visible:text-paper";
const swapOff = "group-hover:hidden group-focus-visible:hidden";
const subText = "text-gray group-hover:text-ink-text group-focus-visible:text-ink-text";

/* ----------------------------------------------------------- Trust strip */

export async function TrustStrip({ locale = "ko" }: { locale?: Locale }) {
  const { projects } = await getSiteContent(locale); // admin-editable site data
  const trustCopy = await loadHomeCopy.trust(locale);
  const items = [
    trustCopy.code,
    trustCopy.price,
    { title: fill(trustCopy.clients, { n: projects.length }), body: projects.map(clientShort).join(" · ") },
  ];
  return (
    <section aria-label={trustCopy.label} className="border-y-2 border-ink">
      <ul className="wrap grid md:grid-cols-3">
        {items.map((it, i) => (
          <li
            key={it.title}
            className={cx(
              "py-6 md:px-8 md:py-10 xl:px-10",
              i > 0 && "border-t-2 border-ink md:border-l-2 md:border-t-0",
              i === 0 && "md:pl-0 xl:pl-0",
              i === items.length - 1 && "md:pr-0 xl:pr-0",
            )}
          >
            <p className="flex items-center gap-3 text-h3 text-balance">
              <i className="size-2.5 shrink-0 rounded-full bg-red" aria-hidden />
              {it.title}
            </p>
            <p className="mt-2 pl-[22px] text-body-sm text-gray text-pretty">{it.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------------------------------------- Praise Tool banner */

export async function PraiseToolBanner({ locale = "ko" }: { locale?: Locale }) {
  const lp = (path: string) => localePath(locale, path);
  const praiseCopy = await loadHomeCopy.praise(locale);
  return (
    <section aria-labelledby="praise-tool-banner" className="bg-ink text-paper">
      <div className="wrap flex flex-col gap-8 py-10 md:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h2 id="praise-tool-banner" className="flex items-center gap-3 text-h3">
              <Symbol division="faith" inverse size={32} alt="" className="size-8" />
              <span>
                <span lang="en" className="font-logo font-extrabold tracking-[-0.02em]">
                  {praiseCopy.name}
                </span>{" "}
                · {praiseCopy.launch}
              </span>
            </h2>
            <PraiseCountdown copy={{ fallback: praiseCopy.fallback, today: praiseCopy.today, after: praiseCopy.after }} />
          </div>
          <p className="mt-4 max-w-[640px] text-body text-ink-text text-pretty">{praiseCopy.line}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <ButtonLink href={lp(routes.praiseToolNotify)} variant="inverse" className="group">
            {praiseCopy.notify} <Arrow />
          </ButtonLink>
          <Link
            href={lp(routes.praiseTool)}
            className="inline-flex min-h-11 items-center justify-center self-start border-b-2 border-paper text-body-sm font-bold transition-colors hover:border-faith hover:text-faith-text-dark max-sm:self-stretch max-sm:border-2 max-sm:py-3"
          >
            {praiseCopy.more}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- 01 Services */

export async function Services({ locale = "ko" }: { locale?: Locale }) {
  const lp = (path: string) => localePath(locale, path);
  const { divisions } = await getSiteContent(locale); // admin-editable site data
  const servicesCopy = await loadHomeCopy.services(locale);
  return (
    <Section id={anchors.services}>
      <SectionHead index={servicesCopy.index} eyebrow={servicesCopy.eyebrow} title={servicesCopy.title} lead={servicesCopy.lead} />
      {/* 3 columns from lg; at 768 three columns are too narrow. */}
      <ul className="grid gap-4 md:gap-5 lg:grid-cols-3 xl:gap-6">
        {divisions.map((d) => (
          <li key={d.slug} className="flex">
            <Link href={lp(routes.division(d.slug))} className="group flex w-full outline-offset-4">
              <article className={cx("flex w-full flex-col gap-5 border-2 border-ink bg-paper p-7 transition-colors duration-200 md:p-8 lg:min-h-[480px] xl:p-10", invert)}>
                {/* Symbols are decorative here: the h3 already names the service. */}
                <span className={cx("block", swapOff)} aria-hidden>
                  <Symbol division={d.slug} size={72} alt="" className="size-14 md:size-[72px]" />
                </span>
                <span className="hidden group-hover:block group-focus-visible:block" aria-hidden>
                  <Symbol division={d.slug} inverse size={72} alt="" className="size-14 md:size-[72px]" />
                </span>
                <div>
                  <h3 className="font-logo text-h3 font-extrabold leading-none tracking-[-0.02em]">
                    Lab98 <span className="font-medium">{d.short}</span>
                  </h3>
                  <p className={cx("mt-2 text-body-sm font-bold", subText)}>{d.role}</p>
                </div>
                <p className="text-title text-balance">{servicesCopy.hook[d.slug] ?? d.headline}</p>
                <p className={cx("text-body-sm text-pretty", subText)}>{d.summary}</p>
                <dl className="grid gap-1.5 border-t border-current pt-4 text-body-sm">
                  {d.facts.slice(0, 3).map((f) => (
                    <div key={f.label} className="flex flex-wrap gap-x-3">
                      <dt className={subText}>{f.label}</dt>
                      <dd className="font-bold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-auto flex items-center justify-between border-t-2 border-current pt-5">
                  <span className={cx("label ko-tight", footText[d.slug])}>{fill(servicesCopy.cardFoot, { short: d.short })}</span>
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

/* ------------------------------------------------------------- 02 Projects */

export async function Projects({ locale = "ko" }: { locale?: Locale }) {
  const lp = (path: string) => localePath(locale, path);
  const { projects } = await getSiteContent(locale); // admin-editable site data
  const projectsCopy = await loadHomeCopy.projects(locale);
  return (
    <Section id={anchors.projects} className="bg-concrete">
      <SectionHead index={projectsCopy.index} eyebrow={projectsCopy.eyebrow} title={projectsCopy.title} lead={projectsCopy.lead} />
      {/* md: 1 wide + 2×2 · lg: 2 large on top, 3 below (6-col grid, every row filled). */}
      <ul className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-6 xl:gap-6">
        {projects.map((p, i) => (
          <li key={p.slug} className={cx("flex min-w-0 [&>*]:w-full", i === 0 && "md:col-span-2", i < 2 ? "lg:col-span-3" : "lg:col-span-2")}>
            <ProjectCard locale={locale} project={p} headingLevel="h3" />
          </li>
        ))}
      </ul>

      <div className="mt-10 border-y-2 border-ink md:mt-14">
        <div className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:gap-8">
          <p className="label ko-tight shrink-0 text-gray">{projectsCopy.clientsLabel}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-0">
            {projects.map((p) => (
              <li key={p.slug}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.clientEn ? `${p.client} (${p.clientEn})` : p.client}
                  className="group inline-flex min-h-11 items-center gap-1.5 text-body font-bold underline-offset-4 hover:underline"
                >
                  {clientShort(p)}
                  <span aria-hidden className="text-gray">↗</span>
                  <span className="sr-only">{projectsCopy.newTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <ButtonLink href={lp(routes.projects)} variant="secondary" className="group w-full sm:w-auto">
          {projectsCopy.more} <Arrow />
        </ButtonLink>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ 03 Process */

/** The step that sets Lab98 apart (배포 및 코드 공유). */
const HIGHLIGHT_STEP = 4;

export async function Process({ locale = "ko" }: { locale?: Locale }) {
  const { divisions } = await getSiteContent(locale); // admin-editable site data
  const processCopy = await loadHomeCopy.process(locale);
  const steps = divisions.find((d) => d.slug === "dev")?.process ?? [];
  return (
    <section id={anchors.process} className="border-t-2 border-ink bg-ink text-paper">
      <div className="wrap py-16 md:py-24 xl:py-28">
        <SectionHead dark index={processCopy.index} eyebrow={processCopy.eyebrow} title={processCopy.title} lead={processCopy.lead} />
        <ol className="grid gap-px border-2 border-ink-line bg-ink-line md:grid-cols-2 xl:grid-cols-3">
          {steps.map((s, i) => {
            const hl = i === HIGHLIGHT_STEP;
            return (
              <li key={s.title} className={cx("flex flex-col p-6 md:p-8", hl ? "bg-paper text-ink" : "bg-ink")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={cx("font-logo text-numeral font-extrabold tracking-[-0.03em]", hl ? "text-red-text" : "text-paper")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {hl && (
                    <span className="inline-flex items-center gap-2 border-2 border-ink px-2.5 py-1 text-body-sm font-bold">
                      <i className="size-2 rounded-full bg-red" aria-hidden />
                      {processCopy.highlight}
                    </span>
                  )}
                </div>
                <h3 className="mt-6 text-title text-balance">{s.title}</h3>
                <p className={cx("mt-2 text-body-sm text-pretty", hl ? "text-gray" : "text-ink-text")}>{s.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- 04 Founder */

export async function Founder({ locale = "ko" }: { locale?: Locale }) {
  const lp = (path: string) => localePath(locale, path);
  const { site } = await getSiteContent(locale); // admin-editable site data
  const founderCopy = await loadHomeCopy.founder(locale);
  return (
    <Section id={anchors.about}>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
        <p className="label pt-2 text-gray">
          {founderCopy.index} — {founderCopy.eyebrow}
        </p>
        <figure>
          <blockquote>
            <p className="text-h2 text-balance">“{site.sloganOriginal}”</p>
          </blockquote>
          <figcaption className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-body">
            <span className="font-bold">{site.founder.display}</span>
            <span className="font-mono text-meta uppercase text-gray">{site.founder.role}</span>
          </figcaption>
          <p className="mt-8 max-w-[640px] border-t-2 border-ink pt-6 text-body text-gray text-pretty">{site.nameMeaning}</p>
          <Link
            href={lp(routes.about)}
            className="group mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-ink text-body-sm font-bold transition-colors hover:border-red hover:text-red-text"
          >
            {founderCopy.more} <Arrow />
          </Link>
        </figure>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- 05 Insights */

export async function Insights({ locale = "ko" }: { locale?: Locale }) {
  const lp = (path: string) => localePath(locale, path);
  const insightsCopy = await loadHomeCopy.insights(locale);
  const latest = (await getInsights(locale)).slice(0, 3); // static notes + published posts (DB)
  if (latest.length === 0) return null;
  return (
    <Section id={anchors.insights}>
      <SectionHead index={insightsCopy.index} eyebrow={insightsCopy.eyebrow} title={insightsCopy.title} lead={insightsCopy.lead} />
      <ul className="border-t-2 border-ink">
        {latest.map((n) => (
          <li key={n.slug}>
            <InsightRow locale={locale} note={n} headingLevel="h3" />
          </li>
        ))}
      </ul>
      <div className="mt-10 flex justify-end">
        <Link
          href={lp(routes.insights)}
          className="group inline-flex min-h-11 items-center gap-2 border-b-2 border-ink text-body-sm font-bold transition-colors hover:border-red hover:text-red-text"
        >
          {insightsCopy.more} <Arrow />
        </Link>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ 06 Contact */

export async function Contact({ locale = "ko" }: { locale?: Locale }) {
  const { divisions, site } = await getSiteContent(locale); // admin-editable site data
  const contactCopy = await loadHomeCopy.contact(locale);
  const { interestLabel } = contactCopy;
  const interests: { value: Division; label: string }[] = [
    { value: "master", label: interestLabel.master },
    ...divisions.map((d) => ({ value: d.slug, label: interestLabel[d.slug] })),
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
            <dt className="label text-gray">{contactCopy.infoReply}</dt>
            <dd className="py-2">{site.replyTime}</dd>
          </dl>
        </div>
        <ContactForm locale={locale} to={site.email} interests={interests} copy={contactCopy.form} />
      </div>
    </Section>
  );
}
