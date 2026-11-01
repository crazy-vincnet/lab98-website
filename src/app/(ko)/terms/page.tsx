import { TermsPage, termsMetadata } from "@/components/pages/terms";

export const generateMetadata = () => termsMetadata("ko");

export default function Page() {
  return <TermsPage locale="ko" />;
}
