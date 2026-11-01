import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink, SectionHead, Tag, cx } from "@/components/ui";
import { LaunchDday } from "@/components/praise-tool/launch-dday";
import { LaunchSignupForm } from "@/components/praise-tool/launch-signup-form";
import { CONTACT_HREF, PRAISE_TOOL_PATH, divisionHref } from "@/components/experiments/paths";
import { FaqSection } from "@/components/faq/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { divisionTheme, faqs, getDivision, site } from "@/lib/content";
import { praiseTool as P, type PtItem } from "@/lib/praise-tool";
import { breadcrumb, faqPage, graph, praiseToolApp, webPage } from "@/lib/structured-data";

// Public, content-only product page: the whole route must prerender. The D-day badge is computed in the browser.
export const ensureStatic = "navigation";

const title = "Praise Tool — 찬양 가사 송출 프로그램 | Lab98";
const description =
  "예배용 찬양 가사 송출 프로그램 Praise Tool로 가사, 설교 슬라이드, 성경 구절, 영상을 한 번에 띄워요. NDI 방송 출력, macOS·Windows 지원, 2026년 11월 11일 출시, 100,000원 영구 라이선스예요.";

export const metadata: Metadata = pageMetadata({ title, absoluteTitle: true, ogTitle: P.meta.title, description, path: PRAISE_TOOL_PATH });

const faithDivision = getDivision("faith");
const crumbs = [
  ...(faithDivision ? [{ name: faithDivision.name, path: divisionHref("faith") }] : []),
  { name: P.hero.title, path: PRAISE_TOOL_PATH },
];
const app = praiseToolApp();
const jsonLd = graph(
  webPage({ path: PRAISE_TOOL_PATH, name: title, description, type: "ItemPage", crumbs, extra: { mainEntity: { "@id": app["@id"] } } }),
  app,
  breadcrumb(PRAISE_TOOL_PATH, crumbs),
  faqPage(PRAISE_TOOL_PATH, faqs.praiseTool),
);

const faith = divisionTheme.faith;
const pad2 = (n: number) => String(n).padStart(2, "0");

function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cx("border-t-2 border-ink", className)}>
      <div className="wrap py-16 md:py-24 xl:py-28">{children}</div>
    </section>
  );
}

/** Numbered item grid used by "한눈에 보기" and "안심하고 쓰는 송출". */
function ItemGrid({ items }: { items: readonly PtItem[] }) {
  return (
    <ol className="grid border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <li key={it.title ?? i} className="flex flex-col gap-3 border-b-2 border-r-2 border-ink bg-paper p-6 md:p-8">
          <span className={cx("font-mono text-meta font-bold", faith.text)} aria-hidden>
            {pad2(i + 1)}
          </span>
          {it.title && <h3 className="text-title text-balance">{it.title}</h3>}
          <p className="text-body-sm text-gray text-pretty">{it.body}</p>
        </li>
      ))}
    </ol>
  );
}

export default function PraiseToolPage() {
  const h = P.hero;
  return (
    <>
      <JsonLd data={jsonLd} />
      {/* 1. Hero */}
      <section>
        <div className="wrap grid gap-10 pb-14 pt-12 md:gap-14 md:pb-20 md:pt-20 lg:grid-cols-[1fr_1.1fr] lg:items-center xl:pt-24">
          <div className="animate-rise">
            <p className="label flex items-center gap-2.5 text-gray">
              <i className={cx("size-2.5 rounded-full", faith.bg)} aria-hidden />
              <span className="ko-tight">{h.eyebrow}</span>
            </p>
            <h1 className="mt-5 font-logo text-display text-balance">{h.title}</h1>
            <p className="mt-5 text-h3 text-balance">{h.sub}</p>
            <p className="mt-6 max-w-[600px] text-lead text-gray text-pretty">{h.lead}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="지원 운영체제와 언어">
              {h.badges.map((b) => (
                <li key={b}>
                  <Tag caps={false}>{b}</Tag>
                </li>
              ))}
            </ul>

            <dl className="mt-8 grid border-2 border-ink sm:grid-cols-2">
              <div className="flex flex-col gap-2 border-b-2 border-ink p-5 sm:border-b-0 sm:border-r-2">
                <dt className="font-mono text-meta text-gray">{h.priceLabel}</dt>
                <dd>
                  <span className="text-title">{h.price}</span>
                  <span className="mt-1 block text-body-sm text-gray">
                    {h.license} ({h.licenseNote})
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-2 p-5">
                <dt className="font-mono text-meta text-gray">{h.launchLabel}</dt>
                <dd className="flex flex-col items-start gap-2">
                  <span className="text-title">{h.launch}</span>
                  <LaunchDday className="inline-flex border-2 border-ink bg-faith px-2.5 py-1 font-mono text-meta font-bold text-ink" />
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <ButtonLink href="#notify">
                {h.ctaNotify} <span aria-hidden>→</span>
              </ButtonLink>
              <ButtonLink href="#features" variant="secondary">
                {h.ctaFeatures}
              </ButtonLink>
            </div>
          </div>

          {/* TODO(content): replace with real screenshots when the client sends them (16:9, next/image). */}
          <figure className="flex aspect-video items-center justify-center border-2 border-ink bg-concrete" role="img" aria-label={h.screenshotAlt}>
            <span className="label ko-tight text-gray" aria-hidden>
              {h.screenshot}
            </span>
          </figure>
        </div>
      </section>

      {/* 2. 한눈에 보기 */}
      <Section className="bg-concrete">
        <SectionHead index="01" eyebrow={P.glance.eyebrow} title={P.glance.title} />
        <ItemGrid items={P.glance.items} />
      </Section>

      {/* 3. 주요 기능 */}
      <Section id="features">
        <SectionHead index="02" eyebrow={P.features.eyebrow} title={P.features.title} lead={P.features.lead} />
        <nav aria-label="기능 분류" className="mb-10 md:mb-14">
          <ul className="flex flex-wrap gap-2">
            {P.features.groups.map((g, i) => (
              <li key={g.key}>
                <a
                  href={`#feature-${g.key}`}
                  className="inline-flex min-h-11 items-center gap-2 border-2 border-ink px-4 py-2 text-body-sm font-bold transition-colors duration-150 hover:bg-ink hover:text-paper"
                >
                  <span className="font-mono text-meta" aria-hidden>
                    {pad2(i + 1)}
                  </span>
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t-2 border-ink">
          {P.features.groups.map((g, i) => (
            <section key={g.key} id={`feature-${g.key}`} aria-labelledby={`feature-${g.key}-title`} className="grid gap-6 border-b-2 border-ink py-10 md:py-14 lg:grid-cols-[280px_1fr] lg:gap-12">
              <div>
                <p className={cx("font-mono text-meta font-bold", faith.text)} aria-hidden>
                  {pad2(i + 1)} / {pad2(P.features.groups.length)}
                </p>
                <h3 id={`feature-${g.key}-title`} className="mt-2 text-h3">
                  {g.title}
                </h3>
              </div>
              <ul className="grid gap-x-10 gap-y-7 md:grid-cols-2">
                {g.items.map((it) => (
                  <li key={it.title} className="border-l-2 border-faith pl-4">
                    <p className="text-body font-bold">{it.title}</p>
                    <p className="mt-1.5 text-body-sm text-gray text-pretty">{it.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      {/* 4. 안심하고 쓰는 송출 */}
      <Section className="bg-concrete">
        <SectionHead index="03" eyebrow={P.safety.eyebrow} title={P.safety.title} lead={P.safety.lead} />
        <ItemGrid items={P.safety.items} />
      </Section>

      {/* 5. 지원 환경 */}
      <Section>
        <SectionHead index="04" eyebrow={P.requirements.eyebrow} title={P.requirements.title} />
        <div className="max-w-[760px]">
          <table className="w-full border-collapse border-2 border-ink text-left">
            <caption className="sr-only">{P.requirements.caption}</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">{P.requirements.head[0]}</th>
                <th scope="col">{P.requirements.head[1]}</th>
              </tr>
            </thead>
            <tbody>
              {P.requirements.rows.map((r) => (
                <tr key={r.label} className="border-b-2 border-ink last:border-b-0">
                  <th scope="row" className="w-[36%] border-r-2 border-ink bg-concrete px-4 py-4 align-top font-mono text-meta font-bold md:px-6">
                    {r.label}
                  </th>
                  <td className="px-4 py-4 text-body-sm md:px-6">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 flex gap-2 text-body-sm text-gray">
            <span className="font-mono text-meta font-bold text-ink" aria-hidden>
              NOTE
            </span>
            {P.requirements.note}
          </p>
        </div>
      </Section>

      {/* 6. 자주 묻는 질문 */}
      <FaqSection items={faqs.praiseTool} index="05" />

      {/* 7. 가격 + 출시 알림 신청 */}
      <Section id="notify" className="bg-concrete">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="label text-gray">06 — {P.notify.eyebrow}</p>
            <h2 className="mt-3 text-h2 text-balance">{P.notify.title}</h2>
            <p className="mt-4 max-w-[520px] text-body text-gray text-pretty">{P.notify.lead}</p>

            <div className="mt-10 border-2 border-ink bg-paper p-6 md:p-8">
              <p className="label text-gray">
                {P.pricing.eyebrow} · <span className="ko-tight font-sans">{P.pricing.title}</span>
              </p>
              <p className="mt-4 font-logo text-h1">{P.pricing.price}</p>
              <p className="mt-2 text-body font-bold">{P.pricing.plan}</p>
              <p className="mt-1 text-body-sm text-gray">{P.pricing.note}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t-2 border-ink pt-5">
                <span className="text-body-sm font-bold">{h.launch}</span>
                <LaunchDday className="inline-flex border-2 border-ink bg-faith px-2.5 py-1 font-mono text-meta font-bold text-ink" />
              </div>
            </div>
          </div>
          <LaunchSignupForm to={site.email} />
        </div>
      </Section>

      {/* 8. 문의 · Faith 서비스 */}
      <section className="border-t-2 border-ink">
        <div className="wrap flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between md:py-12">
          <p className="text-body text-pretty">{P.more.text}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <ButtonLink href={CONTACT_HREF} variant="secondary" size="sm">
              {P.more.contact} <span aria-hidden>→</span>
            </ButtonLink>
            <Link href={divisionHref("faith")} className="inline-flex min-h-11 items-center text-body-sm font-bold underline underline-offset-4 hover:text-faith-text">
              {P.more.division}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
