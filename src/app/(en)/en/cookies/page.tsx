import { CookiesPage, cookiesMetadata } from "@/components/pages/cookies";

export const generateMetadata = () => cookiesMetadata("en");

export default function Page() {
  return <CookiesPage locale="en" />;
}
