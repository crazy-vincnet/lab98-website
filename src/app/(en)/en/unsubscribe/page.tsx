import { UnsubscribePage, unsubscribeMetadata } from "@/components/pages/unsubscribe";

export const generateMetadata = () => unsubscribeMetadata("en");

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <UnsubscribePage locale="en" searchParams={searchParams} />;
}
