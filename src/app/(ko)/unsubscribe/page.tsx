import { UnsubscribePage, unsubscribeMetadata } from "@/components/pages/unsubscribe";

export const generateMetadata = () => unsubscribeMetadata("ko");

export default function Page() {
  return <UnsubscribePage locale="ko" />;
}
