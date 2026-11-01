import Link from "next/link";
import { divisions, site } from "@/lib/content";
import { Lockup } from "@/components/ui";
import { CONTACT_HREF, HOME_ANCHORS, INSIGHTS_PATH, PROJECTS_PATH, divisionHref } from "@/components/experiments/paths";
import { serviceLabel } from "@/components/home/copy";

const companyLinks = [
  { label: "회사 소개", href: "/about" },
  { label: "일하는 방식", href: `/#${HOME_ANCHORS.process}` },
  { label: "프로젝트", href: PROJECTS_PATH },
  { label: "인사이트", href: INSIGHTS_PATH },
  { label: "문의", href: CONTACT_HREF },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="wrap pb-12 pt-14 md:pt-[72px]">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <Lockup inverse height={48} className="h-10 w-auto md:h-12" />
          <div className="grid w-full grid-cols-2 gap-x-8 gap-y-10 text-base sm:w-auto sm:grid-cols-3 md:gap-16">
            <FooterCol title="Company" links={companyLinks} />
            <FooterCol title="Services" links={divisions.map((d) => ({ label: serviceLabel[d.slug], href: divisionHref(d.slug) }))} />
            <FooterCol title="Follow" links={site.social.map((s) => ({ label: s.label, href: s.href }))} />
          </div>
        </div>
        <p className="mt-14 text-balance font-logo text-display font-extrabold md:mt-24">
          We test, we&nbsp;ship<span className="ml-[0.06em] inline-block size-[0.2em] rounded-full bg-red align-baseline" aria-hidden />
          <span className="sr-only">.</span>
        </p>
        {/* TODO(content): add the business info line (상호 · 대표 · 사업자등록번호) once confirmed. */}
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-ink-line pt-6 font-mono text-xs tracking-[0.06em] text-ink-text md:flex-row">
          <span>
            © 2026 {site.name} · {site.url.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-5">
      <span className="mb-1.5 font-mono text-xs uppercase tracking-[0.06em] text-ink-text">{title}</span>
      {links.map((l) => (
        <Link key={l.label} href={l.href} className="-my-2.5 py-2.5 hover:underline hover:underline-offset-4">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
