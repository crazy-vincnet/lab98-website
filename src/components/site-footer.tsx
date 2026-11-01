import Link from "next/link";
import { divisions, site } from "@/lib/content";
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

const companyLinks = [
  { label: "회사 소개", href: routes.about },
  { label: "일하는 방식", href: `/#${HOME_ANCHORS.process}` },
  { label: "프로젝트", href: PROJECTS_PATH },
  { label: "Praise Tool", href: PRAISE_TOOL_PATH },
  { label: "인사이트", href: INSIGHTS_PATH },
  { label: "문의", href: CONTACT_HREF },
];

/** Order is fixed: 개인정보처리방침 (bold, must be prominent) → 이용약관 → 쿠키 정책 → 쿠키 설정 → 개인정보 요청 → 수신거부. */
const legalLinks = [
  { label: "개인정보처리방침", href: PRIVACY_PATH, strong: true },
  { label: "이용약관", href: TERMS_PATH, strong: false },
  { label: "쿠키 정책", href: COOKIES_PATH, strong: false },
];
const requestLinks = [
  { label: "개인정보 요청", href: PRIVACY_REQUEST_PATH },
  { label: "수신거부", href: UNSUBSCRIBE_PATH },
];
/** ≥44px touch target; text stays in the mono meta row. */
const legalLinkClass = "inline-flex min-h-11 items-center px-2 hover:text-paper hover:underline hover:underline-offset-4";

const host = site.url.replace(/^https?:\/\//, "");

export function SiteFooter() {
  const { business } = site;
  const hasSocial = site.social.length > 0;
  // "Technology is the tool. People are the point." → last period becomes the red dot.
  const slogan = site.sloganEn.replace(/\.$/, "");
  const businessLine = [
    `${site.name}은 ${business.name}의 브랜드예요`,
    `대표 ${business.representative}`,
    `사업자등록번호 ${business.registrationNumber}`,
    business.address && `주소 ${business.address}`,
  ].filter(Boolean);

  return (
    <footer className="bg-ink text-paper">
      <div className="wrap pb-12 pt-14 md:pt-[72px]">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <Lockup inverse height={48} className="h-10 w-auto md:h-12" />
          <div className={cx("grid w-full grid-cols-2 gap-x-8 gap-y-10 text-base sm:w-auto md:gap-16", hasSocial && "sm:grid-cols-3")}>
            <FooterCol title="Company" links={companyLinks} />
            <FooterCol title="Services" links={divisions.map((d) => ({ label: d.role, href: divisionHref(d.slug) }))} />
            {hasSocial && <FooterCol title="Follow" links={site.social.map((s) => ({ label: s.label, href: s.href }))} />}
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
            <nav aria-label="약관 및 정책" className="-my-2.5">
              <ul className="ko-tight -mx-2 flex flex-wrap items-center md:justify-end">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={cx(legalLinkClass, l.strong && "font-bold text-paper")}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <OpenCookieSettingsButton className={cx(legalLinkClass, "cursor-pointer")} />
                </li>
                {requestLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={legalLinkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
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
