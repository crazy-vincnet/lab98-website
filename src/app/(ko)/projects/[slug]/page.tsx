import type { Metadata } from "next";
import { ProjectPage, projectMetadata, projectStaticParams } from "@/components/pages/project-detail";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return projectStaticParams("ko");
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  return projectMetadata("ko", params);
}

export default function Page({ params }: PageProps<"/projects/[slug]">) {
  return <ProjectPage locale="ko" params={params} />;
}
