import type { Metadata } from "next";
import { pageMetadata } from "@/components/seo/metadata";
import Link from "next/link";
import { Suspense } from "react";
import { UnsubscribeForm, UnsubscribeFormFallback } from "@/components/unsubscribe/unsubscribe-form";
import { loadUnsubscribeCopy } from "@/components/unsubscribe/load";
import { PRIVACY_PATH, PRIVACY_REQUEST_PATH, UNSUBSCRIBE_PATH } from "@/components/experiments/paths";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";

/**
 * 이메일 수신거부. Adds the address to public.email_optouts (and optionally deletes launch_signups).
 * The page shell is static; `?email=` is read on the client inside <Suspense>.
 * Bulk / launch mail must skip opted-out addresses: see isOptedOut in src/lib/unsubscribe-server.ts.
 */
export const unsubscribeMetadata = async (locale: Locale): Promise<Metadata> => {
  const C = await loadUnsubscribeCopy(locale);
  return pageMetadata({ title: C.meta.title, description: C.meta.description, path: UNSUBSCRIBE_PATH, noindex: true, locale });
};

const link = "font-bold text-ink underline underline-offset-4 hover:text-red-text";

export async function UnsubscribePage({ locale }: { locale: Locale }) {
  const C = await loadUnsubscribeCopy(locale);
  const { site } = getContent(locale);
  const lp = (path: string) => localePath(locale, path);
  const i = C.inline;
  return (
    <section className="wrap py-16 md:py-24">
      <p lang="en" className="label text-gray">
        {C.label}
      </p>
      <h1 className="mt-6 text-h1 text-balance">{C.title}</h1>
      <p className="mt-5 max-w-[680px] text-lead text-gray text-pretty">{C.lead}</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-6 text-body-sm">
          <ul className="flex flex-col gap-3">
            {C.points.map((p) => (
              <li key={p} className="relative pl-5 text-pretty before:absolute before:left-0 before:content-['–']">
                {p}
              </li>
            ))}
          </ul>
          <p className="text-gray text-pretty">
            {i.before}{" "}
            <Link href={lp(PRIVACY_REQUEST_PATH)} className={link}>
              {i.request}
            </Link>
            {i.middle}{" "}
            <Link href={lp(PRIVACY_PATH)} className={link}>
              {i.policy}
            </Link>
            {i.after}
          </p>
        </div>

        <Suspense fallback={<UnsubscribeFormFallback />}>
          <UnsubscribeForm to={site.email} locale={locale} copy={C.form} />
        </Suspense>
      </div>
    </section>
  );
}
