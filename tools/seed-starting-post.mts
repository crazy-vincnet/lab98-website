/**
 * One-off: copy the static `starting-lab98` note (content.ts / content.en.ts) into the `posts` table as a published
 * Korean + English pair, so it can be edited in /admin/blog. After this the DB post wins by slug; the static note
 * stays in the code as a fallback (delete the DB rows and the static note shows again).
 *
 *   npx -y tsx --env-file=.env.local tools/seed-starting-post.mts          # dry run
 *   npx -y tsx --env-file=.env.local tools/seed-starting-post.mts --apply
 *
 * Idempotent: rows that already exist (same slug + locale) are left alone.
 */
import { createAdminClient } from "@insforge/sdk";
import { notes as koNotes, type NoteBlock } from "../src/lib/content";
import { notes as enNotes } from "../src/lib/content.en";
import { normalizeDoc, type DocNode } from "../src/lib/post-doc";

const SLUG = "starting-lab98";
const text = (t: string): DocNode[] => (t ? [{ type: "text", text: t }] : []);

function toDoc(blocks: NoteBlock[]) {
  const content: DocNode[] = blocks.map((b): DocNode => {
    switch (b.type) {
      case "p":
        return { type: "paragraph", content: text(b.text) };
      case "h2":
        return { type: "heading", attrs: { level: 2 }, content: text(b.text) };
      case "h3":
        return { type: "heading", attrs: { level: 3 }, content: text(b.text) };
      case "quote":
        return { type: "blockquote", content: [{ type: "paragraph", content: text(b.text) }] };
      case "list":
      case "olist":
        return { type: b.type === "list" ? "bulletList" : "orderedList", content: b.items.map((i) => ({ type: "listItem", content: [{ type: "paragraph", content: text(i) }] })) };
    }
  });
  return normalizeDoc({ type: "doc", content });
}

async function main() {
  const apply = process.argv.includes("--apply");
  const db = createAdminClient({ baseUrl: process.env.INSFORGE_URL!, apiKey: process.env.INSFORGE_API_KEY! }).database;
  const key = crypto.randomUUID();
  for (const [locale, list] of [["ko", koNotes], ["en", enNotes]] as const) {
    const n = list.find((x) => x.slug === SLUG);
    if (!n) continue;
    const { data } = await db.from("posts").select("id").eq("slug", SLUG).eq("locale", locale).limit(1);
    if (data?.length) {
      console.log(`${locale}: already in DB, skipped`);
      continue;
    }
    const row = {
      slug: SLUG,
      locale,
      status: "published",
      title: n.title,
      excerpt: n.excerpt,
      blocks: toDoc(n.body),
      published_at: new Date(`${n.date}T09:00:00+09:00`).toISOString(),
      translation_key: key,
      division: n.division,
      author: n.author,
    };
    console.log(`${locale}: ${apply ? "inserting" : "would insert"} "${n.title}" (${row.blocks.content.length} blocks)`);
    if (apply) {
      const { error } = await db.from("posts").insert([row]);
      if (error) throw new Error(error.message);
    }
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
