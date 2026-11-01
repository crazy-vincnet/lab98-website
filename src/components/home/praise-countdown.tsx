"use client";

import { useSyncExternalStore } from "react";
import { cx } from "@/components/ui";
import { PRAISE_TOOL_LAUNCH } from "@/lib/content";

/** Merged strings from the server parent (admin-editable, registry key "home.praise"). */
export type PraiseCountdownCopy = { fallback: string; today: string; after: string };

const DAY_MS = 86_400_000;
const kstDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });

/** Whole days from today (Asia/Seoul) to the launch date. Client only. */
function daysToLaunch() {
  const [y, m, d] = kstDate.format(new Date()).split("-").map(Number);
  const [ly, lm, ld] = PRAISE_TOOL_LAUNCH.split("-").map(Number);
  return Math.round((Date.UTC(ly, lm - 1, ld) - Date.UTC(y, m - 1, d)) / DAY_MS);
}

function badgeText(praiseCopy: PraiseCountdownCopy) {
  const n = daysToLaunch();
  if (n > 0) return `D-${n}`;
  if (n === 0) return praiseCopy.today;
  return praiseCopy.after;
}

// Re-check every minute so the badge flips at KST midnight on an open tab.
function subscribe(onChange: () => void) {
  const t = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(t);
}

/**
 * D-day badge for the Praise Tool launch. The server snapshot is a neutral label
 * (no date math during prerender — cacheComponents forbids `new Date()` there);
 * the real value fills in after hydration.
 */
export function PraiseCountdown({ className, copy: praiseCopy }: { className?: string; copy: PraiseCountdownCopy }) {
  const text = useSyncExternalStore(subscribe, () => badgeText(praiseCopy), () => null);
  return (
    <span className={cx("inline-flex min-h-9 items-center border-2 border-faith px-3 font-mono text-body-sm font-bold text-faith-text-dark", className)}>
      {text ?? praiseCopy.fallback}
    </span>
  );
}
