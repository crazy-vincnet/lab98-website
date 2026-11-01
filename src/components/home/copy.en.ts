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
    lead: "Listening to broadcasts, prayer signatures, donation forms, insurance support lookups. For each organization, we planned, designed and built the features it needed most.",
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
      // The privacy notice rows are legal text: have them reviewed before publishing.
      ariaLabel: "Project inquiry",
      interestLegend: "Topic",
      nameLabel: "Name or company (optional)",
      namePlaceholder: "Jane Kim / ABC Church",
      emailLabel: "Email for our reply",
      emailPlaceholder: "you@company.com",
      messageLabel: "Message",
      messagePlaceholder: "Tell us what you want to build, your timeline and your budget range. It's fine if it isn't all worked out yet.",
      submit: "Send inquiry",
      submitting: "Sending…",
      notice: {
        title: "Collection and use of personal information (required)",
        rows: [
          { term: "Purpose", desc: "To read and answer your inquiry, and to give quotes and advice" },
          {
            term: "Items",
            desc: "Email, message, topic, and (optional) name or company",
            note: "To prevent spam, we also store your IP address after converting it to a hash that cannot be turned back into the address.",
          },
          { term: "Retention", desc: "One year after the inquiry is closed" },
          { term: "Right to refuse", desc: "You do not have to agree. If you do not, we cannot take your inquiry through this form. In that case, please email hello@lab98.io directly." },
        ],
      },
      consentLabel: "I agree to the collection and use of my personal information above (required)",
      policyBefore: "You can read more in our",
      policyLink: "Privacy Policy",
      policyAfter: ".",
      policyNewTab: "Opens in a new tab",
      errors: {
        emailRequired: "Please enter the email we should reply to.",
        emailInvalid: "Please check the email format. Example: you@company.com",
        messageRequired: "Please write at least one line.",
        messageTooLong: "Please keep it under 2,000 characters. You can send any files in a reply email.",
        nameTooLong: "Please keep the name or company under 100 characters.",
        consentRequired: "You need to agree to the collection and use of personal information to send an inquiry.",
      },
      failure: {
        rateLimited: "We received a lot of inquiries in a short time, so we paused sending for now. Please try again in 10 minutes, or email",
        server: "We could not send your inquiry. Please try again shortly, or email",
        fallbackAfter: " directly.",
      },
      success: {
        eyebrow: "We got your inquiry",
        title: "Thank you for writing. We will reply to your email within 2 business days.",
        fallbackBefore: "If it is urgent, you can email",
        fallbackAfter: " right away.",
        reset: "Write another inquiry",
      },
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
