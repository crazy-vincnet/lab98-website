import type { Metadata } from "next";
import "./styles";
import { SiteShell } from "@/components/site-shell";
import { NotFoundView, notFoundMeta } from "@/components/pages/not-found";
import { rootMetadata } from "@/lib/root-metadata";

/**
 * Unmatched URLs (no route group matches, so no root layout applies). Renders the Korean shell with the 404 view.
 * Requires `experimental.globalNotFound` in next.config.ts. notFound() calls inside a locale tree use that tree's
 * own app/(ko)/not-found.tsx / app/(en)/en/not-found.tsx instead.
 */
export async function generateMetadata(): Promise<Metadata> {
  const root = await rootMetadata("ko");
  const t = await notFoundMeta("ko");
  return {
    ...root,
    title: `${t.title} | Lab98`,
    description: t.description,
    openGraph: { ...root.openGraph, title: `${t.title} | Lab98`, description: t.description },
    robots: { index: false, follow: true },
  };
}

export default function GlobalNotFound() {
  return (
    <SiteShell locale="ko">
      <NotFoundView locale="ko" />
    </SiteShell>
  );
}
