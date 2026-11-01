import { CookiesPage, cookiesMetadata } from "@/components/pages/cookies";

export const metadata = cookiesMetadata("ko");

export default function Page() {
  return <CookiesPage locale="ko" />;
}
