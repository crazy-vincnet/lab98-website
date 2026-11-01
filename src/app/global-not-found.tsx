import type { Metadata } from "next";
import "./styles";
import { SiteShell } from "@/components/site-shell";
import { NotFoundView } from "@/components/pages/not-found";
import { getChromeCopy } from "@/components/chrome/copy.en";
import { rootMetadata } from "@/lib/root-metadata";

const root = rootMetadata("ko");
const t = getChromeCopy("ko").notFound;

/**
 * Unmatched URLs (no route group matches, so no root layout applies). Renders the Korean shell with the 404 view.
 * Requires `experimental.globalNotFound` in next.config.ts. notFound() calls inside a locale tree use that tree's
 * own app/(ko)/not-found.tsx / app/(en)/en/not-found.tsx instead.
 */
export const metadata: Metadata = {
  ...root,
  title: `${t.metaTitle} | Lab98`,
  description: t.metaDescription,
  openGraph: { ...root.openGraph, title: `${t.metaTitle} | Lab98`, description: t.metaDescription },
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <SiteShell locale="ko">
      <NotFoundView locale="ko" />
    </SiteShell>
  );
}
