import { ButtonLink } from "@/components/ui";
import { getSiteContent } from "@/lib/site-content";
import { getCopy } from "@/lib/copy-store";
import { localePath, type Locale } from "@/lib/i18n";
import { routes } from "./copy";
import { getHomeCopy } from "./copy.en";
import { HeroBlock } from "./hero-block";
import { HeroMotion } from "./hero-motion";

/** Stagger helper for the entrance animation. */
const rise = (i: number) => ({ animationDelay: `${80 + i * 90}ms` });

export async function Hero({ locale = "ko" }: { locale?: Locale }) {
  const { site, divisions } = await getSiteContent(locale); // admin-editable site data
  // Admin-editable (registry key "home.hero"): published overrides merged over the code defaults.
  const heroCopy = await getCopy("home.hero", locale, getHomeCopy(locale).heroCopy);
  const lp = (path: string) => localePath(locale, path);
  const [line1, line2] = site.sloganLines;
  // The closing period becomes the brand red dot (the period stays for screen readers).
  const line2Text = line2.replace(/\.$/, "");

  return (
    <HeroMotion copy={heroCopy} className="group/motion overflow-hidden">
      <div className="wrap grid items-end gap-10 pb-14 pt-10 md:gap-14 md:pb-20 md:pt-16 lg:grid-cols-[1.5fr_1fr] lg:gap-12 lg:pb-24 lg:pt-20 xl:gap-16 xl:pb-28 xl:pt-24">
        <div className="min-w-0">
          <p className="label mb-6 animate-rise text-gray motion-reduce:animate-none md:mb-8" style={rise(0)}>
            {heroCopy.label}
          </p>
          <h1 className="animate-rise text-h1 font-bold text-balance motion-reduce:animate-none" style={rise(1)}>
            <span className="block">{line1}</span>
            <span className="block">
              {line2Text}
              <span className="ml-[0.08em] inline-block size-[0.22em] rounded-full bg-red" aria-hidden />
              <span className="sr-only">.</span>
            </span>
          </h1>
          <p lang="en" className="mt-4 animate-rise font-logo text-title font-medium text-gray motion-reduce:animate-none md:mt-6" style={rise(2)}>
            {site.sloganEn}
          </p>
          <p className="mt-6 max-w-[600px] animate-rise text-lead text-pretty motion-reduce:animate-none md:mt-8" style={rise(2)}>
            {heroCopy.lead}
          </p>
          <div className="mt-8 flex animate-rise flex-col gap-3 motion-reduce:animate-none sm:flex-row sm:gap-4 md:mt-12" style={rise(3)}>
            {/* The one point-color button on this screen. */}
            <ButtonLink href={lp(routes.contact)} variant="accent">
              {heroCopy.ctaPrimary} <span aria-hidden>→</span>
            </ButtonLink>
            <ButtonLink href={lp(routes.projects)} variant="secondary">
              {heroCopy.ctaSecondary}
            </ButtonLink>
          </div>
        </div>
        <div className="animate-rise motion-reduce:animate-none" style={rise(2)}>
          <HeroBlock locale={locale} copy={heroCopy} divisions={divisions.map(({ slug, short, name }) => ({ slug, short, name }))} />
        </div>
      </div>
    </HeroMotion>
  );
}
