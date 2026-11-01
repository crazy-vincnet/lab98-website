import type { Metadata } from "next";
import { InsightRow } from "@/components/cards";
import { INSIGHTS_PATH } from "@/components/experiments/paths";
import { getNotesCopy } from "@/components/notes/copy.en";
import { FeaturedInsight } from "@/components/notes/featured-insight";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { localePath, type Locale } from "@/lib/i18n";
import { getInsights } from "@/lib/insights";
import { blog, breadcrumb, graph, webPage } from "@/lib/structured-data";

const seo = (locale: Locale) => {
  const t = getNotesCopy(locale);
  return locale === "en"
    ? {
        title: `${t.meta.title} — Company blog`,
        description:
          "Posts about how Lab98 works and the stories of our three divisions: web and software development (Dev), AI training (AI) and software for churches (Faith). Written by our founder.",
      }
    : {
        title: `${t.meta.title} — 회사 블로그`,
        description: "Lab98이 일하는 방식과 홈페이지·프로그램 제작(Dev), AI 교육(AI), 교회 프로그램(Faith) 세 사업부의 이야기를 글로 나눠요. 파운더가 직접 쓴 글을 모았어요.",
      };
};

export const insightsMetadata = (locale: Locale): Metadata => pageMetadata({ ...seo(locale), path: INSIGHTS_PATH, locale });

export async function InsightsPage({ locale }: { locale: Locale }) {
  const t = getNotesCopy(locale);
  const notes = await getInsights(locale);
  const [featured, ...rest] = notes;
  const { title, description } = seo(locale);
  const path = localePath(locale, INSIGHTS_PATH);
  const crumbs = [{ name: t.meta.title, path }];
  const jsonLd = graph(
    webPage({ path, name: title, description, type: "CollectionPage", crumbs, extra: { mainEntity: { "@id": blog(notes, description, locale)["@id"] } }, locale }),
    blog(notes, description, locale),
    breadcrumb(path, crumbs, locale),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="wrap pb-10 pt-14 md:pb-14 md:pt-24">
        <p className="label animate-rise text-gray">{t.index.eyebrow}</p>
        <h1 className="mt-5 animate-rise text-h1 text-balance">{t.index.title}</h1>
        <p className="mt-5 max-w-[640px] animate-rise text-lead text-pretty text-gray">{t.index.lead}</p>
      </section>
      <section className="wrap pb-20 md:pb-32" aria-label={t.index.listLabel}>
        {featured && <FeaturedInsight note={featured} locale={locale} />}
        {rest.length > 0 && (
          <div className="mt-12 md:mt-16">
            <p className="label ko-tight mb-4 text-gray">{t.index.moreLabel}</p>
            <ul className="border-t-2 border-ink">
              {rest.map((n) => (
                <li key={n.slug}>
                  <InsightRow note={n} headingLevel="h2" locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
