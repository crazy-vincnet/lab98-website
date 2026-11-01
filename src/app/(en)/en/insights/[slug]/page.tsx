import type { Metadata } from "next";
import { InsightPage, insightMetadata, insightStaticParams } from "@/components/pages/insight-detail";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return insightStaticParams("en");
}

export async function generateMetadata({ params }: PageProps<"/en/insights/[slug]">): Promise<Metadata> {
  return insightMetadata("en", params);
}

export default function Page({ params }: PageProps<"/en/insights/[slug]">) {
  return <InsightPage locale="en" params={params} />;
}
