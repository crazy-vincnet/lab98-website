import Link from "next/link";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { getChromeCopy } from "@/components/chrome/copy.en";
import { getCopy } from "@/lib/copy-store";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Lockup, cx } from "@/components/ui";
import {
  CONTACT_HREF,
  COOKIES_PATH,
  HOME_ANCHORS,
  INSIGHTS_PATH,
  PRAISE_TOOL_PATH,
  PRIVACY_PATH,
  PRIVACY_REQUEST_PATH,
  PROJECTS_PATH,
  TERMS_PATH,
  UNSUBSCRIBE_PATH,
  divisionHref,
} from "@/components/experiments/paths";
import { OpenCookieSettingsButton } from "@/components/legal/open-cookie-settings-button";
import { routes } from "@/components/home/copy";

/** ≥44px touch target; text stays in the mono meta row. */
const legalLinkClass = "inline-flex min-h-11 items-center px-2 hover:text-paper hover:underline hover:underline-offset-4";

export async function SiteFooter({ locale = "ko" }: { locale?: Locale }) {
  const { site, divisions } = getContent(locale);
  // Admin-editable (registry key "chrome.footer").
  const t = await getCopy("chrome.footer", locale, getChromeCopy(locale).footer);
  const lp = (path: string) => localePath(locale, path);
  const host = site.url.replace(/^https?:\/\//, "");
  const hasSocial = site.social.length > 0;
  // "Technology is the tool. People are the point." → last period becomes the red dot.
  const slogan = site.sloganEn.replace(/\.$/, "");
  const businessLine = t.businessLine(site);

  const companyLinks = [
    { label: t.companyLinks.about, href: routes.about },
    { label: t.companyLinks.process, href: `/#${HOME_ANCHORS.process}` },
    { label: t.companyLinks.projects, href: PROJECTS_PATH },
    { label: t.companyLinks.praiseTool, href: PRAISE_TOOL_PATH },
    { label: t.companyLinks.insights, href: INSIGHTS_PATH },
    { label: t.companyLinks.contact, href: CONTACT_HREF },
  ].map((l) => ({ ...l, href: lp(l.href) }));

  /** Order is fixed: privacy policy (bold, must be prominent) → terms → cookie policy → cookie settings → privacy request → unsubscribe. */
  const legalLinks = [
    { label: t.legal.privacy, href: lp(PRIVACY_PATH), strong: true },
    { label: t.legal.terms, href: lp(TERMS_PATH), strong: false },
    { label: t.legal.cookies, href: lp(COOKIES_PATH), strong: false },
  ];
  const requestLinks = [
    { label: t.legal.privacyRequest, href: lp(PRIVACY_REQUEST_PATH) },
    { label: t.legal.unsubscribe, href: lp(UNSUBSCRIBE_PATH) },
  ];

  return (
    <footer className="bg-ink text-paper">
      <div className="wrap pb-12 pt-14 md:pt-[72px]">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <Lockup inverse height={48} className="h-10 w-auto md:h-12" />
          <div className={cx("grid w-full grid-cols-2 gap-x-8 gap-y-10 text-base sm:w-auto md:gap-16", hasSocial && "sm:grid-cols-3")}>
            <FooterCol title={t.company} links={companyLinks} />
            <FooterCol title={t.services} links={divisions.map((d) => ({ label: d.role, href: lp(divisionHref(d.slug)) }))} />
            {hasSocial && <FooterCol title={t.follow} links={site.social.map((s) => ({ label: s.label, href: s.href }))} />}
          </div>
        </div>
        <p lang="en" className="mt-14 max-w-[1100px] text-balance font-logo text-numeral-lg font-extrabold tracking-[-0.03em] md:mt-24">
          {slogan}
          <span className="ml-[0.06em] inline-block size-[0.2em] rounded-full bg-red align-baseline" aria-hidden />
          <span className="sr-only">.</span>
        </p>
        <div className="mt-10 flex flex-col gap-3 border-t border-ink-line pt-6 font-mono text-meta text-ink-text">
          <p className="ko-tight">{businessLine.join(" · ")}</p>
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-8">
            <span>
              © 2026 {site.name} · {host} ·{" "}
              <a href={`mailto:${site.email}`} className="-my-2.5 inline-block py-2.5 hover:text-paper hover:underline hover:underline-offset-4">
                {site.email}
              </a>
            </span>
            <nav aria-label={t.legalNavAria} className="-my-2.5">
              <ul className="ko-tight -mx-2 flex flex-wrap items-center md:justify-end">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={cx(legalLinkClass, l.strong && "font-bold text-paper")}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <OpenCookieSettingsButton className={cx(legalLinkClass, "cursor-pointer")}>{t.legal.cookieSettings}</OpenCookieSettingsButton>
                </li>
                {requestLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={legalLinkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <LanguageSwitcher locale={locale} full className="px-2" />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-5">
      <span className="mb-1.5 font-mono text-micro uppercase text-ink-text">{title}</span>
      {links.map((l) => (
        <Link key={l.label} href={l.href} className="-my-2.5 py-2.5 hover:underline hover:underline-offset-4">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
