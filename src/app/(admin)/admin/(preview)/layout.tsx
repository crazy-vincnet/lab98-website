import type { ReactNode } from "react";

/** Bare shell for iframe/new-tab previews: no sidebar. Pages here MUST call requireAdmin() themselves. */
export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <div id="main">{children}</div>;
}
