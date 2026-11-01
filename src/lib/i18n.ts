/**
 * Locale layer. Korean is the default and lives at the root (no prefix); English lives under /en.
 * Everything here is client-safe (no content imports) so headers, banners and forms can use it.
 * See docs/i18n.md.
 */
export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

/** URL prefix of a locale ("" for Korean, "/en" for English). */
export const LOCALE_PREFIX: Record<Locale, string> = { ko: "", en: "/en" };

export function isLocale(value: unknown): value is Locale {
  return value === "ko" || value === "en";
}

const isExternal = (p: string) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(p);

/**
 * Internal href for `path` in `locale`.
 *   localePath("ko", "/about")       → "/about"
 *   localePath("en", "/about")       → "/en/about"
 *   localePath("en", "/")            → "/en"
 *   localePath("en", "/#contact")    → "/en#contact"
 *   localePath("en", "#notify")      → "#notify"      (in-page anchors, external URLs and mailto: are untouched)
 * Paths that already carry the prefix are returned as-is, so it is safe to call twice.
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === "ko" || !path || path.startsWith("#") || isExternal(path)) return path;
  if (path === "/en" || path.startsWith("/en/") || path.startsWith("/en#") || path.startsWith("/en?")) return path;
  if (path === "/") return "/en";
  if (path.startsWith("/#") || path.startsWith("/?")) return `/en${path.slice(1)}`;
  return `/en${path.startsWith("/") ? path : `/${path}`}`;
}

/** Locale of a pathname ("/en/about" → "en", anything else → "ko"). */
export function localeFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ko";
}

/** Strip the locale prefix: "/en/about" → "/about", "/en" → "/". Korean paths are returned unchanged. */
export function stripLocale(pathname: string): string {
  if (pathname === "/en") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

/** Same page in another locale: switchLocalePath("/en/about", "ko") → "/about". Query/hash are not carried over. */
export function switchLocalePath(pathname: string, to: Locale): string {
  return localePath(to, stripLocale(pathname));
}

/** BCP 47 tag for `<html lang>`. */
export const HTML_LANG: Record<Locale, string> = { ko: "ko", en: "en" };

/** Open Graph locale. */
export const OG_LOCALE: Record<Locale, string> = { ko: "ko_KR", en: "en_US" };

/** Language switcher entries. Labels are written in their own language and never translated. */
export const LOCALE_LABEL: Record<Locale, string> = { ko: "한국어", en: "English" };

/** Pick a per-locale value: `t(locale, { ko: "…", en: "…" })`. Handy for tiny one-off strings; real copy goes in dictionaries. */
export function t<T>(locale: Locale, dict: Record<Locale, T>): T {
  return dict[locale];
}

/**
 * Widens the literal types of an `as const` copy object so another locale can satisfy the same shape:
 * `const aboutCopyEn: Dict<typeof aboutCopy> = { … }`.
 */
export type Dict<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends (...args: infer A) => infer R
      ? (...args: A) => Dict<R>
      : T extends readonly (infer U)[]
        ? readonly Dict<U>[]
        : T extends object
          ? { [K in keyof T]: Dict<T[K]> }
          : T;
