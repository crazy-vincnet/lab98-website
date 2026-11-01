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
          case "quote":
            return (
              <blockquote key={i} className="my-4 border-l-2 border-ink py-2 pl-6 text-h3 text-balance md:my-6 md:pl-10">
                <p>{b.text}</p>
              </blockquote>
            );
          case "list":
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
          case "code":
            return (
              <pre key={i} className="overflow-x-auto border-2 border-ink-line bg-ink px-4 py-4 font-mono text-code text-ink-text md:px-7 md:py-6">
                <code>
                  {b.text.split("\n").map((line, j) => (
                    <span key={j} className={line.startsWith("✓") ? "block font-bold text-paper" : line.startsWith("$") ? "block text-paper" : "block"}>
                      {line || " "}
                    </span>
                  ))}
                </code>
              </pre>
            );
        }
      })}
    </div>
  );
}
