import type { Metadata } from "next";
import { ServicePage, serviceMetadata, serviceStaticParams } from "@/components/pages/service";

// Service (division) pages are public, content-only pages: require complete static output.
// See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/ensureStatic.md
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return serviceStaticParams("ko");
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  return serviceMetadata("ko", params);
}

export default function Page({ params }: PageProps<"/services/[slug]">) {
  return <ServicePage locale="ko" params={params} />;
}
