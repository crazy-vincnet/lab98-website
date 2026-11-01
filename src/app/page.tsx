import { Hero } from "@/components/home/hero";
import { Contact, Founder, Insights, PraiseToolBanner, Process, Projects, Services, TrustStrip } from "@/components/home/sections";

// Fully static: all content comes from src/lib/content.ts; motion and the D-day badge live in small client islands.
export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <PraiseToolBanner />
      <Services />
      <Projects />
      <Process />
      <Founder />
      <Insights />
      <Contact />
    </>
  );
}
