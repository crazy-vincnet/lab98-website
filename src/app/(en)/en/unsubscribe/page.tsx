import { UnsubscribePage, unsubscribeMetadata } from "@/components/pages/unsubscribe";

export const generateMetadata = () => unsubscribeMetadata("en");

export default function Page() {
  return <UnsubscribePage locale="en" />;
}
