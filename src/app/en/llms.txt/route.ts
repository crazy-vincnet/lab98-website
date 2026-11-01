import { llmsTxtEn } from "@/components/seo/llms.en";

// Static content only (no request data), so Cache Components prerenders it at build time. English twin of app/llms.txt.
export function GET() {
  return new Response(llmsTxtEn(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
