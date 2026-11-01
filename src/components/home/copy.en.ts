/**
 * English home-page copy. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getHomeCopy(locale)` in components; never import homeCopyEn directly.
 * Owner: translation agent "home". `// TODO(en)` = still the Korean fallback.
 */
import { type Dict, type Locale } from "@/lib/i18n";
import { homeCopy } from "./copy";

export const homeCopyEn: Dict<typeof homeCopy> = {
  heroCopy: {
    label: "Lab98 · Dev · AI · Faith",
    lead: "From custom web and software development to AI training and software for churches. We build easy-to-use tools so people can focus on what matters more.",
    ctaPrimary: "Start a project",
    ctaSecondary: "See our work",
    blockDivisionsLabel: "Services",
    blockCaption: "Tools for people",
    motionPause: "Pause",
    motionPlay: "Play",
    motionSr: "Pause or play the hero animation",
  },
  trustCopy: {
    label: "Why work with Lab98",
    code: { title: "Source code included", body: "You get the source code along with the finished work" },
    price: { title: "Custom builds from KRW 2M", body: "No templates, built from scratch" },
    clients: (n: number) => `Worked with ${n} organizations`,
  },
  praiseCopy: {
    name: "Praise Tool",
    launch: "Launching Nov 11",
    line: "Lyrics and media presentation software for worship · Mac & Windows · KRW 100,000 perpetual license",
    notify: "Get launch updates",
    more: "Learn more",
    fallback: "Coming soon",
    today: "Launching today",
    after: "Available now",
  },
  servicesCopy: {
    index: "01",
    eyebrow: "Services",
    title: "We build the tools you need, and help you use them well",
    lead: "We build custom websites and software, and teach you how to use AI properly. For churches and mission organizations, we stay with you through operations.",
    hook: { dev: "From KRW 2M · source code included" },
    cardFoot: (short: string) => `View ${short} services`,
  },
  projectsCopy: {
    index: "02",
    eyebrow: "Projects",
    title: "What we've built",
    // TODO(en): the strings below are still Korean
    lead: homeCopy.projectsCopy.lead,
    more: "View all projects",
    clientsLabel: "Worked with",
    newTab: "(opens in a new tab)",
  },
  processCopy: {
    index: "03",
    eyebrow: "How we work",
    title: "Six steps, from the first meeting to handing over the code",
    lead: "We confirm with mockups before building, so the direction never drifts. At launch you get the source code too, so you're never stuck wherever you manage it later.",
    highlight: "The Lab98 promise",
  },
  founderCopy: {
    index: "04",
    eyebrow: "About",
    more: "About Lab98",
  },
  insightsCopy: {
    index: "05",
    eyebrow: "Insights",
    title: "What we've learned at work",
    lead: "We write up what we build and how we think, in plain language.",
    more: "View all insights",
  },
  contactCopy: {
    index: "06",
    eyebrow: "Contact",
    title: ["Have a project", "to build together?"],
    lead: "Web and software development, AI training, church software: tell us whatever you need.",
    infoEmail: "Email",
    infoReply: "Reply",
    form: {
      // TODO(en): all form strings (labels, privacy notice, errors, success) are still Korean.
      // The privacy notice rows are legal text: have them reviewed before publishing.
      ...homeCopy.contactCopy.form,
      ariaLabel: "Project inquiry",
      submit: "Send inquiry",
      submitting: "Sending…",
    },
  },
  interestLabel: {
    master: "Not sure yet",
    dev: "Dev · Web & software development",
    ai: "AI training",
    faith: "Faith · Software for churches & missions",
  },
};

export function getHomeCopy(locale: Locale = "ko"): Dict<typeof homeCopy> {
  return locale === "en" ? homeCopyEn : homeCopy;
}
