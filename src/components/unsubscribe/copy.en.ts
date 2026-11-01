/**
 * English copy for unsubscribe. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getUnsubscribeCopy(locale)` in components; never import unsubscribeCopyEn directly.
 * 
 */
import type { Dict, Locale } from "@/lib/i18n";
import { unsubscribeCopy } from "./copy";

export const unsubscribeCopyEn: Dict<typeof unsubscribeCopy> = {
  meta: {
    title: "Unsubscribe from email",
    description: "Stop getting launch alerts, news and other informational email from Lab98.",
  },
  label: "Unsubscribe",
  title: "Unsubscribe from email",
  lead: "Lab98 doesn't send promotional email. A launch alert goes out once, to people who signed up for it. If you still don't want any more informational email (launch alerts, news and so on), you can stop it here.",
  points: [
    "We won't send launch alerts, news or other non-essential email to an address that has unsubscribed.",
    "We still reply to inquiries and personal data requests you send us yourself, whether or not you've unsubscribed.",
  ],
  inline: { before: "To check or delete the information we hold about you, use", request: "Privacy requests", middle: ". For details, see our", policy: "Privacy Policy", after: "." },
  form: {
    ariaLabel: "Email unsubscribe form",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    cancelLaunchLabel: "Also cancel my launch alert signup",
    cancelLaunchHint: "We delete the signup record right away.",
    notice: "To process your unsubscribe request, we keep your email address on an unsubscribe list.",
    submit: "Unsubscribe",
    submitting: "Processing…",
    errors: {
      emailRequired: "Enter the email address to unsubscribe.",
      emailInvalid: "Check the email format. Example: you@example.com",
    },
    failure: {
      rateLimited: "Too many requests came in at once, so we paused them for now. Try again in 10 minutes, or ask us to unsubscribe you at",
      server: "We couldn't process that. Try again in a moment, or ask us to unsubscribe you at",
      fallbackAfter: ".",
    },
    success: {
      eyebrow: "Unsubscribed",
      title: "You're unsubscribed. We won't send you informational email anymore.",
      fallbackBefore: "If you want to hear from us again, write to",
      fallbackAfter: ".",
    },
  },
};

export function getUnsubscribeCopy(locale: Locale = "ko"): Dict<typeof unsubscribeCopy> {
  return locale === "en" ? unsubscribeCopyEn : unsubscribeCopy;
}

/** Merged (admin-editable) form copy handed to the client form as a prop. */
export type UnsubscribeFormCopy = Dict<typeof unsubscribeCopy>["form"];
