import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";
import { PROJECTS_PATH } from "@/components/experiments/paths";
import { getChromeCopy } from "@/components/chrome/copy.en";
import { getCopy } from "@/lib/copy-store";
import { localePath, type Locale } from "@/lib/i18n";

export async function NotFoundView({ locale }: { locale: Locale }) {
  // Admin-editable (registry key "chrome.notFound").
  const t = await getCopy("chrome.notFound", locale, getChromeCopy(locale).notFound);
  return (
    <section className="wrap py-20 md:py-32">
      <p className="label text-gray">{t.label}</p>
      <div className="mt-8 max-w-[560px] border-2 border-ink bg-ink p-5 font-mono text-code text-ink-text">
        <p>
          $ <span className="text-paper">lab98 open ./page</span>
        </p>
        <p className="text-red-text-dark">✕ page not found</p>
      </div>
      <h1 className="mt-10 text-h1 text-balance">{t.title}</h1>
      <p className="mt-5 max-w-[560px] text-lead text-gray text-pretty">{t.lead}</p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <ButtonLink href={localePath(locale, "/")}>{t.home}</ButtonLink>
        <ButtonLink href={localePath(locale, PROJECTS_PATH)} variant="secondary">
          {t.projects}
        </ButtonLink>
      </div>
    </section>
  );
}

/** <title>/description of the 404 pages: reads the admin-editable "chrome.notFound" copy (async, so it is not frozen at build time). */
export async function notFoundMeta(locale: Locale) {
  const t = await getCopy("chrome.notFound", locale, getChromeCopy(locale).notFound);
  return { title: t.metaTitle, description: t.metaDescription };
}

export async function notFoundMetadata(locale: Locale): Promise<Metadata> {
  return { ...(await notFoundMeta(locale)), robots: { index: false, follow: true } };
}
