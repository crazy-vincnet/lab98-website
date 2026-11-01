import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getProjectsPageCopy } from "@/components/experiments/copy.en";
import { CtaBand, DivisionDot, Pager } from "@/components/experiments/parts";
import { divisionHref, projectHref, PROJECTS_PATH } from "@/components/experiments/paths";
import { ProjectShots } from "@/components/experiments/project-shots";
import { ButtonLink, SectionHead } from "@/components/ui";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { divisionTheme, type Project } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { breadcrumb, graph, projectWork, webPage } from "@/lib/structured-data";

export const projectStaticParams = (locale: Locale = "ko") => getContent(locale).projects.map((p) => ({ slug: p.slug }));

export async function projectMetadata(locale: Locale, params: Promise<{ slug: string }>): Promise<Metadata> {
  const { slug } = await params;
  const p = getContent(locale).getProject(slug);
  if (!p) return { title: getProjectsPageCopy(locale).meta.notFoundTitle, robots: { index: false } };
  return pageMetadata({
    title: seoTitle(p, locale),
    ogTitle: p.title,
    description: seoDescription(p, locale),
    path: projectHref(p.slug),
    locale,
    // OG/Twitter image: file-based ./opengraph-image (an explicit `images` here would override it).
  });
}

const seoTitle = (p: Project, locale: Locale) => (locale === "en" ? `${p.client} website case study` : `${p.client} 웹사이트 제작 사례`);
/** "{summary} Lab98 Dev가 기획부터 디자인, 개발까지 맡아 A, B 등을 담았어요." */
const seoDescription = (p: Project, locale: Locale) => {
  const two = p.highlights
    .slice(0, 2)
    .map((h) => h.title)
    .join(", ");
  return locale === "en"
    ? `${p.summary} Lab98 Dev handled planning, design and development, including ${two}.`
    : `${p.summary} Lab98 Dev가 기획부터 디자인, 개발까지 맡아 ${two} 등을 담았어요.`;
};

export async function ProjectPage({ locale, params }: { locale: Locale; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { projects, getProject, getDivision } = getContent(locale);
  const projectsCopy = getProjectsPageCopy(locale);
  const t = projectsCopy.detail;
  const lp = (path: string) => localePath(locale, path);
  const p = getProject(slug);
  if (!p) notFound();

  const index = projects.findIndex((x) => x.slug === p.slug);
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const division = getDivision(p.division);
  const theme = divisionTheme[p.division];

  const path = lp(projectHref(p.slug));
  const crumbs = [
    { name: projectsCopy.meta.title, path: lp(PROJECTS_PATH) },
    { name: p.client, path },
  ];
  const work = projectWork(p, locale);
  const jsonLd = graph(
    webPage({ path, name: seoTitle(p, locale), description: seoDescription(p, locale), type: "ItemPage", crumbs, extra: { mainEntity: { "@id": work["@id"] }, primaryImageOfPage: work.image }, locale }),
    work,
    breadcrumb(path, crumbs, locale),
  );

  return (
    <article>
      <JsonLd data={jsonLd} />
      <header className="wrap pb-12 pt-8 md:pb-16 md:pt-12">
        <Link href={lp(PROJECTS_PATH)} className="label ko-tight inline-flex min-h-11 items-center gap-2 text-gray underline-offset-4 hover:text-ink hover:underline hover:decoration-2">
          {t.back}
        </Link>
        <p className="mt-8 flex items-center gap-2 font-mono text-meta font-bold md:mt-12">
          <DivisionDot division={p.division} className="size-2" />
          {division?.name ?? theme.name} · <span className="ko-tight">{p.type}</span>
        </p>
        <h1 className="mt-5 max-w-[920px] animate-rise text-h1 text-balance">
          {p.client}
          {p.clientEn && <span className="block text-h3 text-gray md:mt-1">{p.clientEn}</span>}
        </h1>
        <p className="mt-5 max-w-[720px] text-lead text-pretty text-gray">{p.summary}</p>

        <dl className="mt-10 grid grid-cols-2 gap-[2px] border-2 border-ink bg-ink md:mt-14 lg:grid-cols-4">
          <MetaCell term={t.meta.division}>
            <Link href={lp(divisionHref(p.division))} className="inline-flex min-h-11 items-center gap-2 font-bold underline decoration-2 underline-offset-4 hover:text-gray">
              <DivisionDot division={p.division} />
              {theme.name}
            </Link>
          </MetaCell>
          <MetaCell term={t.meta.scope}>{p.scope}</MetaCell>
          <MetaCell term={t.meta.type}>{p.type}</MetaCell>
          {p.languages && p.languages.length > 0 && <MetaCell term={t.meta.languages}>{p.languages.join(" · ")}</MetaCell>}
        </dl>

        <ButtonLink href={p.url} target="_blank" rel="noopener noreferrer" aria-label={t.visitAria(p.client)} className="mt-8 w-full sm:w-auto md:mt-10">
          {t.visit} <span aria-hidden>↗</span>
        </ButtonLink>
      </header>

      <Section eyebrow={t.shots.eyebrow} title={t.shots.title}>
        <ProjectShots project={p} locale={locale} />
      </Section>

      <Section eyebrow={t.highlights.eyebrow} title={t.highlights.title}>
        <ol className="border-t-2 border-ink">
          {p.highlights.map((h, i) => (
            <li key={h.title} className="grid grid-cols-[48px_1fr] items-baseline gap-4 border-b-2 border-ink py-6 md:grid-cols-[80px_1fr] md:py-8">
              <span className="font-mono text-h3" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="text-title text-balance">{h.title}</h3>
                <p className="mt-2 max-w-[760px] text-body text-pretty text-gray">{h.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <div className="wrap pb-20 md:pb-32">
        <Pager
          label={t.pager.label}
          prev={prev && { href: lp(projectHref(prev.slug)), dirLabel: t.pager.prev, meta: prev.clientEn, title: prev.client }}
          next={next && { href: lp(projectHref(next.slug)), dirLabel: t.pager.next, meta: next.clientEn, title: next.client }}
        />
        <Link href={lp(PROJECTS_PATH)} className="label ko-tight mt-8 inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline hover:decoration-2">
          {t.backBottom}
        </Link>
      </div>
      <CtaBand eyebrow={projectsCopy.cta.eyebrow} title={projectsCopy.cta.title} lead={projectsCopy.cta.lead} action={projectsCopy.cta.action} locale={locale} />
    </article>
  );
}

/** Detail section: 2px rule on top, shared SectionHead, shared vertical rhythm. */
function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="border-t-2 border-ink">
      <div className="wrap py-16 md:py-24">
        <SectionHead eyebrow={eyebrow} title={title} />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function MetaCell({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 bg-paper p-4 md:p-6">
      <dt className="label ko-tight text-gray">{term}</dt>
      <dd className="text-body">{children}</dd>
    </div>
  );
}
