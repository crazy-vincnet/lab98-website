import type { Locale } from "@/lib/i18n";
import type { LegalDocCopy, LegalDocKind } from "./legal-copy-types";
import { cookiesKo, COOKIES_DEFAULT_VERSION } from "./cookies.copy";
import { cookiesEn } from "./cookies.en";
import { privacyKo, PRIVACY_DEFAULT_VERSION } from "./privacy.copy";
import { privacyEn } from "./privacy.en";
import { termsKo, TERMS_DEFAULT_VERSION } from "./terms.copy";
import { termsEn } from "./terms.en";

/** Code defaults of a legal document (the object passed to getCopy). */
export const getLegalDocCopy = (kind: LegalDocKind, locale: Locale): LegalDocCopy =>
  ({ privacy: { ko: privacyKo, en: privacyEn }, terms: { ko: termsKo, en: termsEn }, cookies: { ko: cookiesKo, en: cookiesEn } })[kind][locale];

export const LEGAL_DEFAULT_VERSION: Record<LegalDocKind, string> = { privacy: PRIVACY_DEFAULT_VERSION, terms: TERMS_DEFAULT_VERSION, cookies: COOKIES_DEFAULT_VERSION };

/** Registry key of a legal document. */
export const legalKey = (kind: LegalDocKind) => `legal.${kind}`;
