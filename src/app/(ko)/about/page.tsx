import { AboutPage, aboutMetadata } from "@/components/pages/about";

export const metadata = aboutMetadata("ko");

export default function Page() {
  return <AboutPage locale="ko" />;
}
