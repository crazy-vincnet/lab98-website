import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui";
import type { Dict, Locale } from "@/lib/i18n";
import { LegalDoc, LegalTable, type LegalSection } from "./legal-doc";
import type { LegalDocCopy, LegalLinkName } from "./legal-copy-types";
import { legalLinkHref, renderInline, type LegalTokens } from "./legal-inline";
import { OpenCookieSettingsButton } from "./open-cookie-settings-button";

const COOKIE_BUTTON_CLASS =
  "inline-flex min-h-11 cursor-pointer items-center justify-center border-2 border-ink bg-paper px-5 py-3.5 text-[15px] font-bold leading-none text-ink transition-colors hover:bg-ink hover:text-paper";

/**
 * Generic renderer for the typed legal documents (privacy / terms / cookies).
 * `copy` is the merged copy (code default + published overrides); `defaultVersion` is the code default of `copy.version`.
 */
export function LegalDocView({
  locale,
  label,
  copy,
  defaultVersion,
  tokens,
}: {
  locale: Locale;
  label: string;
  copy: Dict<LegalDocCopy>;
  defaultVersion: string;
  /** Dynamic site values: {email} {company} {host} {officer}. {effectiveDate} is added here from the copy. */
  tokens: LegalTokens;
}) {
  const t: LegalTokens = { ...tokens, effectiveDate: copy.effectiveDate };
  const inline = (s: string) => renderInline(s, { locale, tokens: t });

  const block = (b: Dict<LegalDocCopy>["sections"][number]["blocks"][number], i: number): ReactNode => {
    if ("p" in b) return <p key={i}>{inline(b.p)}</p>;
    if ("ul" in b)
      return (
        <ul key={i}>
          {b.ul.map((li, k) => (
            <li key={k}>{inline(li)}</li>
          ))}
        </ul>
      );
    if ("table" in b) return <LegalTable key={i} caption={b.table.caption} columns={[...b.table.head]} rows={b.table.rows.map((r) => r.map(inline))} />;
    if ("button" in b)
      return (
        <div key={i}>
          <ButtonLink href={legalLinkHref(locale, b.href as LegalLinkName)} variant="secondary" size="sm" className="min-h-11 no-underline! hover:text-paper!">
            {b.button}
          </ButtonLink>
        </div>
      );
    return (
      <div key={i}>
        <OpenCookieSettingsButton className={COOKIE_BUTTON_CLASS}>{b.cookieButton}</OpenCookieSettingsButton>
      </div>
    );
  };

  const sections: LegalSection[] = copy.sections.map((s) => ({
    id: s.id,
    title: s.heading,
    body: <>{s.blocks.map(block)}</>,
  }));

  return (
    <LegalDoc
      locale={locale}
      label={label}
      title={copy.title}
      intro={
        copy.introNote !== undefined ? (
          <>
            {copy.intro.map((p, i) => (
              <p key={i}>{inline(p)}</p>
            ))}
            <p className="mt-3 text-body-sm">{inline(copy.introNote)}</p>
          </>
        ) : copy.intro.length === 1 ? (
          <p>{inline(copy.intro[0])}</p>
        ) : (
          <>
            {copy.intro.map((p, i) => (
              <p key={i}>{inline(p)}</p>
            ))}
          </>
        )
      }
      effectiveDate={copy.effectiveDate}
      version={copy.version !== defaultVersion ? copy.version : undefined}
      sections={sections}
      history={copy.history.map((h) => ({ ...h }))}
    />
  );
}
