import { ButtonLink } from "@/components/ui";
import { PROJECTS_PATH } from "@/components/experiments/paths";
import { getChromeCopy } from "@/components/chrome/copy.en";
import { localePath, type Locale } from "@/lib/i18n";

export function NotFoundView({ locale }: { locale: Locale }) {
  const t = getChromeCopy(locale).notFound;
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
