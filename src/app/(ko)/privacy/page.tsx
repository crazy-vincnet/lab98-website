import { PrivacyPage, privacyMetadata } from "@/components/pages/privacy";

export const generateMetadata = () => privacyMetadata("ko");

export default function Page() {
  return <PrivacyPage locale="ko" />;
}
