import "../../styles";
import { SiteShell } from "@/components/site-shell";
import { rootMetadata } from "@/lib/root-metadata";

/** Root layout of the English tree (/en/...): own <html lang="en">. Metadata defaults: lib/root-metadata.ts. */
export const metadata = rootMetadata("en");

export default function EnglishRootLayout({ children }: LayoutProps<"/en">) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
