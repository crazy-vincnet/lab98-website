import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { divisionTheme, lockupSrc, symbolSrc, type Division } from "@/lib/content";

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
export { cx };

/* ---------- Logo ---------- */

/** Lab98 symbol (square). Min 24px per brand rules. */
/** Pass `alt=""` when an adjacent heading already names the division (decorative). */
export function Symbol({ division = "master", inverse = false, size = 40, alt, className }: { division?: Division; inverse?: boolean; size?: number; alt?: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={symbolSrc(division, inverse)} width={size} height={size} alt={alt ?? (division === "master" ? "Lab98" : `Lab98 ${divisionTheme[division].name}`)} className={cx("block shrink-0", className)} />;
}

/** Symbol + wordmark lockup. Native ratio 361:84. */
export function Lockup({ division = "master", inverse = false, height = 40, className }: { division?: Division; inverse?: boolean; height?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={lockupSrc(division, inverse)} height={height} width={Math.round((height * 361) / 84)} alt="Lab98" className={cx("block shrink-0", className)} />;
}

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "accent" | "inverse";
const buttonBase =
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap border-2 font-sans font-bold leading-none transition-[background-color,color,transform] duration-150 ease-[var(--ease-lab)] active:translate-y-px";
const buttonVariants: Record<ButtonVariant, string> = {
  primary: "border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
  secondary: "border-ink bg-paper text-ink hover:bg-ink hover:text-paper",
  /** Point-color button: max ONE per screen (brand rule). */
  accent: "border-red-text bg-red-text text-paper hover:border-ink hover:bg-ink focus-visible:outline-ink",
  /** For dark sections. */
  inverse: "border-paper bg-paper text-ink hover:bg-ink hover:text-paper",
};
const buttonSizes = { md: "px-7 py-[18px] text-base", sm: "px-5 py-3.5 text-[15px]" };

export function ButtonLink({ variant = "primary", size = "md", className, children, ...props }: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: keyof typeof buttonSizes }) {
  return (
    <Link {...props} className={cx(buttonBase, buttonVariants[variant], buttonSizes[size], className)}>
      {children}
    </Link>
  );
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant; size?: keyof typeof buttonSizes }) {
  return (
    <button {...props} className={cx(buttonBase, buttonVariants[variant], buttonSizes[size], "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50", className)}>
      {children}
    </button>
  );
}

/* ---------- Tag ---------- */

/**
 * Mono tag. `dot` shows a colored dot (division color).
 * `caps` (default) = uppercase Latin label with tracking; turn it off for Korean labels.
 */
export function Tag({ children, solid = false, dot, dark = false, caps = true, className }: { children: ReactNode; solid?: boolean; dot?: Division; dark?: boolean; caps?: boolean; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 border px-2.5 py-[5px] font-mono text-xs leading-none",
        caps ? "uppercase tracking-[0.04em]" : "tracking-normal",
        solid ? (dark ? "border-paper bg-paper text-ink" : "border-ink bg-ink text-paper") : dark ? "border-paper text-paper" : "border-ink bg-paper text-ink",
        className,
      )}
    >
      {dot && <i className={cx("size-2 rounded-full", divisionTheme[dot].bg)} aria-hidden />}
      {children}
    </span>
  );
}

/* ---------- Section ---------- */

/** Standard section header: mono eyebrow on the left, heading + lead on the right (stacks on mobile). */
export function SectionHead({ index, eyebrow, title, lead, dark = false, className }: { index?: string; eyebrow: string; title: ReactNode; lead?: ReactNode; dark?: boolean; className?: string }) {
  return (
    <div className={cx("mb-9 grid gap-3 md:mb-14 lg:mb-16 lg:grid-cols-[280px_1fr] lg:gap-12", className)}>
      <p className={cx("label pt-2", dark ? "text-ink-text" : "text-gray")}>
        {index && <>{index} — </>}
        {eyebrow}
      </p>
      <div>
        <h2 className="text-h2 text-balance">{title}</h2>
        {lead && <p className={cx("mt-4 max-w-[640px] text-body text-pretty", dark ? "text-ink-text" : "text-gray")}>{lead}</p>}
      </div>
    </div>
  );
}
