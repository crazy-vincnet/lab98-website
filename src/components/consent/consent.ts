"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Cookie / storage consent, kept only in this browser (localStorage).
 * The site itself sets no cookies and loads no tracking scripts; the only thing stored is
 * the visitor's own choice, so a future analytics tool can be gated behind it (see ConsentGate).
 */

export const CONSENT_STORAGE_KEY = "lab98-consent";
export const CONSENT_VERSION = 1;
/** Dispatched on `window` (by the footer and the cookie-policy page) to reopen the settings panel. */
export const OPEN_COOKIE_SETTINGS_EVENT = "lab98:open-cookie-settings";
/** Dispatched on `window` after the stored choice changes. */
export const CONSENT_CHANGED_EVENT = "lab98:consent-changed";

export type Consent = { v: typeof CONSENT_VERSION; analytics: boolean; decidedAt: string };
/** "unknown" = not readable yet (server render / before hydration); null = no decision stored. */
export type ConsentState = Consent | null | "unknown";

function parse(raw: string | null): Consent | null {
  if (!raw) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (v && typeof v === "object" && (v as Consent).v === CONSENT_VERSION && typeof (v as Consent).analytics === "boolean" && typeof (v as Consent).decidedAt === "string") {
      return v as Consent;
    }
  } catch {}
  // Unknown shape or older version → ask again.
  return null;
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode, disabled cookies)
  }
}

/** Browser only. Returns null when nothing (valid) is stored or storage is unavailable. */
export function readConsent(): Consent | null {
  return parse(readRaw());
}

// In-memory fallback so a choice still holds for this page view when storage is blocked.
let memoryRaw: string | null = null;

/** Browser only. Call from event handlers, never during render. */
export function writeConsent(analytics: boolean): Consent {
  const value: Consent = { v: CONSENT_VERSION, analytics, decidedAt: new Date().toISOString() };
  const raw = JSON.stringify(value);
  memoryRaw = raw;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, raw);
  } catch {}
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value }));
  return value;
}

/** Subscribe to consent changes in this tab and in other tabs. */
export function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const UNKNOWN = "\u0000unknown";
// Snapshots are raw strings so they compare stably with Object.is.
const getSnapshot = () => readRaw() ?? memoryRaw;
const getServerSnapshot = () => UNKNOWN;

/** Current consent. Always "unknown" on the server and during hydration, so markup matches. */
export function useConsent(): ConsentState {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => (raw === UNKNOWN ? "unknown" : parse(raw)), [raw]);
}
