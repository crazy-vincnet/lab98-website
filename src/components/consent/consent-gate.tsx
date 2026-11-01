"use client";

import type { ReactNode } from "react";
import { useConsent } from "./consent";

/**
 * Renders children only after the visitor has opted in to the given category.
 * Nothing renders on the server, before hydration, without a decision, or after a refusal.
 *
 * Not used yet — the site currently loads no analytics. When one is added, wrap its loader:
 *
 *   <ConsentGate category="analytics">
 *     <Script src="https://…/analytics.js" strategy="afterInteractive" />
 *   </ConsentGate>
 *
 * Withdrawing consent unmounts the children; the tool's own cookies must also be cleared then.
 */
export function ConsentGate({ category, children }: { category: "analytics"; children: ReactNode }) {
  const consent = useConsent();
  if (consent === "unknown" || consent === null || consent[category] !== true) return null;
  return <>{children}</>;
}
