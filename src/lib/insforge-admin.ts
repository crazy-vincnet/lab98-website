import "server-only";
import { createAdminClient } from "@insforge/sdk";

/**
 * InsForge client with the project admin key. Server code only (Server Actions, route handlers).
 * The key is full-access: never import this from a client component or expose it as NEXT_PUBLIC_*.
 */
export function getInsforgeAdmin() {
  const baseUrl = process.env.INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!baseUrl || !apiKey) throw new Error("INSFORGE_URL / INSFORGE_API_KEY are not set (see .env.example)");
  return createAdminClient({ baseUrl, apiKey });
}
