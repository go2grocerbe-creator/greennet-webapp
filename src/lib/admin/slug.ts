/** Lowercase, hyphenated, alphanumeric-only slug derived from a title. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Appends a short unique suffix — used only when the base slug collides. */
export function slugifyWithSuffix(title: string): string {
  return `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
}
