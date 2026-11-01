import { ButtonLink, SectionHead, cx } from "@/components/ui";
import { DivisionCard, Section, pad2 } from "@/components/divisions/division-sections";
import { divisionTheme, type Division } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { routes } from "@/components/divisions/copy";
import { getAboutCopy } from "./copy.en";

/* ---------- Hero ---------- */

export function AboutHero({ locale = "ko" }: { locale?: Locale }) {
  const C = getAboutCopy(locale);
  const { site } = getContent(locale);
  const lp = (path: string) => localePath(locale, path);
  return (
    <section>
      <div className="wrap pb-14 pt-12 md:pb-20 md:pt-20 xl:pb-24 xl:pt-24">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          <p className="label pt-2 text-gray">{C.hero.eyebrow}</p>
          <div className="animate-rise">
            <h1 className="text-h1 text-balance">{C.hero.title}</h1>
            <p className="mt-6 max-w-[640px] text-lead text-pretty md:mt-8">{site.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-12">
              <ButtonLink href={lp(routes.contact)}>{C.hero.primaryCta}</ButtonLink>
              <ButtonLink href={lp(routes.projects)} variant="secondary">
                {C.hero.secondaryCta} <span aria-hidden>→</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Founder's words (dark) ---------- */

export function FounderWords({ locale = "ko" }: { locale?: Locale }) {
  const C = getAboutCopy(locale);
  const { site } = getContent(locale);
  return (
    <section className="border-t-2 border-ink bg-ink text-paper" aria-label={C.founderWords.eyebrow}>
      <div className="wrap py-16 md:py-24 xl:py-28">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          <p className="label pt-2 text-ink-text">{C.founderWords.eyebrow}</p>
          <figure>
            <blockquote className="text-h1 text-balance">
              <p>&ldquo;{site.sloganOriginal}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-6 text-body text-ink-text md:mt-8">{C.founderWords.attribution}</figcaption>
          </figure>
        </div>
        <div className="mt-14 grid gap-3 border-t-2 border-ink-line pt-8 md:mt-20 lg:grid-cols-[280px_1fr] lg:gap-12">
          <p className="label pt-1 text-ink-text">{C.founderWords.brandLineLabel}</p>
          <div>
            <p className="text-h2 text-balance">
              {site.slogan}
              <i className="ml-[0.1em] inline-block size-[0.22em] rounded-full bg-red" aria-hidden />
            </p>
            <p className="mt-3 font-mono text-meta text-ink-text">{site.sloganEn}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Name: what 98 means ---------- */

export function NameMeaning({ locale = "ko" }: { locale?: Locale }) {
  const C = getAboutCopy(locale);
  const { site } = getContent(locale);
  return (
    <Section id="name">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-end lg:gap-12">
        <p className="font-logo text-display font-extrabold" aria-hidden>
          98
          <i className="ml-[0.06em] inline-block size-[0.2em] rounded-full bg-red" />
        </p>
        <div>
          <p className="label text-gray">
            {C.name.index} — {C.name.eyebrow}
          </p>
          <h2 className="mt-4 text-h2 text-balance">{C.name.title}</h2>
          <p className="mt-4 max-w-[640px] text-lead text-pretty">{site.nameMeaning}</p>
          <p className="mt-3 max-w-[640px] text-body text-gray text-pretty">{C.name.promise}</p>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Divisions + brand dots ---------- */

const swatchOrder: Division[] = ["master", "dev", "ai", "faith"];

export function DivisionsOverview({ locale = "ko" }: { locale?: Locale }) {
  const C = getAboutCopy(locale);
  const { divisions } = getContent(locale);
  const roles: Record<Division, string> = {
    master: C.divisions.masterRole,
    ...Object.fromEntries(divisions.map((d) => [d.slug, d.role])),
  } as Record<Division, string>;
  return (
    <Section id="divisions">
      <SectionHead index={C.divisions.index} eyebrow={C.divisions.eyebrow} title={C.divisions.title} lead={C.divisions.lead} />
      <div className="grid gap-6 lg:grid-cols-3">
        {divisions.map((d) => (
          <DivisionCard key={d.slug} division={d} locale={locale} />
        ))}
      </div>
      <div className="mt-14 grid gap-3 border-t-2 border-ink pt-8 md:mt-20 lg:grid-cols-[280px_1fr] lg:gap-12">
        <div>
          <h3 className="text-title text-balance">{C.divisions.swatchesLabel}</h3>
          <p className="mt-3 text-body-sm text-gray text-pretty">{C.divisions.swatchesBody}</p>
        </div>
        <ul className="grid border-l-2 border-t-2 border-ink sm:grid-cols-2 xl:grid-cols-4">
          {swatchOrder.map((d) => (
            <li key={d} className="flex items-center gap-5 border-b-2 border-r-2 border-ink p-6">
              <i className={cx("size-10 shrink-0 rounded-full", divisionTheme[d].bg)} aria-hidden />
              <div className="flex flex-col gap-1">
                <p className="font-logo text-2xl font-extrabold leading-none tracking-[-0.02em]">{divisionTheme[d].name}</p>
                <p className="mt-1 font-mono text-meta text-gray">{C.divisions.swatchColor[d]}</p>
                <p className="text-body-sm text-gray">{roles[d]}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ---------- Principles ---------- */

export function Principles({ locale = "ko" }: { locale?: Locale }) {
  const C = getAboutCopy(locale);
  return (
    <Section dark id="principles">
      <SectionHead dark index={C.principles.index} eyebrow={C.principles.eyebrow} title={C.principles.title} />
      <ol className="border-t-2 border-paper">
        {C.principles.items.map((p, i) => (
          <li key={p.code} className="grid gap-4 border-b border-ink-line py-8 md:py-12 lg:grid-cols-[280px_1fr] lg:gap-12">
            <p className="font-mono text-meta font-bold text-red-text-dark">
              {pad2(i + 1)} / {p.code}
            </p>
            <div className="grid gap-3 xl:grid-cols-[minmax(0,320px)_1fr] xl:gap-12">
              <h3 className="text-h3 text-balance">{p.title}</h3>
              <p className="max-w-[640px] text-body text-ink-text text-pretty">{p.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ---------- Team ---------- */

function FounderCard({ locale = "ko" }: { locale?: Locale }) {
  const C = getAboutCopy(locale);
  const { site } = getContent(locale);
  return (
    <article className="flex flex-col border-2 border-ink bg-paper">
      {/* TODO(content): founder photo — replace this monogram block with a square photo of the founder. */}
      <div className="relative flex aspect-square items-center justify-center border-b-2 border-ink bg-concrete" aria-hidden>
        <span className="font-logo text-numeral-lg font-extrabold tracking-tight">{C.team.monogram}</span>
        <i className="absolute bottom-6 right-6 size-6 rounded-full bg-red" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-6">
        <p className="label tracking-normal text-gray">{site.founder.role}</p>
        <h3 className="mt-2 text-title">{site.founder.name}</h3>
        <p className="font-mono text-meta text-gray">{site.founder.nameEn}</p>
      </div>
    </article>
  );
}

/** Open role: dashed 2px frame + mono OPEN ROLE label. */
function OpenRoleCard({ role, body, index, locale = "ko" }: { role: string; body: string; index: number; locale?: Locale }) {
  const C = getAboutCopy(locale);
  const { site } = getContent(locale);
  return (
    <a
      href={`mailto:${site.email}?subject=${encodeURIComponent(C.team.applySubject(role))}`}
      className="group flex flex-col border-2 border-dashed border-ink bg-paper"
    >
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-4 font-mono text-meta">
          <span className="flex items-center gap-2 font-bold">
            <i className="size-2 rounded-full bg-red" aria-hidden />
            {C.team.openBadge}
          </span>
          <span className="text-gray" aria-hidden>
            {pad2(index + 1)}
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <h3 className="text-title text-balance underline-offset-4 group-hover:underline">{role}</h3>
          <p className="text-body-sm text-gray text-pretty">{body}</p>
        </div>
      </div>
      <div className="flex min-h-11 items-center justify-between border-t-2 border-dashed border-ink px-6 py-4 text-body-sm font-bold transition-colors group-hover:bg-ink group-hover:text-paper">
        {C.team.openCta} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </a>
  );
}

export function Team({ locale = "ko" }: { locale?: Locale }) {
  const C = getAboutCopy(locale);
  return (
    <Section id="team">
      <SectionHead index={C.team.index} eyebrow={C.team.eyebrow} title={C.team.title} lead={C.team.lead} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <FounderCard locale={locale} />
        {C.team.roles.map((r, i) => (
          <OpenRoleCard key={r.role} role={r.role} body={r.body} index={i} locale={locale} />
        ))}
      </div>
    </Section>
  );
}
