/**
 * English copy for about. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getAboutCopy(locale)` in components; never import aboutCopyEn directly.
 */
import type { Dict, Locale } from "@/lib/i18n";
import { site } from "@/lib/content.en";
import { aboutCopy } from "./copy";

export const aboutCopyEn: Dict<typeof aboutCopy> = {
  meta: {
    title: "About us",
    description: `${site.name} builds technology that helps people. This page covers web and software development (Dev), AI training (AI), and software for churches and mission organizations (Faith).`,
  },
  hero: {
    eyebrow: "About",
    title: "Lab98 builds technology that helps people",
    primaryCta: "Contact us",
    secondaryCta: "View projects",
  },
  founderWords: {
    eyebrow: "Founder's words",
    attribution: `— ${site.founder.display}, Founder`,
    brandLineLabel: "Brand line",
  },
  name: {
    index: "01",
    eyebrow: "Our name",
    title: "The 98 in our name",
    promise: "I put my own name on this work. It is my promise to stand behind every result.",
  },
  divisions: {
    index: "02",
    eyebrow: "Divisions",
    title: "Three divisions",
    lead: "The fields differ, but the standard is the same. We first ask whether the technology helps people.",
    swatchesLabel: "Told apart by one dot",
    swatchesBody: "The dot in the Lab98 logo is the accent color. The company uses Signal Red, and each division uses a blue, green or gold dot.",
    swatchColor: { master: "SIGNAL RED", dev: "DEV BLUE", ai: "NODE GREEN", faith: "LIGHT GOLD" },
    masterRole: "The company",
  },
  principles: {
    index: "03",
    eyebrow: "Principles",
    title: "How we work",
    items: [
      { code: "TOOL", title: "Technology is a tool", body: "Before asking what we can build, we ask whether the people using it will find life easier." },
      { code: "CODE", title: "You get the code", body: "What we build is yours. We hand over the source code at launch, so you can manage it anywhere later without getting stuck." },
      { code: "OWN", title: "We see it through", body: "One person handles everything from planning to development. Right now the founder talks to clients and builds the work himself." },
    ],
  },
  team: {
    index: "04",
    eyebrow: "Team",
    title: "The people building with us",
    lead: "The founder started alone and is now looking for people to join.",
    monogram: "VJ",
    openBadge: "OPEN ROLE",
    openCta: "Apply",
    roles: [
      { role: "Designer", body: "Someone to help design screens that are easy for people to use" },
      { role: "Full-stack developer", body: "Someone to build websites and programs with us" },
      { role: "Writer", body: "Someone to explain technology and ministry in plain writing" },
    ],
    applySubject: (role: string) => `[${site.name} application] ${role}`,
  },
  contactBand: {
    title: "Have something to build together?",
    lead: `If you need a website, a program, AI training or a tool for your ministry, feel free to contact us. ${site.replyTime}.`,
    cta: "Contact us",
    secondaryCta: "View projects",
  },
};

export function getAboutCopy(locale: Locale = "ko"): Dict<typeof aboutCopy> {
  return locale === "en" ? aboutCopyEn : aboutCopy;
}
