import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { FlashFromUrl } from "@/components/admin/flash";
import { requireAdmin } from "@/lib/admin/auth";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { signOutAction } from "../(auth)/actions";

/**
 * Chrome for every signed-in admin page. Layouts are not re-run on client navigation, so this is NOT the
 * security boundary: each page still calls requireAdmin() itself.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell email={admin.email} groups={ADMIN_NAV} signOut={signOutAction}>
      {children}
      <Suspense>
        <FlashFromUrl />
      </Suspense>
    </AdminShell>
  );
}
