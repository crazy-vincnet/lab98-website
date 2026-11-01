import { Hero } from "@/components/home/hero";
import { About, Contact, Insights, Process, Projects, Services } from "@/components/home/sections";

// Fully static: all content comes from src/lib/content.ts; motion lives in small client islands.
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Projects />
      <Process />
      <Insights />
      <Contact />
    </>
  );
}
