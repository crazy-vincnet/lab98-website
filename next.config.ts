import type { NextConfig } from "next";

/**
 * Old project slugs whose URL changed when slugs were aligned with display codes
 * (e.g. EXP-042 → AI-042). Listed before the generic rules so old links reach
 * the new page in one hop.
 */
const renamedProjectSlugs: Record<string, string> = {
  "exp-042": "ai-042",
};

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // IA rename: /experiments → /projects, /notes → /insights, /divisions/:slug → /services/:slug.
  // See node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md
  async redirects() {
    return [
      // Canonical host: www.lab98.io → lab98.io
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.lab98.io" }],
        destination: "https://lab98.io/:path*",
        permanent: true,
      },
      ...Object.entries(renamedProjectSlugs).flatMap(([from, to]) => [
        { source: `/experiments/${from}`, destination: `/projects/${to}`, permanent: true },
        { source: `/projects/${from}`, destination: `/projects/${to}`, permanent: true },
      ]),
      { source: "/experiments", destination: "/projects", permanent: true },
      { source: "/experiments/:code", destination: "/projects/:code", permanent: true },
      { source: "/notes", destination: "/insights", permanent: true },
      { source: "/notes/:slug", destination: "/insights/:slug", permanent: true },
      { source: "/divisions/:slug", destination: "/services/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
