import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { envAdminEmails } from "./env";
import { getAuthClient } from "./insforge";

export type AdminUser = { id: string; email: string };

/** True when `email` (any case) is in ADMIN_EMAILS or in the `admins` table. Service key; no session needed. */
export async function isAdminEmail(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  if (envAdminEmails().includes(e)) return true;
  try {
    const { data } = await getInsforgeAdmin().database.from("admins").select("email").eq("email", e).limit(1);
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false; // fail closed
  }
}

/**
 * The signed-in admin, or null. Signed in is NOT enough (signup on the project is open):
 * the session must be valid (checked against InsForge), the email verified, and the email an admin.
 * Deduped per request.
 */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  try {
    const client = await getAuthClient();
    const { data, error } = await client.auth.getCurrentUser();
    const user = data?.user;
    if (error || !user?.email || user.emailVerified !== true) return null;
    if (!(await isAdminEmail(user.email))) return null;
    return { id: user.id, email: user.email.toLowerCase() };
  } catch {
    return null; // fail closed
  }
});

/**
 * Call FIRST in every admin page, Server Action and route handler (Actions: use adminAction()).
 * Redirects to /admin/login when the caller is not an authorized admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
