import { PrivacyRequestPage, privacyRequestMetadata } from "@/components/pages/privacy-request";

export const metadata = privacyRequestMetadata("en");

export default function Page() {
  return <PrivacyRequestPage locale="en" />;
}
