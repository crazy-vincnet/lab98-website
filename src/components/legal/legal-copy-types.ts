/**
 * Data model of a legal document (privacy / terms / cookies), editable through the content engine (docs/admin-content.md).
 *
 * Every string below is an editable leaf (arrays and table cells by index). Structure (which block comes where, section ids,
 * link targets) lives in code. A block's KIND is decided by which key is present, so there is no editable "type" string.
 *
 * Inline markup supported inside any string (strict, see legal-inline.tsx):
 *   **bold**   `code`   [text](/relative | https://… | mailto:… | link:name)
 * `link:name` refers to LEGAL_LINKS (locale-aware internal pages), so the URLs themselves stay in code.
 * Tokens (exactly the same set must stay in an override): {email} {company} {host} {officer} {effectiveDate}.
 */
export type LegalTableCopy = { caption: string; head: string[]; rows: string[][] };

export type LegalBlock =
  | { p: string }
  | { ul: string[] }
  | { table: LegalTableCopy }
  /** Secondary button link. `href` holds a LEGAL_LINKS name (not editable: the key name `href` is hidden by the engine). */
  | { button: string; href: string }
  /** Button that reopens the cookie-consent settings. */
  | { cookieButton: string };

export type LegalSectionCopy = { id: string; heading: string; blocks: LegalBlock[] };

export type LegalDocCopy = {
  title: string;
  /** Paragraphs of the intro under the title. */
  intro: string[];
  /** Small extra paragraph under the intro (English pages: "Korean version prevails"). */
  introNote?: string;
  /** Shown after the "Effective" label and used for the {effectiveDate} token. */
  effectiveDate: string;
  /**
   * Version label. Not shown while it equals the code default; once the owner edits it, it appears after the effective date
   * (so the public page stays byte-identical until someone actually changes it).
   */
  version: string;
  sections: LegalSectionCopy[];
  history: { date: string; note: string }[];
};

/** Internal pages that legal text may link to with `[text](link:name)`. */
export const LEGAL_LINK_NAMES = ["praise", "privacyRequest", "cookies", "unsubscribe", "contact", "privacy"] as const;
export type LegalLinkName = (typeof LEGAL_LINK_NAMES)[number];

export type LegalDocKind = "privacy" | "terms" | "cookies";
