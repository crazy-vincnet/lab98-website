import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { ORG_ID, breadcrumb, graph, webPage } from "@/lib/structured-data";
import { site } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { getCopy } from "@/lib/copy-store";
import { localePath, type Locale } from "@/lib/i18n";
import { LegalDocView } from "@/components/legal/legal-view";
import { LEGAL_DEFAULT_VERSION, getLegalDocCopy, legalKey } from "@/components/legal/legal-copies";

/**
 * 이용약관 - covers the lab98.io website only. Text lives in src/components/legal/terms.copy.ts (+ .en.ts); editable as `legal.terms`.
 */
const PATH = "/terms";

/** Keep in sync with site.business.name. */
const OWNER = "제이제이드림(JJdream, 브랜드명 Lab98)";
const OWNER_EN = "JJdream (제이제이드림, brand name Lab98)";
const host = site.url.replace(/^https?:\/\//, "");

const docMeta: Record<Locale, { title: string; description: string }> = {
  ko: { title: "이용약관", description: `${site.name} 웹사이트(${site.url.replace(/^https?:\/\//, "")}) 이용 조건과 회사·이용자의 권리와 의무, 문의·견적의 성격, 지식재산권, 면책과 분쟁 해결 기준을 안내해요.` },
  en: {
    title: 'Terms of Use',
    description: 'The conditions for using the Lab98 website, the rights and duties of the company and users, the nature of inquiries and quotes, intellectual property, and limits of liability.',
  },
};

export const termsMetadata = (locale: Locale): Metadata => pageMetadata({ ...docMeta[locale], path: PATH, locale });

export async function TermsPage({ locale }: { locale: Locale }) {
  const { title, description } = docMeta[locale];
  const path = localePath(locale, PATH);
  const crumbs = [{ name: title, path }];
  const jsonLd = graph(webPage({ path, name: title, description, crumbs, extra: { publisher: { "@id": ORG_ID } }, locale }), breadcrumb(path, crumbs, locale));
  const copy = await getCopy(legalKey("terms"), locale, getLegalDocCopy("terms", locale));
  const tokens = { email: site.email, company: locale === "en" ? OWNER_EN : OWNER, host, officer: getContent(locale).site.business.representative };
  return (
    <>
      <JsonLd data={jsonLd} />
      <LegalDocView locale={locale} label="Terms" copy={copy} defaultVersion={LEGAL_DEFAULT_VERSION.terms} tokens={tokens} />
    </>
  );
}
