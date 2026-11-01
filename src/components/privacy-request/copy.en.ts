/**
 * English copy for privacy-request. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getPrivacyRequestCopy(locale)` in components; never import privacyRequestCopyEn directly.
 * 
 */
import type { Dict, Locale } from "@/lib/i18n";
import { PRIVACY_REQUEST_DAYS } from "@/lib/privacy-request";
import { privacyRequestCopy } from "./copy";

export const privacyRequestCopyEn: Dict<typeof privacyRequestCopy> = {
  meta: {
    title: "Request access, correction or deletion of personal data",
    description: "Ask Lab98 to show, correct or delete the personal data you gave us, to stop processing it, or to withdraw your consent. We handle requests within 10 days of verifying your identity.",
  },
  label: "Privacy request",
  title: "Request access, correction or deletion of personal data",
  lead: "Under Korea's Personal Information Protection Act, you can check the personal data you gave Lab98 at any time. You can also have it corrected or deleted, stop its processing, or withdraw your consent.",
  rights: [
    { term: "Access", desc: "See what data we hold about you." },
    { term: "Correction or deletion", desc: "Fix wrong data, or have it deleted." },
    { term: "Stop processing", desc: "Stop us from using your data, for example to send you emails." },
    { term: "Withdraw consent", desc: "Withdraw a consent you gave, such as for a launch alert." },
  ],
  howTitle: "How it works",
  how: [
    "Send your request with the form below.",
    "We'll email a confirmation message to the address you give. We act on your request once you reply to it.",
    `After we receive your reply, we process the request within ${PRIVACY_REQUEST_DAYS} days and tell you the result.`,
  ],
  safety: "We don't change or delete anything until your identity is confirmed. If someone files a request with your address, nothing happens unless you reply.",
  altBefore: "Instead of the form, you can also email",
  altAfter: "directly.",
  form: {
    ariaLabel: "Personal data request form",
    emailLabel: "Email",
    emailHint: "Enter the address you used when you contacted us or signed up for a launch alert. We'll send the confirmation email there.",
    emailPlaceholder: "you@example.com",
    typeLegend: "Request type",
    types: [
      { value: "access", label: "Access" },
      { value: "correct", label: "Correction" },
      { value: "delete", label: "Deletion" },
      { value: "suspend", label: "Stop processing" },
      { value: "withdraw", label: "Withdraw consent" },
    ],
    detailsLabel: "Details",
    detailsOptional: "(optional)",
    detailsRequired: "(required)",
    detailsPlaceholder: {
      access: "If there is something specific you want to know, tell us.",
      correct: "Tell us what to correct and how. Example: change my name or company name to ○○.",
      delete: "If you want only certain data deleted, say which. If you leave this empty, we delete everything for this address.",
      suspend: "If you want only certain processing stopped, say which. Example: sending emails",
      withdraw: "If you want to withdraw a specific consent, say which. Example: Praise Tool launch alert",
    },
    consentLabel: "To handle your request and verify your identity, we collect your email and the content of your request. We keep the record of the result for 3 years. (required)",
    ipNote: "To prevent repeated submissions, we also store your IP address after turning it into a value (a hash) that cannot be reversed.",
    submit: "Send request",
    submitting: "Sending…",
    errors: {
      emailRequired: "Enter your email address.",
      emailInvalid: "Check the email format. Example: you@example.com",
      typeRequired: "Choose a request type.",
      detailsRequired: "For a correction, tell us what to correct.",
      detailsTooLong: "Keep the details within 2,000 characters.",
      consentRequired: "To process your request, you need to agree to the collection and use of your data.",
    },
    failure: {
      rateLimited: "Too many requests came in at once, so we paused them for now. Try again in 10 minutes, or email us at",
      server: "We couldn't send your request. Try again in a moment, or email us at",
      fallbackAfter: ".",
    },
    success: {
      eyebrow: "Request received",
      title: `We got your request. We sent a confirmation email to the address you entered. Reply to it and we'll process the request within ${PRIVACY_REQUEST_DAYS} days.`,
      fallbackBefore: "If the confirmation email doesn't arrive, check your spam folder or write to",
      fallbackAfter: ".",
      reset: "Send another request",
    },
  },
};

export function getPrivacyRequestCopy(locale: Locale = "ko"): Dict<typeof privacyRequestCopy> {
  return locale === "en" ? privacyRequestCopyEn : privacyRequestCopy;
}
