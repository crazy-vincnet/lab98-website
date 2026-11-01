import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink, cx } from "@/components/ui";
import { divisionTheme, type Division } from "@/lib/content";
import { CONTACT_HREF } from "./paths";

/** Small round division marker (point color used only as a dot). */
export function DivisionDot({ division, className }: { division: Division; className?: string }) {
  return <i aria-hidden className={cx("inline-block size-2.5 shrink-0 rounded-full", divisionTheme[division].bg, className)} />;
}

/**
 * Meta line whose items never break internally; the `·` separator stays
 * attached to the preceding item so no line ends or starts with a lone dot.
 */
export function MetaLine({ items, className }: { items: ReactNode[]; className?: string }) {
  const shown = items.filter((x) => x !== null && x !== undefined && x !== false);
  return (
    <span className={cx("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {shown.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
          {item}
          {i < shown.length - 1 && <span aria-hidden>·</span>}
        </span>
      ))}
    </span>
  );
}

/** Concrete contact band closing the projects / insights pages. Optional `children` render below the CTA row. */
export function CtaBand({
  eyebrow,
  title,
  lead,
  action,
  href = CONTACT_HREF,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action: string;
  href?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-t-2 border-ink bg-concrete">
      <div className="wrap py-14 md:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="label text-gray">{eyebrow}</p>
            <h2 className="mt-4 text-h2 text-balance">{title}</h2>
            {lead && <p className="mt-4 max-w-[560px] text-body text-pretty text-gray">{lead}</p>}
          </div>
          <ButtonLink href={href} className="shrink-0 self-start lg:self-auto">
            {action} <span aria-hidden>→</span>
          </ButtonLink>
        </div>
        {children}
      </div>
    </section>
  );
}

/**
 * Prev / next pager. A single item spans the full width (no empty cell).
 * `meta` is a small line above the title (date, label…).
 */
export function Pager({
  label,
  prev,
  next,
}: {
  label: string;
  prev?: { href: string; dirLabel: string; meta?: ReactNode; title: string };
  next?: { href: string; dirLabel: string; meta?: ReactNode; title: string };
}) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={label} className={cx("grid gap-[2px] border-2 border-ink bg-ink", prev && next && "sm:grid-cols-2")}>
      {prev && <PagerLink {...prev} />}
      {next && <PagerLink {...next} alignEnd={!!prev} />}
    </nav>
  );
}

function PagerLink({ href, dirLabel, meta, title, alignEnd = false }: { href: string; dirLabel: string; meta?: ReactNode; title: string; alignEnd?: boolean }) {
  return (
    <Link
      href={href}
      className={cx("group flex min-w-0 flex-col gap-2 bg-paper p-6 transition-colors duration-150 hover:bg-ink hover:text-paper md:p-8", alignEnd && "sm:items-end sm:text-right")}
    >
      <span className="label ko-tight text-gray group-hover:text-ink-text">{dirLabel}</span>
      {meta && <span className="font-mono text-meta text-gray group-hover:text-ink-text">{meta}</span>}
      <span className="text-title text-balance">{title}</span>
    </Link>
  );
}
