import { InsightsPage, insightsMetadata } from "@/components/pages/insights";

export const ensureStatic = "navigation";

export const generateMetadata = () => insightsMetadata("en");

export default function Page() {
  return <InsightsPage locale="en" />;
}
