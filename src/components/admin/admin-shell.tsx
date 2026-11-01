"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { NavGroup } from "@/lib/admin/nav";
import { cx } from "./cx";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function Nav({ groups, pathname, onNavigate }: { groups: NavGroup[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="관리자 메뉴" className="grid gap-5">
      {groups.map((g, i) => (
        <div key={g.title || i}>
          {g.title && <p className="mb-1 px-3 text-[13px] font-bold text-gray">{g.title}</p>}
          <ul className="grid">
            {g.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex min-h-11 items-center justify-between gap-2 px-3 py-2 text-[15px] leading-snug",
                      active ? "bg-ink font-bold text-paper" : "hover:bg-concrete",
                    )}
                  >
                    <span>{item.label}</span>
                    {!item.ready && <span className={cx("shrink-0 text-[12px]", active ? "text-ink-text" : "text-gray")}>준비 중</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * Sidebar (fixed on desktop, drawer on phones) + top bar. `signOut` is a Server Action passed from the layout.
 */
export function AdminShell({
  email,
  groups,
  signOut,
  children,
}: {
  email: string;
  groups: NavGroup[];
  signOut: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    drawerRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-line bg-[#f6f6f4] lg:block">
        <div className="sticky top-0 flex max-h-svh flex-col gap-5 overflow-y-auto p-3">
          <Link href="/admin" className="px-3 pt-2 text-[18px] font-bold">
            Lab98 <span className="text-gray">관리자</span>
          </Link>
          <Nav groups={groups} pathname={pathname} />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-line bg-paper px-4 lg:px-8">
          <button
            type="button"
            className="-ml-2 inline-flex min-h-11 items-center px-2 text-[15px] font-bold lg:hidden"
            aria-expanded={open}
            aria-controls="admin-drawer"
            onClick={() => setOpen(true)}
          >
            메뉴
          </button>
          <span className="font-bold lg:hidden">Lab98 관리자</span>
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-[14px] text-gray sm:inline">{email}</span>
            <form action={signOut}>
              <button type="submit" className="min-h-11 border border-ink px-3 text-[15px] font-bold hover:bg-concrete">
                로그아웃
              </button>
            </form>
          </div>
        </header>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="관리자 메뉴">
            <button type="button" className="absolute inset-0 bg-ink/50" aria-label="메뉴 닫기" onClick={() => setOpen(false)} />
            <div id="admin-drawer" ref={drawerRef} className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] overflow-y-auto bg-paper p-3">
              <div className="mb-4 flex items-center justify-between px-3 pt-1">
                <span className="text-[18px] font-bold">Lab98 관리자</span>
                <button type="button" onClick={() => setOpen(false)} className="min-h-11 px-2 text-[15px] font-bold">
                  닫기
                </button>
              </div>
              <Nav groups={groups} pathname={pathname} onNavigate={() => setOpen(false)} />
              <p className="mt-5 break-all px-3 text-[13px] text-gray">{email}</p>
            </div>
          </div>
        )}

        <main id="main" className="mx-auto w-full max-w-[1100px] px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
