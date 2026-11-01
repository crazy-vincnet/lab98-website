import "server-only";
import { cookies } from "next/headers";
import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";
import { authConfig } from "./env";

/** Per-user (cookie) InsForge client: only for reading who is signed in. Data access uses getInsforgeAdmin(). */
export async function getAuthClient() {
  return createServerClient({ ...authConfig(), cookies: await cookies() });
}

/** Sign-in / sign-up / verify / sign-out. Writes the session cookies (Server Actions only). */
export async function getAuthActions() {
  return createAuthActions({ ...authConfig(), cookies: await cookies() });
}
