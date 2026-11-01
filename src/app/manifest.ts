import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/site-content";

/** /manifest.webmanifest — colors match globals.css (--color-paper #ffffff, --color-ink #111111). */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { site } = await getSiteContent("ko"); // admin-editable (site.info)
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    lang: "ko",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111111",
    categories: ["business", "productivity", "education"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
