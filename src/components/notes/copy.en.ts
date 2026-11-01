/**
 * English copy for insights. Twin of ./copy.ts (Korean): same keys, same shape (enforced by Dict<>).
 * Import `getNotesCopy(locale)` in components; never import notesCopyEn directly.
 */
import type { Dict, Locale } from "@/lib/i18n";
import { notesCopy } from "./copy";

export const notesCopyEn: Dict<typeof notesCopy> = {
  meta: {
    title: "Insights",
    description: "Posts about how Lab98 works and what the Dev, AI and Faith divisions are doing.",
    notFoundTitle: "Post not found",
    /** detail title: `{title} | Lab98 Insights` */
    detailTitle: (title: string) => `${title} | Lab98 Insights`,
  },
  index: {
    eyebrow: "INSIGHTS",
    title: "Insights",
    lead: "How Lab98 thinks about its work, and what we've learned building websites and software, teaching AI and making tools for ministry.",
    listLabel: "Insights list",
    moreLabel: "Earlier posts",
  },
  list: { featured: "LATEST", read: "Read the post", readTime: (min: number) => `${min} min read`, by: "By" },
  detail: {
    back: "← Insights",
    backBottom: "← All insights",
    writtenBy: "By",
    pager: { label: "Other insights", prev: "← Previous post", next: "Next post →" },
    cta: {
      eyebrow: "Contact",
      title: "Want to build something together?",
      lead: "Ask us about a website or software project, AI training, or tools for ministry. We reply within 2 business days.",
      action: "Contact us",
    },
    explore: {
      label: "Explore more",
      services: [
        { slug: "dev", title: "Lab98 Dev", body: "Web and software development" },
        { slug: "ai", title: "Lab98 AI", body: "AI training and community" },
        { slug: "faith", title: "Lab98 Faith", body: "Software for churches and mission groups" },
      ],
      praiseTool: { title: "Praise Tool", body: "Lyrics and media software for worship" },
    },
  },
};

export function getNotesCopy(locale: Locale = "ko"): Dict<typeof notesCopy> {
  return locale === "en" ? notesCopyEn : notesCopy;
}
