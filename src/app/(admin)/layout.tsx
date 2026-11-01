import "../styles";
import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

/**
 * Root layout of the admin tree (/admin/**): its own <html lang="ko">, no public header/footer/cookie banner.
 * noindex everywhere (<meta name="robots"> from `metadata` below, also sent as X-Robots-Tag by src/proxy.ts; robots.txt disallows /admin).
 * Pages read cookies (the session), so they render at request time behind this Suspense boundary.
 */
export const metadata: Metadata = {
  title: { default: "관리자 | Lab98", template: "%s | Lab98 관리자" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-svh bg-paper text-ink">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper">
          본문으로 건너뛰기
        </a>
        <Suspense fallback={<p className="p-8 text-gray">불러오는 중…</p>}>{children}</Suspense>
      </body>
    </html>
  );
}
