import type { ReactNode } from "react";

/** Centered card for login / setup / password reset. No session required. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="mx-auto grid min-h-svh w-full max-w-[440px] content-center px-4 py-10">
      <p className="mb-6 text-[20px] font-bold">
        Lab98 <span className="text-gray">관리자</span>
      </p>
      <div className="border border-line bg-paper p-5 sm:p-6">{children}</div>
    </main>
  );
}
