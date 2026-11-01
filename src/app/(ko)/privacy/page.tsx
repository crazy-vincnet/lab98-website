import { PrivacyPage, privacyMetadata } from "@/components/pages/privacy";

export const metadata = privacyMetadata("ko");

export default function Page() {
  return <PrivacyPage locale="ko" />;
}
