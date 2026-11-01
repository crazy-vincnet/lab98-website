import type { ReactNode } from "react";
import { normalizeDoc, sanitizeUrl, type DocNode, type PostDoc } from "@/lib/post-doc";

/**
 * Renders a stored post body (Tiptap JSON) with the same article typography as <NoteBody>.
 * Security: the JSON is re-validated with `normalizeDoc` (strict node/mark allowlist, sanitized URLs) and turned into
 * React elements. There is no dangerouslySetInnerHTML, so text can never become markup.
 */
function marked(node: DocNode, key: number): ReactNode {
  let out: ReactNode = node.text;
  for (const m of node.marks ?? []) {
    if (m.type === "bold") out = <strong key={`b${key}`}>{out}</strong>;
    else if (m.type === "italic") out = <em key={`i${key}`}>{out}</em>;
    else if (m.type === "code") out = <code key={`c${key}`} className="bg-concrete px-1.5 py-0.5 font-mono text-[0.9em]">{out}</code>;
    else if (m.type === "link") {
      const href = sanitizeUrl(m.attrs?.href);
      if (!href) continue;
      const external = /^https?:/i.test(href);
      out = (
        <a
          key={`l${key}`}
          href={href}
          className="underline underline-offset-4 decoration-2 hover:text-red-text"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {out}
        </a>
      );
    }
  }
  return out;
}

function inline(nodes: DocNode[] | undefined): ReactNode[] {
  return (nodes ?? []).map((n, i) => (n.type === "hardBreak" ? <br key={i} /> : n.type === "text" ? <span key={i} className="contents">{marked(n, i)}</span> : null));
}

function listItems(nodes: DocNode[] | undefined, ordered: boolean): ReactNode {
  return (nodes ?? []).map((li, i) => (
    <li key={i} className={ordered ? "grid grid-cols-[40px_1fr] items-baseline gap-3 border-b border-line py-3.5" : "grid grid-cols-[24px_1fr] items-baseline gap-3 border-b border-line py-3.5"}>
      {ordered ? (
        <span className="font-mono text-meta font-bold text-gray" aria-hidden>
          {String(i + 1).padStart(2, "0")}
        </span>
      ) : (
        <i aria-hidden className="size-2 translate-y-[-0.15em] bg-ink" />
      )}
      <span className="flex min-w-0 flex-col gap-2">
        {(li.content ?? []).map((c, j) =>
          c.type === "paragraph" ? (
            <span key={j}>{inline(c.content)}</span>
          ) : c.type === "bulletList" || c.type === "orderedList" ? (
            <NestedList key={j} node={c} />
          ) : null,
        )}
      </span>
    </li>
  ));
}

function NestedList({ node }: { node: DocNode }) {
  const ordered = node.type === "orderedList";
  const Tag = ordered ? "ol" : "ul";
  return <Tag className="mt-2 flex flex-col border-t border-line">{listItems(node.content, ordered)}</Tag>;
}

function block(n: DocNode, i: number): ReactNode {
  switch (n.type) {
    case "paragraph":
      return n.content?.length ? <p key={i}>{inline(n.content)}</p> : null;
    case "heading":
      return n.attrs?.level === 3 ? (
        <h3 key={i} className="mt-4 text-title text-balance">
          {inline(n.content)}
        </h3>
      ) : (
        <h2 key={i} className="mt-8 border-t-2 border-ink pt-6 text-h3 text-balance">
          {inline(n.content)}
        </h2>
      );
    case "blockquote":
      return (
        <blockquote key={i} className="my-4 border-y-2 border-ink py-8 md:my-8 md:py-10">
          <span aria-hidden className="block font-mono text-numeral leading-none text-red-text">
            “
          </span>
          <div className="mt-2 flex flex-col gap-3 text-h2 text-balance">{(n.content ?? []).map((p, j) => <p key={j}>{inline(p.content)}</p>)}</div>
        </blockquote>
      );
    case "bulletList":
      return (
        <ul key={i} className="flex flex-col border-t-2 border-ink">
          {listItems(n.content, false)}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={i} className="flex flex-col border-t-2 border-ink">
          {listItems(n.content, true)}
        </ol>
      );
    case "codeBlock": {
      const lang = typeof n.attrs?.language === "string" ? n.attrs.language : undefined;
      return (
        <pre key={i} className="overflow-x-auto border-2 border-ink bg-concrete p-4 font-mono text-[0.9em] leading-relaxed" tabIndex={0}>
          <code {...(lang ? { "data-language": lang } : {})}>{n.content?.[0]?.text ?? ""}</code>
        </pre>
      );
    }
    case "horizontalRule":
      return <hr key={i} className="my-4 border-0 border-t-2 border-ink" />;
    case "image": {
      const src = sanitizeUrl(n.attrs?.src, { allowMailto: false });
      if (!src) return null;
      const w = typeof n.attrs?.width === "number" ? n.attrs.width : undefined;
      const h = typeof n.attrs?.height === "number" ? n.attrs.height : undefined;
      return (
        <figure key={i} className="my-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- storage URL, size known from the media library */}
          <img src={src} alt={typeof n.attrs?.alt === "string" ? n.attrs.alt : ""} width={w} height={h} loading="lazy" decoding="async" className="h-auto w-full border-2 border-ink" />
        </figure>
      );
    }
    default:
      return null;
  }
}

export function RichBody({ doc }: { doc: PostDoc }) {
  const safe = normalizeDoc(doc);
  return <div className="flex flex-col gap-6 text-body text-pretty">{safe.content.map(block)}</div>;
}
