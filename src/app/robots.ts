import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { NOINDEX_PATHS, WELCOMED_CRAWLERS, absoluteUrl } from "@/lib/seo";

/**
 * /robots.txt — open to every crawler, including AI answer engines (GEO: we want them to cite Lab98).
 * Named groups are listed explicitly so a crawler that only reads its own group still sees "allowed".
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = [...NOINDEX_PATHS];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: [...WELCOMED_CRAWLERS], allow: "/", disallow },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: new URL(site.url).host,
  };
}
