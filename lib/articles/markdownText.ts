import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Nodes } from "mdast";

const parser = unified().use(remarkParse).use(remarkGfm);

// Node types that end a block: their text is kept apart from the next block's
const BLOCKS = new Set([
  "paragraph",
  "heading",
  "listItem",
  "tableCell",
  "blockquote",
  "code",
  "footnoteDefinition",
]);

type TextOptions = {
  // Code blocks: counted for reading time, left out of a card preview
  includeCode: boolean;
};

const collect = (node: Nodes, out: string[], options: TextOptions) => {
  switch (node.type) {
    case "text":
    case "inlineCode":
      out.push(node.value);
      return;
    case "code":
      if (options.includeCode) out.push(node.value);
      break;
    case "image":
      if (node.alt) out.push(node.alt);
      return;
    case "html":
      // Raw HTML (<details>, <kbd>...): its text, not its tags
      out.push(node.value.replace(/<[^>]*>/g, " "));
      return;
    case "break":
      out.push(" ");
      return;
    case "definition":
      return;
  }

  if ("children" in node) {
    for (const child of node.children) collect(child as Nodes, out, options);
  }
  if (BLOCKS.has(node.type)) out.push("\n");
};

// The text a reader sees once the Markdown is rendered: no syntax, link URLs
// or tags, with blocks separated by newlines
export const markdownToText = (
  markdown: string,
  options: TextOptions = { includeCode: true },
) => {
  const out: string[] = [];
  collect(parser.parse(markdown), out, options);
  return out.join("");
};

const WORDS_PER_MINUTE = 200;

// "N min read" from the rendered text, so syntax, URLs and HTML tags don't
// count as words
export const articleReadTime = (markdown: string) => {
  const words = markdownToText(markdown).match(/\S+/g)?.length ?? 0;
  return `${Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} min read`;
};

// A card's excerpt: plain prose from the start of the article, cut at a word
export const articlePreviewText = (markdown: string, maxLength = 180) => {
  // The excerpt comes from the start; long articles needn't be parsed whole
  const text = markdownToText(markdown.slice(0, 4000), { includeCode: false })
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, "")}…`;
};
