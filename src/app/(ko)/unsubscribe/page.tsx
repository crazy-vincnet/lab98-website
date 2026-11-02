import { UnsubscribePage, unsubscribeMetadata } from "@/components/pages/unsubscribe";

export const generateMetadata = () => unsubscribeMetadata("ko");

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <UnsubscribePage locale="ko" searchParams={searchParams} />;
}
