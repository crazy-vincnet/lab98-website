import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";

/**
 * Keeps the InsForge session cookies fresh before /admin pages render.
 * Runs ONLY for /admin/** and /api/auth/** (see matcher): the public static site never goes through here.
 * This is not the authorization layer: every admin page/action calls requireAdmin() itself.
 */
const SIGNED_OUT_PAGES = ["/admin/login", "/admin/setup", "/admin/forgot-password"];

export async function proxy(request: NextRequest) {
  // Cheap early bounce (a real HTTP redirect instead of a streamed one) when there is no session cookie at all.
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/admin") &&
    !SIGNED_OUT_PAGES.includes(pathname.replace(/\/$/, "")) &&
    !request.cookies.has("insforge_access_token") &&
    !request.cookies.has("insforge_refresh_token")
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  const response = NextResponse.next({ request });
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  try {
    await updateSession({ requestCookies: request.cookies, responseCookies: response.cookies });
  } catch {
    /* refresh failed: the page's requireAdmin() will send the visitor to /admin/login */
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
