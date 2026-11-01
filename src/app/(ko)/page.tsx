import { HomePage, homeMetadata } from "@/components/pages/home";

export const generateMetadata = () => homeMetadata("ko");

export default function Home() {
  return <HomePage locale="ko" />;
}
