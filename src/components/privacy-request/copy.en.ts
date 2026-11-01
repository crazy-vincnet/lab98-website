/**
 * English copy for privacy-request. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getPrivacyRequestCopy(locale)` in components; never import privacyRequestCopyEn directly.
 * Owner: translation agent "privacy-request". Every `// TODO(en)` line is still the Korean fallback:
 * replace `privacyRequestCopy.<key>` with the translated object (keep keys, function signatures and placeholders).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { privacyRequestCopy } from "./copy";

export const privacyRequestCopyEn: Dict<typeof privacyRequestCopy> = {
  meta: privacyRequestCopy.meta, // TODO(en)
  label: privacyRequestCopy.label, // TODO(en)
  title: privacyRequestCopy.title, // TODO(en)
  lead: privacyRequestCopy.lead, // TODO(en)
  rights: privacyRequestCopy.rights, // TODO(en)
  howTitle: privacyRequestCopy.howTitle, // TODO(en)
  how: privacyRequestCopy.how, // TODO(en)
  safety: privacyRequestCopy.safety, // TODO(en)
  altBefore: privacyRequestCopy.altBefore, // TODO(en)
  altAfter: privacyRequestCopy.altAfter, // TODO(en)
  form: privacyRequestCopy.form, // TODO(en)
};

export function getPrivacyRequestCopy(locale: Locale = "ko"): Dict<typeof privacyRequestCopy> {
  return locale === "en" ? privacyRequestCopyEn : privacyRequestCopy;
}
