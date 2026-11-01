import { TermsPage, termsMetadata } from "@/components/pages/terms";

export const metadata = termsMetadata("ko");

export default function Page() {
  return <TermsPage locale="ko" />;
}
