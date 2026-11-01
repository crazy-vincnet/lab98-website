import { ButtonLink, SectionHead } from "@/components/ui";
import { DivisionCard, Section } from "@/components/divisions/division-sections";
import { divisions, divisionTheme, experiments, site, type Division } from "@/lib/content";
import { routes } from "@/components/divisions/copy";
import { aboutCopy as C } from "./copy";
import { principles, steps, team, type OpenRole, type TeamMember } from "./team";

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ---------- Hero ---------- */

export function AboutHero() {
  return (
    <section>
      <div className="wrap pb-12 pt-12 md:pb-20 md:pt-20 xl:pt-24">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr]">
          <p className="label pt-2 text-gray">{C.hero.eyebrow(site.name)}</p>
          <div className="animate-rise">
            <h1 className="text-h1 text-balance">{C.hero.title}</h1>
            <p className="mt-6 max-w-[640px] text-lead text-pretty md:mt-8">{C.hero.mission}</p>
            <p className="mt-4 max-w-[640px] text-body text-gray text-pretty">{C.hero.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-12">
              <ButtonLink href={routes.contact}>{C.hero.primaryCta}</ButtonLink>
              <ButtonLink href={routes.projects} variant="secondary">
                {C.hero.secondaryCta} <span aria-hidden>→</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
      {/* Motto band — kept compact so /about stays near the 30% black target. */}
      <div className="bg-ink text-paper">
        <div className="wrap flex flex-col gap-8 py-10 md:py-14">
          <div className="flex justify-between gap-4 font-mono text-meta text-ink-text">
            <span>{C.hero.bandCommand}</span>
            <span className="hidden sm:inline">{C.hero.bandMeta}</span>
          </div>
          <p className="font-logo text-display font-extrabold">
            {C.hero.sloganLine1}
            <br />
            {C.hero.sloganLine2}
            <i className="ml-[0.06em] inline-block size-[0.2em] rounded-full bg-red" aria-hidden />
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Numbers (derived from content.ts only) ---------- */

export function Numbers() {
  const items = [
    { value: divisions.length, ...C.numbers.divisions },
    { value: experiments.filter((e) => e.status === "live").length, ...C.numbers.live },
    { value: experiments.filter((e) => e.status === "running").length, ...C.numbers.running },
    { value: experiments.filter((e) => e.status === "archived").length, ...C.numbers.done },
  ];
  return (
    <section className="border-t-2 border-ink" aria-label={C.numbers.ariaLabel}>
      <dl className="wrap grid grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.label}
            className={[
              "py-8 md:py-12",
              i % 2 === 1 ? "border-l-2 border-ink pl-5 md:pl-8" : "",
              i >= 2 ? "border-t-2 border-ink lg:border-t-0" : "",
              i === 2 ? "lg:border-l-2 lg:pl-8" : "",
            ].join(" ")}
          >
            <dt className="label tracking-normal text-gray">{it.label}</dt>
            <dd className="mt-3 font-logo text-numeral-lg font-extrabold tracking-tight">{pad2(it.value)}</dd>
            <dd className="mt-3 font-mono text-meta tracking-normal text-gray">{it.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---------- Principles (long-form numbered rows) ---------- */

export function Principles() {
  return (
    <Section id="principles">
      <SectionHead index={C.principles.index} eyebrow={C.principles.eyebrow} title={C.principles.title} lead={C.principles.lead} />
      <ol className="border-t-2 border-ink">
        {principles.map((p, i) => (
          <li key={p.code} className="grid gap-4 border-b-2 border-ink py-8 md:py-12 lg:grid-cols-[240px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr]">
            <div className="flex items-baseline gap-4 lg:flex-col lg:gap-3">
              <span className="font-logo text-numeral font-extrabold tracking-tight">{pad2(i + 1)}</span>
              <span className="label text-gray">{p.code}</span>
            </div>
            <div className="grid gap-3 xl:grid-cols-[minmax(0,320px)_1fr] xl:gap-12">
              <h3 className="text-h3 text-balance">{p.title}</h3>
              <p className="max-w-[640px] text-body text-gray text-pretty">{p.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ---------- How we work (dark, vertical rows) ---------- */

export function HowWeWork() {
  return (
    <Section dark id="how-we-work">
      <SectionHead dark index={C.howWeWork.index} eyebrow={C.howWeWork.eyebrow} title={C.howWeWork.title} lead={C.howWeWork.lead} />
      <ol className="border-t-2 border-paper">
        {steps.map((s, i) => (
          <li key={s.code} className="grid gap-3 border-b border-ink-line py-7 md:py-10 lg:grid-cols-[240px_1fr_1fr] lg:items-baseline lg:gap-12 xl:grid-cols-[280px_1fr_1fr]">
            <p className="font-mono text-meta font-bold text-red-text-dark">
              {pad2(i + 1)} / {s.code}
            </p>
            <h3 className="text-title text-balance">{s.title}</h3>
            <p className="text-body text-ink-text text-pretty">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 overflow-x-auto border-2 border-ink-line px-4 py-4 font-mono text-code text-ink-text md:mt-16 md:px-7 md:py-6">
        <p>
          $ <b className="font-normal text-paper">{C.howWeWork.terminalCommand}</b> {C.howWeWork.terminalArgs}
        </p>
        <p>{C.howWeWork.terminalSteps}</p>
        <p>
          {/* Master page: success mark in ink/red, never a division color */}
          <span className="font-bold text-paper">✓</span> {C.howWeWork.terminalDoneCode}{" "}
          <span className="font-sans">{C.howWeWork.terminalDone}</span>
        </p>
      </div>
    </Section>
  );
}

/* ---------- Brand story ---------- */

const swatchOrder: Division[] = ["master", "web", "ai", "faith"];

export function BrandStory() {
  return (
    <Section id="brand-story">
      {/* TODO(content): brand story — what "98" means. Add it here once the team has written it;
          until then the section only states facts from the brand file (dot colors, brand line). */}
      <SectionHead index={C.brandStory.index} eyebrow={C.brandStory.eyebrow} title={C.brandStory.title} lead={C.brandStory.lead} />
      <ul className="grid border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-4">
        {swatchOrder.map((d) => {
          const sw = C.brandStory.swatches[d];
          return (
            <li key={d} className="flex items-center gap-5 border-b-2 border-r-2 border-ink p-6 md:p-8 lg:flex-col lg:items-start">
              <i className={`size-10 shrink-0 rounded-full md:size-12 ${divisionTheme[d].bg}`} aria-hidden />
              <div className="flex flex-col gap-1 lg:mt-4">
                <p className="font-logo text-3xl font-extrabold leading-none tracking-[-0.02em]">{divisionTheme[d].name}</p>
                <p className="mt-2 font-mono text-meta text-gray">{sw.color}</p>
                <p className="text-body-sm text-gray">{sw.role}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 grid gap-3 border-t-2 border-ink pt-8 md:mt-14 lg:grid-cols-[240px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr]">
        <p className="label pt-1 text-gray">{C.brandStory.lineLabel}</p>
        <div>
          <p className="text-h3 text-balance">
            {site.tagline}
            <i className="ml-[0.1em] inline-block size-[0.22em] rounded-full bg-red" aria-hidden />
          </p>
          <p className="mt-3 max-w-[640px] text-body text-gray text-pretty">{C.brandStory.lineBody}</p>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Team ---------- */

function MemberCard({ m, index }: { m: TeamMember; index: number }) {
  return (
    <article className="flex flex-col border-2 border-ink bg-paper">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-ink text-paper sm:aspect-square" aria-hidden>
        <span className="absolute left-5 top-4 font-mono text-meta text-ink-text">{pad2(index + 1)}</span>
        <span className="font-logo text-numeral-lg font-extrabold tracking-tight">{m.initials}</span>
        <i className="absolute bottom-6 right-6 size-6 rounded-full bg-red" />
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t-2 border-ink p-6">
        <p className="label tracking-normal text-gray">
          {m.role} · {m.title}
        </p>
        <h3 className="mt-2 text-title">{m.nameKo}</h3>
        <p className="font-mono text-meta text-gray">{m.nameEn}</p>
      </div>
    </article>
  );
}

/** Open role: dashed 2px frame + mono OPEN ROLE label. No empty placeholder block. */
function OpenRoleCard({ r, index }: { r: OpenRole; index: number }) {
  return (
    <a
      href={`mailto:${site.email}?subject=${encodeURIComponent(C.team.applySubject(r.role))}`}
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
          <h3 className="text-title text-balance underline-offset-4 group-hover:underline">{r.role}</h3>
          <p className="text-body-sm text-gray text-pretty">{r.body}</p>
        </div>
      </div>
      <div className="flex min-h-11 items-center justify-between border-t-2 border-dashed border-ink px-6 py-4 text-body-sm font-bold transition-colors group-hover:bg-ink group-hover:text-paper">
        {C.team.openCta} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </a>
  );
}

export function Team() {
  return (
    <Section id="team">
      <SectionHead index={C.team.index} eyebrow={C.team.eyebrow} title={C.team.title} lead={C.team.lead} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((t, i) => (t.kind === "member" ? <MemberCard key={t.nameEn} m={t} index={i} /> : <OpenRoleCard key={t.role} r={t} index={i} />))}
      </div>
      <div className="mt-10 grid gap-3 border-t-2 border-ink pt-8 md:mt-14 lg:grid-cols-[240px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr]">
        <h3 className="text-title text-balance">{C.team.openLabel}</h3>
        <p className="max-w-[640px] text-body text-gray text-pretty">{C.team.openBody}</p>
      </div>
    </Section>
  );
}

/* ---------- Divisions overview ---------- */

export function DivisionsOverview() {
  return (
    <Section id="divisions">
      <SectionHead index={C.divisions.index} eyebrow={C.divisions.eyebrow} title={C.divisions.title} lead={C.divisions.lead} />
      <div className="grid gap-6 lg:grid-cols-3">
        {divisions.map((d) => (
          <DivisionCard key={d.slug} division={d} />
        ))}
      </div>
    </Section>
  );
}
