import type { LegalDocCopy } from "./legal-copy-types";
import { COOKIES_DEFAULT_VERSION } from "./cookies.copy";

/** English translation of the cookie policy; the Korean version prevails. */
export const cookiesEn: LegalDocCopy = {
  title: "Cookie Policy",
  intro: ["What the Lab98 website stores in your browser, what it does not store, and how to change your choice."],
  introNote: "This is an English translation for convenience; the Korean version prevails.",
  effectiveDate: "November 1, 2026",
  version: COOKIES_DEFAULT_VERSION,
  sections: [
    {
      id: "what",
      heading: "What cookies are",
      blocks: [{ p: "A cookie is a small text file that a website stores in a visitor's browser. Browser storage (localStorage) is a similar way to keep information inside the browser. In this policy, we call both “cookies and similar technologies”." }],
    },
    {
      id: "used",
      heading: "What Lab98 uses now",
      blocks: [
        { p: "This website does not currently set cookies. The only thing it stores in your browser is the item below." },
        {
          table: {
            caption: "Browser storage items in use",
            head: ["Name", "Type", "Purpose", "Category", "Retention"],
            rows: [["`lab98-consent`", "Browser storage (localStorage)", "Remembers your cookie consent choice and the date you made it, so we do not ask again on every visit", "Essential", "Until you delete it or change your choice"]],
          },
        },
        { p: "This value stays only in your browser and is not sent to the Company's servers." },
      ],
    },
    {
      id: "not-used",
      heading: "What we do not use",
      blocks: [
        {
          ul: [
            "We do not use advertising cookies, tracking cookies or analytics (visitor statistics) cookies.",
            "We do not load external scripts such as analytics or advertising tools. Fonts are also served directly from this site, not from an external service.",
            "There is no login, so there are no login cookies either.",
          ],
        },
      ],
    },
    {
      id: "analytics",
      heading: "If we add analytics cookies",
      blocks: [
        {
          ul: [
            "If we add a visitor statistics tool, we will first update this policy and the Privacy Policy and let you know.",
            "That tool will run only if you consent to the “Analytics” category in the cookie settings. If you do not consent, it will not run.",
          ],
        },
      ],
    },
    {
      id: "change",
      heading: "Changing your choice",
      blocks: [
        { p: "You can reopen the cookie settings at any time with the button below and change your choice. You can also open them from “Cookie settings” at the very bottom of the site." },
        { cookieButton: "Open cookie settings" },
      ],
    },
    {
      id: "browser",
      heading: "Deleting data in your browser",
      blocks: [
        { p: "You can delete cookies and similar data stored in your browser in its settings. Menu names may differ slightly by version." },
        {
          ul: [
            "Chrome: Settings → Privacy and security → Third-party cookies (or Site settings) → See all site data and permissions → delete lab98.io",
            "Safari (Mac): Settings → Privacy → Manage Website Data → select lab98.io and remove",
            "Safari (iPhone): Settings → Apps → Safari → Advanced → Website Data → delete lab98.io",
            "Edge: Settings → Cookies and site permissions → Manage and delete cookies and site data → See all cookies and site data → delete lab98.io",
            "Firefox: Settings → Privacy & Security → Cookies and Site Data → Manage Data → select lab98.io and remove",
          ],
        },
        { p: "If you clear the saved choice, we will ask for your cookie consent again on your next visit." },
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: [{ p: "If you have questions about this Cookie Policy, please email [{email}](mailto:{email}). For how personal information is handled overall, see the [Privacy Policy](link:privacy)." }],
    },
  ],
  history: [{ date: "2026. 11. 01", note: "Established" }],
};
