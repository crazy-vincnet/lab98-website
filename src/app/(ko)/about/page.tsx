import { AboutPage, aboutMetadata } from "@/components/pages/about";

export const generateMetadata = () => aboutMetadata("ko");

export default function Page() {
  return <AboutPage locale="ko" />;
}
