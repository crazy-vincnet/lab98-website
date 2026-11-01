import type { NoteBlock } from "@/lib/content";

/** Renders a note's body blocks with Lab98 article typography. */
export function NoteBody({ blocks }: { blocks: NoteBlock[] }) {
  return (
    <div className="flex flex-col gap-6 text-body text-pretty">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}>{b.text}</p>;
          case "h2":
            return (
              <h2 key={i} className="mt-8 border-t-2 border-ink pt-6 text-h3 text-balance">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-4 text-title text-balance">
                {b.text}
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i} className="my-4 border-y-2 border-ink py-8 md:my-8 md:py-10">
                <span aria-hidden className="block font-mono text-numeral leading-none text-red-text">
                  “
                </span>
                <p className="mt-2 text-h2 text-balance">{b.text}</p>
              </blockquote>
            );
          case "list":
            return (
              <ul key={i} className="flex flex-col border-t-2 border-ink">
                {b.items.map((item) => (
                  <li key={item} className="grid grid-cols-[24px_1fr] items-baseline gap-3 border-b border-line py-3.5">
                    <i aria-hidden className="size-2 translate-y-[-0.15em] bg-ink" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "olist":
            return (
              <ol key={i} className="flex flex-col border-t-2 border-ink">
                {b.items.map((item, j) => (
                  <li key={item} className="grid grid-cols-[40px_1fr] items-baseline gap-3 border-b border-line py-3.5">
                    <span className="font-mono text-meta font-bold text-gray" aria-hidden>
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            );
        }
      })}
    </div>
  );
}
