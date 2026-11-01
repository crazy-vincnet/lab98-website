import { PageHeader } from "./page-header";
import { Alert } from "./alert";
import { navItem } from "@/lib/admin/nav";

/** Placeholder for sections that are planned but not built yet. The page itself must still call requireAdmin(). */
export function ComingSoon({ href }: { href: string }) {
  const item = navItem(href);
  return (
    <>
      <PageHeader title={item?.label ?? "준비 중"} description={item?.hint} />
      <Alert>이 화면은 준비 중이에요. 곧 열릴 예정이에요.</Alert>
    </>
  );
}
