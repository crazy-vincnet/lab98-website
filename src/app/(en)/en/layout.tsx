import "../../styles";
import { SiteShell } from "@/components/site-shell";
import { rootMetadataWithVerification } from "@/lib/root-metadata";

/** Root layout of the English tree (/en/...): own <html lang="en">. Metadata defaults: lib/root-metadata.ts. */
export const generateMetadata = () => rootMetadataWithVerification("en");

export default function EnglishRootLayout({ children }: LayoutProps<"/en">) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
