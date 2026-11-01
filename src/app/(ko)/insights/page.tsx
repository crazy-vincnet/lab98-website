import { InsightsPage, insightsMetadata } from "@/components/pages/insights";

export const ensureStatic = "navigation";

export const generateMetadata = () => insightsMetadata("ko");

export default function Page() {
  return <InsightsPage locale="ko" />;
}
