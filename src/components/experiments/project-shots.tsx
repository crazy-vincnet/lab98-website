import Image from "next/image";
import type { Project } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { fill } from "@/lib/fill-template";
import { loadProjectsPageCopy } from "./load";

/**
 * Desktop screenshot in an ink browser frame next to the mobile screenshot in a phone frame.
 * Stacks on small screens; side by side from md. Screenshots: 1440×900 and 390×844.
 */
/*
 * Desktop shot width: content box ≤1280px; beside a 280px (lg) / 220px (md) phone column + gap
 * → ≤944px at ≥1440, ≈56–63vw between md and lg. `preload` (Next 16 replacement for `priority`):
 * it's the page's largest image and the LCP candidate on desktop.
 */
export async function ProjectShots({ project: p, locale = "ko" }: { project: Project; locale?: Locale }) {
  const alt = (await loadProjectsPageCopy(locale)).detail.alt;
  const host = new URL(p.url).host;
  return (
    <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,220px)] md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:gap-14">
      <figure className="min-w-0 border-2 border-ink bg-ink">
        <div className="flex items-center gap-3 px-3 py-2.5 md:px-4">
          <span aria-hidden className="flex shrink-0 gap-1.5">
            <i className="size-2.5 rounded-full bg-ink-line" />
            <i className="size-2.5 rounded-full bg-ink-line" />
            <i className="size-2.5 rounded-full bg-ink-line" />
          </span>
          <span className="min-w-0 flex-1 truncate bg-ink-2 px-3 py-1 font-mono text-micro text-ink-text">{host}</span>
        </div>
        <div className="relative aspect-16/10 bg-concrete">
          <Image src={p.images.desktop} alt={fill(alt.desktop, { client: p.client })} fill preload sizes="(min-width: 1440px) 944px, (min-width: 768px) 65vw, 100vw" className="object-cover object-top" />
        </div>
      </figure>
      <figure className="mx-auto w-full max-w-[260px] border-2 border-ink bg-ink p-2 md:max-w-none">
        <div aria-hidden className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-ink-line" />
        <div className="relative aspect-390/844 bg-concrete">
          <Image src={p.images.mobile} alt={fill(alt.mobile, { client: p.client })} fill sizes="(min-width: 1024px) 280px, (min-width: 768px) 220px, 260px" className="object-cover object-top" />
        </div>
      </figure>
    </div>
  );
}
