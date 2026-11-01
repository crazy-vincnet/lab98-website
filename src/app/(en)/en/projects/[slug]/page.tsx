import type { Metadata } from "next";
import { ProjectPage, projectMetadata, projectStaticParams } from "@/components/pages/project-detail";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return projectStaticParams("en");
}

export async function generateMetadata({ params }: PageProps<"/en/projects/[slug]">): Promise<Metadata> {
  return projectMetadata("en", params);
}

export default function Page({ params }: PageProps<"/en/projects/[slug]">) {
  return <ProjectPage locale="en" params={params} />;
}
