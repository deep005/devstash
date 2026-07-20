/** System item type names that resolve from each `/items/[type]` URL slug. */
const SLUG_TO_TYPE_NAME: Record<string, string> = {
  snippets: "snippet",
  prompts: "prompt",
  commands: "command",
  notes: "note",
  files: "file",
  images: "image",
  links: "link",
};

/** Resolves a `/items/[type]` slug (e.g. "snippets") to its system type name (e.g. "snippet"), or null if unknown. */
export function resolveTypeSlug(slug: string): string | null {
  return SLUG_TO_TYPE_NAME[slug] ?? null;
}

/** Capitalized, pluralized label for an item type, e.g. "snippet" → "Snippets". */
export function typeLabel(name: string): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}s`;
}

/** Route for an item type, e.g. "snippet" → "/items/snippets". */
export function typeHref(name: string): string {
  return `/items/${name}s`;
}
