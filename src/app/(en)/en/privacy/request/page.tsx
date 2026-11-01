import { PrivacyRequestPage, privacyRequestMetadata } from "@/components/pages/privacy-request";

export const generateMetadata = () => privacyRequestMetadata("en");

export default function Page() {
  return <PrivacyRequestPage locale="en" />;
}
