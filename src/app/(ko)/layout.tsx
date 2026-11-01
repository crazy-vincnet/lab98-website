import "../styles";
import { SiteShell } from "@/components/site-shell";
import { rootMetadata } from "@/lib/root-metadata";

/** Root metadata defaults live in lib/root-metadata.ts (shared with global-not-found). */
export const metadata = rootMetadata("ko");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <SiteShell locale="ko">{children}</SiteShell>;
}
