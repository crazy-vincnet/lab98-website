import { PraiseToolPage, praiseToolMetadata } from "@/components/pages/praise-tool";

// Public, content-only product page: the whole route must prerender. The D-day badge is computed in the browser.
export const ensureStatic = "navigation";

export const metadata = praiseToolMetadata("en");

export default function Page() {
  return <PraiseToolPage locale="en" />;
}
