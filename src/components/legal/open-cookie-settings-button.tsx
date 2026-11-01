"use client";

import type { ReactNode } from "react";

/** Event the cookie banner listens to; it reopens the consent settings panel. */
export const OPEN_COOKIE_SETTINGS_EVENT = "lab98:open-cookie-settings";

/** Reopens the cookie-consent settings (banner owned elsewhere listens for the event). */
export function OpenCookieSettingsButton({ className, children = "쿠키 설정" }: { className?: string; children?: ReactNode }) {
  return (
    <button
      type="button"
      data-open-cookie-settings
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
    >
      {children}
    </button>
  );
}
