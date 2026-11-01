"use client";

import { useState, type ReactNode } from "react";
import { notesCopy as t } from "./copy";
import { ChipGroup, DivisionDot, FilterChip } from "@/components/experiments/parts";
import { Button } from "@/components/ui";
import { divisionTheme, type Division } from "@/lib/content";

const divisionOrder: Division[] = ["master", "web", "ai", "faith"];

/** Minimal data the client filter needs. The markup itself is rendered on the server. */
export type NoteFilterItem = { slug: string; division: Division };

/**
 * Insights list with a client-side division filter. Items arrive sorted (date desc);
 * the first visible item is featured. `featured[slug]` / `rows[slug]` are server-rendered
 * (FeaturedInsight / canonical InsightRow), so note bodies never ship to the client.
 * State is local only, so the route stays static.
 */
export function NoteIndex({ items, featured: featuredNodes, rows }: { items: NoteFilterItem[]; featured: Record<string, ReactNode>; rows: Record<string, ReactNode> }) {
  const [division, setDivision] = useState<Division | "all">("all");
  const results = items.filter((n) => division === "all" || n.division === division);
  const [featured, ...rest] = results;

  return (
    <>
      <div className="flex flex-col gap-4 border-y-2 border-ink py-6 lg:flex-row lg:items-center lg:justify-between">
        <ChipGroup id="note-filter-division" legend={t.filters.division}>
          <FilterChip selected={division === "all"} onClick={() => setDivision("all")} count={items.length}>
            {t.filters.all}
          </FilterChip>
          {divisionOrder.map((d) => (
            <FilterChip key={d} selected={division === d} onClick={() => setDivision(d)} count={items.filter((n) => n.division === d).length}>
              <DivisionDot division={d} className="size-2" />
              {divisionTheme[d].name}
            </FilterChip>
          ))}
        </ChipGroup>
        <p className="font-mono text-meta font-bold uppercase text-gray" aria-live="polite">
          {results.length} / {items.length} {t.filters.results}
        </p>
      </div>

      {!featured ? (
        <div className="mt-10 flex flex-col items-start gap-4 border-2 border-dashed border-ink px-6 py-12 md:px-10">
          <p className="label text-gray">{t.empty.eyebrow}</p>
          <p className="text-title text-balance">{t.empty.title}</p>
          <p className="text-body-sm text-gray">{t.empty.body}</p>
          <Button variant="secondary" size="sm" onClick={() => setDivision("all")} className="mt-1">
            {t.empty.action}
          </Button>
        </div>
      ) : (
        <>
          {featuredNodes[featured.slug]}
          {rest.length > 0 && (
            <ul className="mt-12 border-t-2 border-ink md:mt-16">
              {rest.map((n) => (
                <li key={n.slug}>{rows[n.slug]}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
