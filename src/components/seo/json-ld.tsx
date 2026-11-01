/**
 * Renders schema.org JSON-LD as a native <script> (not next/script — it's data, not code).
 * `<`, `>` and `&` are escaped to unicode so content can never close the tag or open HTML.
 * See node_modules/next/dist/docs/01-app/02-guides/json-ld.md
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
