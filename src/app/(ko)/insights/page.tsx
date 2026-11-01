import { InsightsPage, insightsMetadata } from "@/components/pages/insights";

export const ensureStatic = "navigation";

export const metadata = insightsMetadata("ko");

export default function Page() {
  return <InsightsPage locale="ko" />;
}
