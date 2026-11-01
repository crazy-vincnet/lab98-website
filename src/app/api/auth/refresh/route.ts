import { createRefreshAuthRouter } from "@insforge/sdk/ssr";

/** Token refresh endpoint used by the InsForge SSR helpers (admin sessions only). */
export const { POST } = createRefreshAuthRouter();
