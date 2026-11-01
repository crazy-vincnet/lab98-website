import { PrivacyRequestPage, privacyRequestMetadata } from "@/components/pages/privacy-request";

export const generateMetadata = () => privacyRequestMetadata("ko");

export default function Page() {
  return <PrivacyRequestPage locale="ko" />;
}
