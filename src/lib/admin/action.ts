import "server-only";
import { requireAdmin, getAdmin, type AdminUser } from "./auth";

/**
 * Wrap EVERY admin Server Action: the admin check runs before your code, so it cannot be forgotten.
 *
 *   "use server";
 *   export const saveThing = adminAction(async ({ admin }, prev: State, formData: FormData) => { ... });
 *
 * Redirects to /admin/login for non-admins (same as pages). The first argument is the context.
 */
export function adminAction<A extends unknown[], R>(fn: (ctx: { admin: AdminUser }, ...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    const admin = await requireAdmin();
    return fn({ admin }, ...args);
  };
}

/**
 * Wrap EVERY admin route handler (app/api/admin/**): answers 401 JSON instead of redirecting.
 *
 *   export const POST = adminRoute(async ({ admin }, request) => Response.json({ ok: true }));
 */
export function adminRoute<A extends unknown[]>(fn: (ctx: { admin: AdminUser }, ...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    const admin = await getAdmin();
    if (!admin) return Response.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    return fn({ admin }, ...args);
  };
}
