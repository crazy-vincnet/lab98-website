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
 * 개인정보처리방침 (개인정보 보호법 제30조 · 개인정보위 작성지침 기준). Text lives in src/components/legal/privacy.copy.ts (+ .en.ts); editable as `legal.privacy`.
 * If a form collects new fields, a processor is added, or browser storage changes, update the text, the effective date, and add a history entry.
 */
const PATH = "/privacy";

/** Keep in sync with site.business.name. */
const OWNER = "제이제이드림(JJdream, 브랜드명 Lab98)";
const OWNER_EN = "JJdream (제이제이드림, brand name Lab98)";
const host = site.url.replace(/^https?:\/\//, "");

const docMeta: Record<Locale, { title: string; description: string }> = {
  ko: { title: "개인정보처리방침", description: `${site.name}(${site.business.name})이 문의, 출시 알림 신청, 개인정보 요청, 수신거부를 처리하며 개인정보를 어떻게 수집·이용·보관·파기하는지 안내해요.` },
  en: {
    title: 'Privacy Policy',
    description: 'How Lab98 (JJdream) collects, uses, keeps and deletes personal information when handling inquiries, Praise Tool launch notification sign-ups, privacy requests and unsubscribe requests.',
  },
};

export const privacyMetadata = (locale: Locale): Metadata => pageMetadata({ ...docMeta[locale], path: PATH, locale });

export async function PrivacyPage({ locale }: { locale: Locale }) {
  const { title, description } = docMeta[locale];
  const path = localePath(locale, PATH);
  const crumbs = [{ name: title, path }];
  const jsonLd = graph(webPage({ path, name: title, description, crumbs, extra: { publisher: { "@id": ORG_ID } }, locale }), breadcrumb(path, crumbs, locale));
  const copy = await getCopy(legalKey("privacy"), locale, getLegalDocCopy("privacy", locale));
  const tokens = { email: site.email, company: locale === "en" ? OWNER_EN : OWNER, host, officer: getContent(locale).site.business.representative };
  return (
    <>
      <JsonLd data={jsonLd} />
      <LegalDocView locale={locale} label="Privacy" copy={copy} defaultVersion={LEGAL_DEFAULT_VERSION.privacy} tokens={tokens} />
    </>
  );
}
