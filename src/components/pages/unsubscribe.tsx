import type { Metadata } from "next";
import { pageMetadata } from "@/components/seo/metadata";
import Link from "next/link";
import { Suspense } from "react";
import { UnsubscribeForm, UnsubscribeFormFallback } from "@/components/unsubscribe/unsubscribe-form";
import { loadUnsubscribeCopy } from "@/components/unsubscribe/load";
import { PRIVACY_PATH, PRIVACY_REQUEST_PATH, UNSUBSCRIBE_PATH } from "@/components/experiments/paths";
import { getContent } from "@/lib/get-content";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { normalizeEmail, UNSUBSCRIBE_LIMITS } from "@/lib/unsubscribe";
import type { UnsubscribeFormCopy } from "@/components/unsubscribe/copy.en";
import { localePath, type Locale } from "@/lib/i18n";

/**
 * 이메일 수신거부. Adds the address to public.email_optouts (and optionally deletes launch_signups).
 * The page shell is static; `?email=…&t=…` is read on the server inside <Suspense> (UnsubscribeFormGate) and the
 * signed token is verified there, so the secret never reaches the browser.
 * Bulk / launch mail must skip opted-out addresses: see isOptedOut in src/lib/unsubscribe-server.ts.
 */
export const unsubscribeMetadata = async (locale: Locale): Promise<Metadata> => {
  const C = await loadUnsubscribeCopy(locale);
  return pageMetadata({ title: C.meta.title, description: C.meta.description, path: UNSUBSCRIBE_PATH, noindex: true, locale });
};

const link = "font-bold text-ink underline underline-offset-4 hover:text-red-text";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Verifies the link's token against its address, then renders the client form in "verified" or "confirm by mail" mode. */
async function UnsubscribeFormGate({ locale, searchParams, copy, to }: { locale: Locale; searchParams?: SearchParams; copy: UnsubscribeFormCopy; to: string }) {
  const q = searchParams ? await searchParams : {};
  const email = first(q.email).trim().slice(0, UNSUBSCRIBE_LIMITS.email);
  const t = first(q.t);
  const verified = !!email && !!t && verifyUnsubscribeToken(normalizeEmail(email), t);
  return (
    <UnsubscribeForm
      to={to}
      locale={locale}
      copy={copy}
      initialEmail={email}
      token={verified ? t : ""}
      verified={verified}
      invalidLink={!!t && !verified}
      requestHref={localePath(locale, PRIVACY_REQUEST_PATH)}
    />
  );
}

export async function UnsubscribePage({ locale, searchParams }: { locale: Locale; searchParams?: SearchParams }) {
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
          <UnsubscribeFormGate locale={locale} searchParams={searchParams} copy={C.form} to={site.email} />
        </Suspense>
      </div>
    </section>
  );
}
