"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/content";
import { ButtonLink, Lockup, cx } from "@/components/ui";
import { CONTACT_HREF } from "@/components/experiments/paths";
import { getChromeCopy } from "@/components/chrome/copy.en";
import { LanguageSwitcher } from "@/components/language-switcher";
import { localePath, stripLocale, type Locale } from "@/lib/i18n";

/** `nav` comes from getContent(locale).nav (server) so this client component carries no content bundle. */
export function SiteHeader({ locale = "ko", nav }: { locale?: Locale; nav: readonly NavItem[] }) {
  const t = getChromeCopy(locale).header;
  const CTA_LABEL = t.cta;
  const lp = (path: string) => localePath(locale, path);
  const pathname = usePathname();
  // The menu is "open for a pathname": navigating elsewhere closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean | ((prev: boolean) => boolean)) =>
    setOpenAt((typeof v === "function" ? v(open) : v) ? pathname : null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // While the mobile menu is open: lock scroll, make the page behind it inert,
  // move focus into the menu, close on Escape, and return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const behind = [document.getElementById("main"), document.querySelector("body > footer"), document.querySelector("[data-cookie-banner]")].filter(Boolean) as HTMLElement[];
    document.body.style.overflow = "hidden";
    behind.forEach((el) => (el.inert = true));
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenAt(null);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const basePath = stripLocale(pathname);
  const isActive = (href: string) => !href.includes("#") && href !== "/" && basePath.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
      <div className="wrap flex h-16 items-center gap-6 md:h-[88px] xl:gap-10">
        <Link href={lp("/")} aria-label={t.homeAria} className="shrink-0">
          <Lockup height={40} className="h-8 w-auto md:h-10" />
        </Link>
        {/* 6 items: tighter gaps at lg (1024px) so the row never wraps. */}
        <nav className="ml-auto hidden items-center gap-6 whitespace-nowrap text-[15px] font-bold lg:flex xl:gap-8" aria-label={t.navAria}>
          {nav.map((n) => (
            <Link key={n.href} href={lp(n.href)} aria-current={isActive(n.href) ? "page" : undefined} className={cx("relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-ink after:transition-transform after:duration-200", isActive(n.href) ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100")}>
              {n.label}
            </Link>
          ))}
        </nav>
        <ButtonLink href={lp(CONTACT_HREF)} size="sm" className="ml-auto max-sm:hidden lg:ml-0">
          {CTA_LABEL}
        </ButtonLink>
        <LanguageSwitcher locale={locale} className="max-lg:hidden" />
        <button
          type="button"
          ref={toggleRef}
          className="ml-auto flex size-11 shrink-0 items-center justify-center border-2 border-ink sm:ml-0 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.menuClose : t.menuOpen}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5">
            <i className={cx("absolute left-0 h-0.5 w-5 bg-ink transition-transform", open ? "top-1.5 rotate-45" : "top-0")} />
            <i className={cx("absolute left-0 top-1.5 h-0.5 w-5 bg-ink transition-opacity", open && "opacity-0")} />
            <i className={cx("absolute left-0 h-0.5 w-5 bg-ink transition-transform", open ? "top-1.5 -rotate-45" : "top-3")} />
          </span>
        </button>
      </div>
      <div id="mobile-menu" ref={menuRef} hidden={!open} className="fixed inset-x-0 bottom-0 top-[66px] overflow-y-auto border-t-0 bg-paper md:top-[90px] lg:hidden">
        <nav className="wrap flex flex-col py-6" aria-label={t.mobileNavAria}>
          {nav.map((n, i) => (
            <Link key={n.href} href={lp(n.href)} onClick={() => setOpen(false)} aria-current={isActive(n.href) ? "page" : undefined} className={cx("flex items-baseline gap-4 border-b-2 border-ink py-5 text-h3", isActive(n.href) && "underline decoration-2 underline-offset-8")}>
              <span className="font-mono text-sm text-gray">{String(i + 1).padStart(2, "0")}</span>
              {n.label}
            </Link>
          ))}
          <ButtonLink href={lp(CONTACT_HREF)} className="mt-8" onClick={() => setOpen(false)}>
            {CTA_LABEL}
          </ButtonLink>
          <LanguageSwitcher locale={locale} className="mt-6 self-start" onNavigate={() => setOpen(false)} />
        </nav>
      </div>
    </header>
  );
}
