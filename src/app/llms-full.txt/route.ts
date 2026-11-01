import { llmsFullTxt } from "@/components/seo/llms";

// Built from static content only (no request data), so Cache Components prerenders it at build time.
// See node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md#with-cache-components
export async function GET() {
  return new Response(await llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
