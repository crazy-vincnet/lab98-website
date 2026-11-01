import { SectionHead, cx } from "@/components/ui";
import type { Faq } from "@/lib/content";

/**
 * FAQ section: native <details>/<summary> disclosure (keyboard + screen reader support for free, no JS).
 * The same `items` must feed the page's FAQPage JSON-LD so markup and visible text never drift.
 */
export function FaqSection({
  items,
  index,
  id = "faq",
  eyebrow = "FAQ",
  title = "자주 묻는 질문",
  lead,
  className,
}: {
  items: readonly Faq[];
  index?: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cx("border-t-2 border-ink", className)}>
      <div className="wrap py-16 md:py-24 xl:py-28">
        <SectionHead index={index} eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} lead={lead} />
        <div className="border-t-2 border-ink">
          {items.map((f, i) => (
            <details key={f.q} className="group border-b-2 border-ink">
              <summary className="flex min-h-11 cursor-pointer list-none items-start gap-4 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:gap-8 md:py-7 [&::-webkit-details-marker]:hidden">
                <span className="w-8 shrink-0 pt-1 font-mono text-meta font-bold text-gray md:w-12" aria-hidden>
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 text-title text-balance underline-offset-4 group-hover:underline group-hover:decoration-2">{f.q}</span>
                <span
                  className="grid size-8 shrink-0 place-items-center border-2 border-ink font-mono text-body font-bold leading-none transition-transform duration-150 ease-[var(--ease-lab)] group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="flex gap-4 pb-7 md:gap-8">
                <span className="w-8 shrink-0 md:w-12" aria-hidden />
                <p className="max-w-[760px] flex-1 text-body text-gray text-pretty">{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
