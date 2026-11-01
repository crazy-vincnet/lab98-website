import type { Metadata } from "next";
import { ServicePage, serviceMetadata, serviceStaticParams } from "@/components/pages/service";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return serviceStaticParams("en");
}

export async function generateMetadata({ params }: PageProps<"/en/services/[slug]">): Promise<Metadata> {
  return serviceMetadata("en", params);
}

export default function Page({ params }: PageProps<"/en/services/[slug]">) {
  return <ServicePage locale="en" params={params} />;
}
