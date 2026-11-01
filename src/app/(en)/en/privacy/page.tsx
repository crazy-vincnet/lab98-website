import { PrivacyPage, privacyMetadata } from "@/components/pages/privacy";

export const generateMetadata = () => privacyMetadata("en");

export default function Page() {
  return <PrivacyPage locale="en" />;
}
