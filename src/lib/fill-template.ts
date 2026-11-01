/** Fills `{token}` placeholders of an editable copy template (docs/admin-content.md, "Placeholders"). Unknown tokens stay as written. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{([A-Za-z_][\w.]*)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
