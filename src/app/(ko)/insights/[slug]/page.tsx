import type { Metadata } from "next";
import { InsightPage, insightMetadata, insightStaticParams } from "@/components/pages/insight-detail";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return insightStaticParams("ko");
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  return insightMetadata("ko", params);
}

export default function Page({ params }: PageProps<"/insights/[slug]">) {
  return <InsightPage locale="ko" params={params} />;
}
