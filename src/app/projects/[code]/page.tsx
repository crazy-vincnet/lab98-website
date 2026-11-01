import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { experimentsCopy } from "@/components/experiments/copy";
import { divisionHref, insightHref, projectHref, PROJECTS_PATH } from "@/components/experiments/paths";
import { DivisionDot, MetaLine } from "@/components/experiments/parts";
import { RunTerminal } from "@/components/experiments/run-terminal";
import { ContactBand } from "@/components/divisions/division-sections";
import { Progress, SectionHead, StatusTag, Symbol, cx } from "@/components/ui";
import { divisionTheme, experiments, formatDate, getDivision, getExperiment, getNote } from "@/lib/content";

const t = experimentsCopy.detail;

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return experiments.map((e) => ({ code: e.code }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[code]">): Promise<Metadata> {
  const { code } = await params;
  const e = getExperiment(code);
  if (!e) return { title: experimentsCopy.meta.notFoundTitle };
  return {
    title: `${e.label} ${e.title}`,
    description: e.summary,
    openGraph: { title: `${e.label} ${e.title}`, description: e.summary },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[code]">) {
  const { code } = await params;
  const e = getExperiment(code);
  if (!e) notFound();

  const index = experiments.findIndex((x) => x.code === e.code);
  const prev = experiments[index - 1];
  const next = experiments[index + 1];
  const note = e.relatedNote ? getNote(e.relatedNote) : undefined;
  const division = getDivision(e.division);
  const theme = divisionTheme[e.division];

  return (
    <article>
      {/* Header */}
      <header>
        <div className="wrap pb-12 pt-8 md:pb-16 md:pt-12">
          <Link href={PROJECTS_PATH} className="label inline-flex min-h-11 items-center gap-2 tracking-normal text-gray underline-offset-4 hover:text-ink hover:underline hover:decoration-2">
            {t.back}
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 md:mt-12">
            <Symbol division={e.division} size={40} />
            <p className="font-mono text-meta font-bold">
              {e.label} · <span className={theme.text}>{theme.name.toUpperCase()}</span>
            </p>
            <StatusTag status={e.status} />
          </div>
          <h1 className="mt-6 max-w-[920px] animate-rise text-h1 text-balance">{e.title}</h1>
          <p className="mt-5 max-w-[720px] text-lead text-pretty text-gray">{e.summary}</p>

          <dl className="mt-10 grid grid-cols-2 gap-[2px] border-2 border-ink bg-ink md:mt-14 lg:grid-cols-4">
            <MetaCell term={t.meta.division}>
              <Link href={divisionHref(e.division)} className="inline-flex min-h-11 items-center gap-2 font-bold underline decoration-2 underline-offset-4 hover:text-gray">
                <DivisionDot division={e.division} />
                {division?.name ?? theme.name}
              </Link>
            </MetaCell>
            <MetaCell term={t.meta.startedAt}>
              <time dateTime={e.startedAt} className="font-mono">
                {formatDate(e.startedAt)}
              </time>
            </MetaCell>
            <MetaCell term={t.meta.stage}>{e.stage}</MetaCell>
            <MetaCell term={t.meta.progress}>
              <span className="flex flex-col gap-2.5">
                <MetaLine items={[e.progressLabel, `${e.progress}%`]} className="font-mono" />
                <Progress value={e.progress} muted={e.status === "archived"} label={`${e.label} ${t.meta.progress}`} valueText={e.progressLabel} />
              </span>
            </MetaCell>
          </dl>
        </div>
      </header>

      {/* Spec sheet */}
      <Section index="01" eyebrow={t.spec.eyebrow} title={t.spec.title}>
        <div className="grid gap-[2px] border-2 border-ink bg-ink lg:grid-cols-3">
          <SpecCell n="A" term={t.spec.hypothesis}>
            {e.hypothesis}
          </SpecCell>
          <SpecCell n="B" term={t.spec.metric}>
            {e.successMetric}
          </SpecCell>
          <SpecCell n="C" term={t.spec.result} dark={!!e.result}>
            {e.result ?? (
              <span className="flex items-center gap-2.5 text-body-sm font-normal text-gray">
                <i aria-hidden className="size-2.5 shrink-0 animate-blink bg-ink" />
                {t.spec.pending}
              </span>
            )}
          </SpecCell>
        </div>
      </Section>

      {/* Learnings */}
      <Section index="02" eyebrow={t.learnings.eyebrow} title={t.learnings.title}>
        <ol className="border-t-2 border-ink">
          {e.learnings.map((l, i) => (
            <li key={l} className="grid grid-cols-[48px_1fr] items-baseline gap-4 border-b-2 border-ink py-6 md:grid-cols-[80px_1fr] md:py-8">
              <span className="font-mono text-h3" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="max-w-[760px] text-title text-pretty">{l}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Run log */}
      <Section index="03" eyebrow={t.run.eyebrow} title={t.run.title}>
        <RunTerminal experiment={e} />
      </Section>

      {/* Related */}
      <Section index="04" eyebrow={t.related.eyebrow} title={t.related.title}>
        <ul className={cx("grid gap-6", note && "md:grid-cols-2")}>
          {note && (
            <li>
              <RelatedCard
                href={insightHref(note.slug)}
                eyebrow={
                  <>
                    {t.related.noteEyebrow} · <time dateTime={note.date}>{formatDate(note.date)}</time>
                  </>
                }
                title={note.title}
                body={note.excerpt}
                action={t.related.noteAction}
              />
            </li>
          )}
          <li>
            <RelatedCard
              href={divisionHref(e.division)}
              eyebrow={
                <span className="flex items-center gap-2">
                  <DivisionDot division={e.division} />
                  {t.related.divisionEyebrow}
                </span>
              }
              title={division?.name ?? theme.name}
              body={division?.summary}
              action={t.related.divisionAction}
            />
          </li>
        </ul>
      </Section>

      {/* Prev / next — a single item spans the full width (no empty cell). */}
      <nav aria-label={t.pager.label} className="wrap pb-20 md:pb-32">
        {(prev || next) && (
          <div className={cx("grid gap-[2px] border-2 border-ink bg-ink", prev && next && "sm:grid-cols-2")}>
            {prev && <PagerLink href={projectHref(prev.code)} dir="prev" code={prev.label} title={prev.title} />}
            {next && <PagerLink href={projectHref(next.code)} dir="next" code={next.label} title={next.title} alignEnd={!!prev} />}
          </div>
        )}
        <Link href={PROJECTS_PATH} className="label mt-8 inline-flex min-h-11 items-center gap-2 tracking-normal underline-offset-4 hover:underline hover:decoration-2">
          {t.backBottom}
        </Link>
      </nav>
      <ContactBand title={t.contactBand.title} cta={t.contactBand.cta} />
    </article>
  );
}

/** Detail section: 2px rule on top, shared SectionHead, shared vertical rhythm. */
function Section({ index, eyebrow, title, children }: { index: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="border-t-2 border-ink">
      <div className="wrap py-16 md:py-24 xl:py-28">
        <SectionHead index={index} eyebrow={eyebrow} title={title} />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function MetaCell({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 bg-paper p-4 md:p-6">
      <dt className="label tracking-normal text-gray">{term}</dt>
      <dd className="text-body">{children}</dd>
    </div>
  );
}

function SpecCell({ n, term, dark = false, children }: { n: string; term: string; dark?: boolean; children: ReactNode }) {
  return (
    <div className={cx("flex flex-col gap-4 p-6 md:p-7", dark ? "bg-ink text-paper" : "bg-paper")}>
      <p className={cx("label flex justify-between tracking-normal", dark ? "text-ink-text" : "text-gray")}>
        <span>{term}</span>
        <span aria-hidden>{n}</span>
      </p>
      <div className="text-title-sm text-pretty">{children}</div>
    </div>
  );
}

/** Same hover language as the canonical cards: border stays, bottom bar inverts, title underlines, arrow nudges. */
function RelatedCard({ href, eyebrow, title, body, action }: { href: string; eyebrow: ReactNode; title: string; body?: string; action: string }) {
  return (
    <Link href={href} className="group flex h-full flex-col border-2 border-ink bg-paper">
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
        <p className="label text-gray">{eyebrow}</p>
        <h3 className="text-title text-balance underline-offset-4 group-hover:underline">{title}</h3>
        {body && <p className="text-body-sm text-pretty text-gray">{body}</p>}
      </div>
      <div className="flex items-center justify-between border-t-2 border-ink px-6 py-4 text-body-sm font-bold transition-colors group-hover:bg-ink group-hover:text-paper md:px-8">
        {action}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

function PagerLink({ href, dir, code, title, alignEnd = false }: { href: string; dir: "prev" | "next"; code: string; title: string; alignEnd?: boolean }) {
  return (
    <Link
      href={href}
      className={cx("group flex flex-col gap-2 bg-paper p-6 transition-colors duration-150 hover:bg-ink hover:text-paper md:p-8", alignEnd && "sm:items-end sm:text-right")}
    >
      <span className="label tracking-normal text-gray group-hover:text-ink-text">{dir === "prev" ? t.pager.prev : t.pager.next}</span>
      <span className="font-mono text-meta font-bold">{code}</span>
      <span className="text-title text-balance">{title}</span>
    </Link>
  );
}
