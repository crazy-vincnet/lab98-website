import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { localePath, type Locale } from "@/lib/i18n";
import { CONTACT_HREF, COOKIES_PATH, PRAISE_TOOL_PATH, PRIVACY_PATH, PRIVACY_REQUEST_PATH, UNSUBSCRIBE_PATH } from "@/components/experiments/paths";
import type { LegalLinkName } from "./legal-copy-types";

/** Values for {token} placeholders. Anything else in braces is left as written. */
export type LegalTokens = Record<string, string>;

export const fillTokens = (s: string, t: LegalTokens) => s.replace(/\{([A-Za-z_][\w.]*)\}/g, (m, k: string) => (Object.hasOwn(t, k) ? t[k] : m));

export const legalLinkHref = (locale: Locale, name: LegalLinkName): string =>
  localePath(
    locale,
    {
      praise: PRAISE_TOOL_PATH,
      privacyRequest: PRIVACY_REQUEST_PATH,
      cookies: COOKIES_PATH,
      unsubscribe: UNSUBSCRIBE_PATH,
      contact: CONTACT_HREF,
      privacy: PRIVACY_PATH,
    }[name],
  );

const isLinkName = (n: string): n is LegalLinkName => ["praise", "privacyRequest", "cookies", "unsubscribe", "contact", "privacy"].includes(n);

/** Resolves an href from the markup; returns null when it is not allowed (then the link is rendered as plain text). */
function safeHref(raw: string, locale: Locale): string | null {
  if (raw.startsWith("link:")) {
    const n = raw.slice(5);
    return isLinkName(n) ? legalLinkHref(locale, n) : null;
  }
  if (/^mailto:[^\s@<>"]+@[^\s@<>"]+$/.test(raw)) return raw;
  if (/^https:\/\/[^\s<>"]+$/.test(raw)) return raw;
  if (/^\/(?!\/)[^\s<>"]*$/.test(raw)) return localePath(locale, raw);
  return null;
}

const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * Strict inline renderer: only emits React elements/strings (never HTML), links limited to relative paths, https and mailto.
 * Tokens are filled AFTER parsing so a token value can never introduce markup.
 */
export function renderInline(text: string, ctx: { locale: Locale; tokens: LegalTokens }): ReactNode {
  const { locale, tokens } = ctx;
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(fillTokens(text.slice(last, m.index), tokens));
    const key = i++;
    if (m[1] !== undefined) out.push(<strong key={key}>{fillTokens(m[1], tokens)}</strong>);
    else if (m[2] !== undefined)
      out.push(
        <code key={key} className="font-mono text-code">
          {fillTokens(m[2], tokens)}
        </code>,
      );
    else {
      const label = fillTokens(m[3], tokens);
      const href = safeHref(fillTokens(m[4], tokens), locale);
      if (!href) out.push(label);
      else if (href.startsWith("mailto:")) out.push(<a key={key} href={href}>{label}</a>);
      else if (href.startsWith("https://"))
        out.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>,
        );
      else out.push(<Link key={key} href={href}>{label}</Link>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(fillTokens(text.slice(last), tokens));
  if (out.length === 1 && typeof out[0] === "string") return out[0];
  return out.map((n, k) => <Fragment key={k}>{n}</Fragment>);
}
