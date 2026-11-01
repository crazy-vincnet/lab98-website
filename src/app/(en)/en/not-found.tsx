import type { Metadata } from "next";
import { NotFoundView } from "@/components/pages/not-found";
import { getChromeCopy } from "@/components/chrome/copy.en";

export const metadata: Metadata = {
  title: getChromeCopy("en").notFound.metaTitle,
  description: getChromeCopy("en").notFound.metaDescription,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView locale="en" />;
}
