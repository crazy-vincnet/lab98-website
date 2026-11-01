/**
 * English copy for divisions (service pages). Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getDivisionCopy(locale)` in components; never import divisionCopyEn directly.
 */
import type { Dict, Locale } from "@/lib/i18n";
import { PRAISE_TOOL_LAUNCH } from "@/lib/content";
import { site } from "@/lib/content.en";
import { divisionCopy } from "./copy";

const [launchY, launchM, launchD] = PRAISE_TOOL_LAUNCH.split("-").map(Number);

export const divisionCopyEn: Dict<typeof divisionCopy> = {
  hero: {
    eyebrowCode: (short: string) => `LAB98 ${short.toUpperCase()}`,
    eyebrowKo: "Services",
    secondary: {
      dev: { label: "See sites we built", href: "#projects" },
      ai: { label: "See how we work", href: "#process" },
      faith: { label: "See Praise Tool", href: "#praise-tool" },
    },
    blockServices: "SERVICES",
    factsLabel: "At a glance",
  },
  about: {
    eyebrow: "Why",
    byDivision: {
      dev: { title: "No templates. Built around how you work." },
      ai: { title: "Why AI training?" },
      faith: { title: "Less repetitive work, more time for people" },
    },
    aiContrast: {
      not: { note: "What this is not", label: "AI replacing people" },
      is: { note: "What Lab98 AI helps with", label: "People using AI well as a tool" },
    },
  },
  services: { eyebrow: "What we do", title: "What we do" },
  // Must match the translated service title in content.en.ts (ai division).
  statusService: { ai: "AI community platform" },
  status: { eyebrow: "Notice" },
  process: {
    eyebrow: "Process",
    byDivision: {
      dev: { title: "Six steps", lead: "From the first meeting to wrap-up, you check the work at every step." },
      ai: { title: "How to get started", lead: "Send one inquiry and we will propose training that fits your group and goals." },
      faith: { title: "How we work together", lead: "We start by listening to what happens on site, and we stay on after release to help run it." },
    },
    // step must match the translated process step title in content.en.ts (dev division).
    highlight: {
      dev: {
        step: "Launch & code handover",
        badge: "What sets Lab98 apart",
        note: "What we build is yours. We hand over the source code, so you can manage it anywhere later without getting stuck.",
      },
    },
  },
  projects: {
    eyebrow: "Projects",
    title: "Sites built by Dev",
    lead: "Websites where we handled planning, design and development. We built the features each organization needed.",
    allCta: "View all projects",
  },
  praiseTool: {
    eyebrow: "First product · Praise Tool",
    title: "Lyrics and media software for worship",
    lead: "Prepare and present song lyrics, sermon slides, Bible verses and video in one program.",
    facts: [
      { label: "Supports", value: "Mac · Windows" },
      { label: "Price", value: "KRW 100,000, perpetual license" },
      { label: "Release", value: `${new Date(Date.UTC(launchY, launchM - 1, launchD)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}` },
    ],
    primaryCta: "Learn more about Praise Tool",
    secondaryCta: "Get launch notice",
  },
  others: { eyebrow: "Other services", title: "See our other divisions", lead: "The fields differ, but the standard is the same. We first ask whether the technology helps people." },
  divisionCard: { cta: (short: string) => `View ${short} services` },
  contactBand: {
    eyebrow: "Contact",
    title: "Have something to build together?",
    lead: `If you need a website, a program, training or a tool, feel free to contact us. ${site.replyTime}.`,
    cta: "Contact us",
    byDivision: {
      dev: { title: "Have a website or program you want built?" },
      ai: { title: "Does your team or school need AI training?" },
      faith: { title: "Need a tool for your ministry?" },
    },
    divisionLead: `Feel free to start with a question. ${site.replyTime}.`,
  },
};

export function getDivisionCopy(locale: Locale = "ko"): Dict<typeof divisionCopy> {
  return locale === "en" ? divisionCopyEn : divisionCopy;
}
