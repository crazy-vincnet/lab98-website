import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-[15px] font-bold leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-2",
  secondary: "border border-ink bg-paper text-ink hover:bg-concrete",
  danger: "bg-[#b42318] text-paper hover:bg-[#8f1c13]",
  ghost: "text-ink underline-offset-4 hover:underline",
};

export const buttonClass = (variant: ButtonVariant = "primary", className?: string) => cx(base, variants[variant], className);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

/** Plain button. Use <SubmitButton> inside forms to get a pending state. */
export function Button({ variant = "primary", className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

/** A link that looks like a button. */
export function LinkButton({ variant = "secondary", className, ...rest }: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...rest} />;
}
