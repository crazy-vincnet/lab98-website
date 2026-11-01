"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABEL, switchLocalePath, type Locale } from "@/lib/i18n";
import { cx } from "@/components/ui";

const SHORT: Record<Locale, string> = { ko: "KO", en: "EN" };

/**
 * KO | EN switcher. Links to the same page in the other locale (/about ⇄ /en/about).
 * `full` shows the native names ("한국어" / "English", used in the footer); the default is the compact header form.
 * The current locale is `aria-current`; the other is a normal link with `hrefLang` and `lang`.
 */
export function LanguageSwitcher({ locale, ariaLabel, full = false, className, onNavigate }: { locale: Locale; ariaLabel: string; full?: boolean; className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label={ariaLabel} className={cx("flex items-center gap-1 font-mono text-[13px] font-bold", className)}>
      {LOCALES.map((l, i) => {
        const current = l === locale;
        const label = full ? LOCALE_LABEL[l] : SHORT[l];
        return (
          <span key={l} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden className="text-gray">|</span>}
            {current ? (
              <span aria-current="true" lang={l} title={LOCALE_LABEL[l]} className="inline-flex min-h-11 min-w-8 items-center justify-center px-1 underline decoration-2 underline-offset-8">
                {label}
              </span>
            ) : (
              <Link
                href={switchLocalePath(pathname, l)}
                hrefLang={l}
                lang={l}
                title={LOCALE_LABEL[l]}
                aria-label={LOCALE_LABEL[l]}
                onClick={onNavigate}
                className="inline-flex min-h-11 min-w-8 items-center justify-center px-1 text-gray hover:text-ink hover:underline hover:underline-offset-8"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
