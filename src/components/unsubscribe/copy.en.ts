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
    submitConfirm: "Send confirmation email",
    submitting: "Processing…",
    verified: {
      badge: "Address verified by the link in our email",
      hint: "This only unsubscribes this address. For another address, type it in yourself and we'll send it a confirmation email.",
    },
    confirmNotice: "So nobody can unsubscribe someone else, we send a confirmation email to the address you enter. Press the link in it to finish.",
    invalidLink: "That link isn't valid or the address doesn't match. Enter the address below and we'll send you a confirmation email.",
    errors: {
      emailRequired: "Enter the email address to unsubscribe.",
      emailInvalid: "Check the email format. Example: you@example.com",
    },
    failure: {
      rateLimited: "Too many requests came in at once, so we paused them for now. Try again in 10 minutes, or ask us to unsubscribe you at",
      server: "We couldn't process that. Try again in a moment, or ask us to unsubscribe you at",
      mail: "We can't send confirmation emails right now. Try again in a little while, or ask us to unsubscribe you at",
      fallbackAfter: ".",
    },
    sent: {
      eyebrow: "Confirmation sent",
      title: "We've sent a confirmation email. Press the link in it to finish unsubscribing.",
      body: "We only send it to addresses that signed up or that we've emailed before. If it doesn't arrive in a few minutes, check your spam folder.",
      fallbackBefore: "If it doesn't arrive, or the address is a different one, write to",
      fallbackMiddle: ". You can also use the",
      request: "Privacy requests",
      fallbackAfter: "form.",
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
