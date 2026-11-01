import type { Metadata } from "next";
import { pageMetadata } from "@/components/seo/metadata";
import Link from "next/link";
import { PrivacyRequestForm } from "@/components/privacy-request/privacy-request-form";
import { getPrivacyRequestCopy } from "@/components/privacy-request/copy.en";
import { PRIVACY_PATH, PRIVACY_REQUEST_PATH, UNSUBSCRIBE_PATH } from "@/components/experiments/paths";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";

/**
 * 개인정보 열람·정정·삭제·처리정지·동의 철회 요청.
 * The form only records the request (public.privacy_requests) and emails the team + the requester.
 * Nothing is deleted or changed from here: the team acts after the requester replies to the
 * confirmation email (identity check by email), within 10 days.
 */
export const privacyRequestMetadata = (locale: Locale): Metadata => {
  const C = getPrivacyRequestCopy(locale);
  return pageMetadata({ title: C.meta.title, description: C.meta.description, path: PRIVACY_REQUEST_PATH, noindex: true, locale });
};

/** Inline sentence around the two links. */
const inline = {
  ko: { before: "안내 메일만 그만 받고 싶다면", unsubscribe: "수신거부", middle: "를 이용해 주세요. 보관 기간과 파기 기준은", policy: "개인정보처리방침", after: "에서 확인할 수 있어요." },
  en: { before: "If you only want to stop receiving our emails, use", unsubscribe: "Unsubscribe", middle: ". Retention periods and deletion rules are in our", policy: "Privacy Policy", after: "." },
} as const;

const link = "font-bold text-ink underline underline-offset-4 hover:text-red-text";

export function PrivacyRequestPage({ locale }: { locale: Locale }) {
  const C = getPrivacyRequestCopy(locale);
  const { site } = getContent(locale);
  const lp = (path: string) => localePath(locale, path);
  const i = inline[locale];
  return (
    <section className="wrap py-16 md:py-24">
      <p lang="en" className="label text-gray">
        {C.label}
      </p>
      <h1 className="mt-6 text-h1 text-balance">{C.title}</h1>
      <p className="mt-5 max-w-[680px] text-lead text-gray text-pretty">{C.lead}</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <dl className="border-2 border-ink text-body-sm">
            {C.rights.map((r, i) => (
              <div key={r.term} className={`grid gap-0.5 px-4 py-3 sm:grid-cols-[96px_1fr] sm:gap-4 ${i ? "border-t-2 border-ink" : ""}`}>
                <dt className="font-bold">{r.term}</dt>
                <dd className="text-gray text-pretty">{r.desc}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h2 className="text-title">{C.howTitle}</h2>
            <ol className="mt-4 flex flex-col gap-3 text-body-sm">
              {C.how.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="w-6 shrink-0 font-mono text-meta font-bold text-red-text" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-pretty">{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-l-2 border-ink pl-4 text-body-sm text-gray text-pretty">{C.safety}</p>
          </div>

          <div className="flex flex-col gap-2 text-body-sm text-gray text-pretty">
            <p>
              {C.altBefore}{" "}
              <a href={`mailto:${site.email}`} className={`break-all ${link}`}>
                {site.email}
              </a>
              {C.altAfter}
            </p>
            <p>
              {i.before}{" "}
              <Link href={lp(UNSUBSCRIBE_PATH)} className={link}>
                {i.unsubscribe}
              </Link>
              {i.middle}{" "}
              <Link href={lp(PRIVACY_PATH)} className={link}>
                {i.policy}
              </Link>
              {i.after}
            </p>
          </div>
        </div>

        <PrivacyRequestForm to={site.email} locale={locale} />
      </div>
    </section>
  );
}
