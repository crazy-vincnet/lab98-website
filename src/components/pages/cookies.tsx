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
 * 쿠키 정책. Text lives in src/components/legal/cookies.copy.ts (+ .en.ts); editable as `legal.cookies`.
 * Facts: no cookies, no third-party scripts; the only browser storage is the consent choice (`lab98-consent`).
 */
const PATH = "/cookies";

/** Keep in sync with site.business.name. */
const OWNER = "제이제이드림(JJdream, 브랜드명 Lab98)";
const OWNER_EN = "JJdream (제이제이드림, brand name Lab98)";
const host = site.url.replace(/^https?:\/\//, "");

const docMeta: Record<Locale, { title: string; description: string }> = {
  ko: { title: "쿠키 정책", description: `${site.name} 웹사이트는 쿠키를 쓰지 않아요. 브라우저에 저장하는 동의 선택 하나와 쓰지 않는 것, 선택을 바꾸고 지우는 방법을 안내해요.` },
  en: {
    title: 'Cookie Policy',
    description: 'The Lab98 website does not use cookies. It explains the one consent choice stored in your browser, what we do not use, and how to change or clear your choice.',
  },
};

export const cookiesMetadata = (locale: Locale): Metadata => pageMetadata({ ...docMeta[locale], path: PATH, locale });

export async function CookiesPage({ locale }: { locale: Locale }) {
  const { title, description } = docMeta[locale];
  const path = localePath(locale, PATH);
  const crumbs = [{ name: title, path }];
  const jsonLd = graph(webPage({ path, name: title, description, crumbs, extra: { publisher: { "@id": ORG_ID } }, locale }), breadcrumb(path, crumbs, locale));
  const copy = await getCopy(legalKey("cookies"), locale, getLegalDocCopy("cookies", locale));
  const tokens = { email: site.email, company: locale === "en" ? OWNER_EN : OWNER, host, officer: getContent(locale).site.business.representative };
  return (
    <>
      <JsonLd data={jsonLd} />
      <LegalDocView locale={locale} label="Cookies" copy={copy} defaultVersion={LEGAL_DEFAULT_VERSION.cookies} tokens={tokens} />
    </>
  );
}
