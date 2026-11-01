import type { Metadata } from "next";
import { AboutHero, BrandStory, DivisionsOverview, HowWeWork, Numbers, Principles, Team } from "@/components/about/about-sections";
import { ContactBand } from "@/components/divisions/division-sections";
import { aboutCopy } from "@/components/about/copy";
import { routes } from "@/components/divisions/copy";

export const metadata: Metadata = {
  title: aboutCopy.meta.title,
  description: aboutCopy.meta.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Numbers />
      <Principles />
      <HowWeWork />
      <BrandStory />
      <Team />
      <DivisionsOverview />
      <ContactBand
        title={aboutCopy.contactBand.title}
        lead={aboutCopy.contactBand.lead}
        cta={aboutCopy.contactBand.cta}
        secondary={{ label: aboutCopy.contactBand.secondaryCta, href: routes.projects }}
      />
    </>
  );
}
