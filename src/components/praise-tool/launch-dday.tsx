"use client";

import { useSyncExternalStore } from "react";
import { PRAISE_TOOL_LAUNCH } from "@/lib/content";
import type { getPraiseTool } from "@/lib/praise-tool.en";
import type { Locale } from "@/lib/i18n";

/** Merged (admin-editable, key "praise-tool.page") D-day copy; the server page passes it as a prop. */
export type DdayCopy = ReturnType<typeof getPraiseTool>["dday"];
const DAY_MS = 86_400_000;

/** Today's date in Seoul as YYYY-MM-DD (en-CA formats ISO-style). */
const seoulToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const utcDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/** "D-10" before launch, "오늘 출시" on the day, "출시됨" after. Strings keep the snapshot stable. */
function getSnapshot(t: DdayCopy) {
  const days = Math.round((utcDay(PRAISE_TOOL_LAUNCH) - utcDay(seoulToday())) / DAY_MS);
  return days > 0 ? `D-${days}` : days === 0 ? t.today : t.released;
}

// Re-check every minute so an open tab rolls over at midnight KST.
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}

/**
 * Launch countdown badge. Computed in the browser only (the page is prerendered, so the server
 * must not read the clock); the server and first paint show a stable fallback.
 */
export function LaunchDday({ className, copy }: { className?: string; locale?: Locale; copy: DdayCopy }) {
  const t = copy;
  const value = useSyncExternalStore(subscribe, () => getSnapshot(t), () => null);
  return (
    <span className={className}>
      {value?.startsWith("D-") && <span className="sr-only">{t.label} </span>}
      {value ?? t.fallback}
    </span>
  );
}
