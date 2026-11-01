import { TermsPage, termsMetadata } from "@/components/pages/terms";

export const generateMetadata = () => termsMetadata("en");

export default function Page() {
  return <TermsPage locale="en" />;
}
