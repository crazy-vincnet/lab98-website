import type { ReactNode } from "react";
import { cx } from "./cx";

export type BadgeTone = "neutral" | "ok" | "warn" | "danger" | "info";
const tones: Record<BadgeTone, string> = {
  neutral: "bg-concrete text-ink",
  ok: "bg-[#dcf5ea] text-[#0a5c42]",
  warn: "bg-[#fdf1cf] text-[#7a5500]",
  danger: "bg-[#fde4e2] text-[#8f1c13]",
  info: "bg-[#e3e9ff] text-[#1f3bb8]",
};

/** Small status label. Always put the meaning in the text, never in color alone. */
export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={cx("inline-block px-2 py-0.5 text-[13px] font-bold leading-snug", tones[tone])}>{children}</span>;
}
