import "../styles";
import { SiteShell } from "@/components/site-shell";
import { rootMetadataWithVerification } from "@/lib/root-metadata";

/** Root metadata defaults live in lib/root-metadata.ts (shared with global-not-found). */
export const generateMetadata = () => rootMetadataWithVerification("ko");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <SiteShell locale="ko">{children}</SiteShell>;
}
