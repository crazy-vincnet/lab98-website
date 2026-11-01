import { ComingSoon } from "@/components/admin/coming-soon";
import { requireAdmin } from "@/lib/admin/auth";

// Placeholder. The stage that builds this section replaces the page (keep the requireAdmin() call first).
export default async function Page() {
  await requireAdmin();
  return <ComingSoon href="/admin/content" />;
}
