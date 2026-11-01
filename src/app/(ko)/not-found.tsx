import type { Metadata } from "next";
import { NotFoundView } from "@/components/pages/not-found";
import { getChromeCopy } from "@/components/chrome/copy.en";

// Copy: docs/copy-guide.md §5-5
export const metadata: Metadata = {
  title: getChromeCopy("ko").notFound.metaTitle,
  description: getChromeCopy("ko").notFound.metaDescription,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView locale="ko" />;
}
