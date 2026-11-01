"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button, cx } from "@/components/ui";
import { COOKIES_PATH } from "@/components/experiments/paths";
import type { ChromeCookieBannerCopy } from "@/components/chrome/copy.en";
import { localePath, type Locale } from "@/lib/i18n";
import { OPEN_COOKIE_SETTINGS_EVENT, useConsent, writeConsent } from "./consent";

/** One on/off switch. `locked` = always on, announced as unavailable but still focusable. */
function Switch({ id, checked, locked = false, onChange, labelledBy, describedBy }: { id: string; checked: boolean; locked?: boolean; onChange?: (v: boolean) => void; labelledBy: string; describedBy: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={locked || undefined}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => !locked && onChange?.(!checked)}
      className={cx("flex size-11 shrink-0 items-center justify-center", locked ? "cursor-not-allowed" : "cursor-pointer")}
    >
      <span className={cx("relative block h-6 w-11 border-2 border-ink transition-colors duration-150", checked ? "bg-ink" : "bg-paper", locked && "opacity-60")} aria-hidden>
        <span className={cx("absolute top-0.5 block size-4 transition-[left] duration-150", checked ? "left-[22px] bg-paper" : "left-0.5 bg-ink")} />
      </span>
    </button>
  );
}

/**
 * Non-blocking cookie notice fixed to the bottom of the viewport (below the header's mobile menu, z-50).
 * Shown after mount when no choice is stored; reopened with the `lab98:open-cookie-settings` window event.
 * Honest by design: the site sets no cookies — the only stored item is this choice.
 */
export function CookieBannerClient({ locale = "ko", copy }: { locale?: Locale; copy: ChromeCookieBannerCopy }) {
  const t = copy;
  const uid = useId();
  const consent = useConsent();
  // Opened from the footer / cookie page: panel expanded, focus moved in, Esc closes, focus returns.
  const [reopened, setReopened] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [announce, setAnnounce] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const consentRef = useRef(consent);
  useEffect(() => {
    consentRef.current = consent;
  }, [consent]);

  useEffect(() => {
    const onOpen = () => {
      const c = consentRef.current;
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setAnalytics(c !== "unknown" && c !== null && c.analytics);
      setAnnounce("");
      setReopened(true);
      setPanelOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
  }, []);

  // Move focus into the panel only when it was opened on request (never on first page load).
  useEffect(() => {
    if (reopened && panelOpen) panelHeadingRef.current?.focus();
  }, [reopened, panelOpen]);

  const undecided = consent === null;
  const visible = consent !== "unknown" && (undecided || reopened);

  function restoreFocus() {
    const el = returnFocus.current;
    returnFocus.current = null;
    if (el?.isConnected) el.focus();
  }

  function decide(value: boolean) {
    writeConsent(value);
    setAnnounce(value ? t.saved.analytics : t.saved.essential);
    setPanelOpen(false);
    if (reopened) {
      setReopened(false);
      restoreFocus();
    }
  }

  function closePanel() {
    setPanelOpen(false);
    if (reopened) {
      setReopened(false);
      // With a stored choice the whole notice hides again; without one the bar stays.
      restoreFocus();
    }
  }

  function onKeyDown(e: ReactKeyboardEvent) {
    if (e.key === "Escape" && reopened && panelOpen) {
      e.stopPropagation();
      closePanel();
    }
  }

  function toggleSettings() {
    if (!panelOpen) setAnalytics(consent !== "unknown" && consent !== null && consent.analytics);
    setPanelOpen((v) => !v);
  }

  const panelId = `${uid}-panel`;
  const btn = "w-full sm:w-auto";

  return (
    <>
      {/* Persistent live region: the bar disappears after a choice, so the confirmation is announced here. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {visible && (
        <section
          data-cookie-banner
          role="region"
          aria-label={t.region}
          onKeyDown={onKeyDown}
          className="fixed inset-x-0 bottom-0 z-40 max-h-[85svh] overflow-y-auto border-t-2 border-ink bg-paper text-ink"
        >
          <div className="wrap flex flex-col gap-4 py-5 md:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
              <div className="min-w-0 max-w-[720px]">
                <h2 className="text-title-sm">{t.title}</h2>
                <p className="mt-1 text-body-sm text-gray text-pretty">{t.body}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                  <Button type="button" variant="secondary" size="sm" className={btn} onClick={() => decide(false)}>
                    {t.essentialOnly}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" className={btn} onClick={() => decide(true)}>
                    {t.allowAnalytics}
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="secondary" size="sm" aria-expanded={panelOpen} aria-controls={panelId} onClick={toggleSettings}>
                    {t.settings}
                  </Button>
                  <Link href={localePath(locale, COOKIES_PATH)} className="inline-flex min-h-11 items-center text-body-sm font-bold underline underline-offset-4 hover:text-red-text">
                    {t.policy}
                  </Link>
                </div>
              </div>
            </div>

            <div id={panelId} hidden={!panelOpen} className="border-2 border-ink">
              <div className="flex items-center justify-between gap-4 border-b-2 border-ink px-4 py-2">
                <h3 ref={panelHeadingRef} tabIndex={-1} className="text-body-sm font-bold outline-none">
                  {t.panelTitle}
                </h3>
                {reopened && (
                  <button type="button" onClick={closePanel} className="inline-flex min-h-11 cursor-pointer items-center text-body-sm font-bold underline underline-offset-4 hover:text-red-text">
                    {t.close}
                  </button>
                )}
              </div>
              <ul>
                <li className="flex items-center justify-between gap-4 border-b-2 border-ink px-4 py-2">
                  <div className="min-w-0">
                    <p id={`${uid}-ess-name`} className="text-body-sm font-bold">
                      {t.essential.name} <span className="font-normal text-gray">· {t.essential.state}</span>
                    </p>
                    <p id={`${uid}-ess-desc`} className="text-body-sm text-gray text-pretty">
                      {t.essential.desc}
                    </p>
                  </div>
                  <Switch id={`${uid}-ess`} checked locked labelledBy={`${uid}-ess-name`} describedBy={`${uid}-ess-desc`} />
                </li>
                <li className="flex items-center justify-between gap-4 px-4 py-2">
                  <div className="min-w-0">
                    <p id={`${uid}-ana-name`} className="text-body-sm font-bold">
                      {t.analytics.name}
                    </p>
                    <p id={`${uid}-ana-desc`} className="text-body-sm text-gray text-pretty">
                      {t.analytics.desc}
                    </p>
                  </div>
                  <Switch id={`${uid}-ana`} checked={analytics} onChange={setAnalytics} labelledBy={`${uid}-ana-name`} describedBy={`${uid}-ana-desc`} />
                </li>
              </ul>
              <div className="border-t-2 border-ink px-4 py-3">
                <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => decide(analytics)}>
                  {t.save}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
