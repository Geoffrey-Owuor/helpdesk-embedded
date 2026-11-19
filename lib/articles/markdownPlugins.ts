import type { Element, ElementContent, Root, RootContent } from "hast";
import { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import { generateSlug } from "@/utils/GenerateSlug";

// Plain text of a hast node (what a reader sees, without markup)
export const hastToText = (
  node: Root | RootContent | ElementContent,
): string => {
  if (node.type === "text") return node.value;
  if ("children" in node) return node.children.map(hastToText).join("");
  return "";
};

const walk = (node: Root | Element, visit: (el: Element) => void) => {
  for (const child of node.children) {
    if (child.type === "element") {
      visit(child);
      walk(child, visit);
    }
  }
};

// Raw HTML in articles is allowed, limited to GitHub's safe subset (details,
// summary, kbd, sub/sup, br...). Scripts, styles, iframes and event handlers
// are dropped; ids get the "user-content-" prefix so an article can't take
// over an app element's id. Video embeds come from links, not raw iframes.
export const articleSanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Let authors right/centre-align table cells the way GFM does
    th: [...(defaultSchema.attributes?.th ?? []), "align"],
    td: [...(defaultSchema.attributes?.td ?? []), "align"],
  },
};

// Runs after sanitize:
// - gives h2/h3 headings a slug id (deduplicated, so two "Notes" headings
//   don't share one) for the table of contents and shareable #links;
// - points in-page links at the sanitized ids: footnotes and raw HTML
//   anchors are written as "#fn-1", but sanitize renamed the target to
//   "user-content-fn-1".
export const rehypeArticleAnchors = () => (tree: Root) => {
  const ids = new Set<string>();
  walk(tree, (el) => {
    const id = el.properties?.id;
    if (typeof id === "string") ids.add(id);
  });

  const seen = new Map<string, number>();
  walk(tree, (el) => {
    if ((el.tagName === "h2" || el.tagName === "h3") && !el.properties.id) {
      const base = generateSlug(hastToText(el)) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      let id = count === 0 ? base : `${base}-${count}`;
      while (ids.has(id)) id = `${id}-1`;
      ids.add(id);
      el.properties.id = id;
    }
  });

  walk(tree, (el) => {
    const href = el.properties?.href;
    if (el.tagName !== "a" || typeof href !== "string" || !href.startsWith("#"))
      return;
    let target = href.slice(1);
    try {
      target = decodeURIComponent(target);
    } catch {
      // malformed escape: compare the raw fragment
    }
    if (!ids.has(target) && ids.has(`user-content-${target}`)) {
      el.properties.href = `#user-content-${target}`;
    }
  });
};
