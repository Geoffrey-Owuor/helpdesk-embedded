import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { Element, Root } from "hast";
import {
  articleSanitizeSchema,
  hastToText,
  rehypeArticleAnchors,
} from "./markdownPlugins";

export type ArticleHeading = { id: string; text: string };

// The same steps MarkdownContent runs, up to the ids (highlighting only
// touches code, so it's left out). allowDangerousHtml is react-markdown's
// default; rehypeRaw then parses the HTML and sanitize trims it.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true, clobberPrefix: "" })
  .use(rehypeRaw)
  .use(rehypeSanitize, articleSanitizeSchema)
  .use(rehypeArticleAnchors);

const isHiddenLabel = (el: Element) => {
  const classes = el.properties?.className;
  return Array.isArray(classes) && classes.map(String).includes("sr-only");
};

// The article's h2 sections for the table of contents, worked out from the
// Markdown during render, so the TOC is there on the same paint as the
// article (reading them from the page afterwards made the layout jump). The
// ids come from the same rehypeArticleAnchors pass, so they always match.
export const articleHeadings = (content: string): ArticleHeading[] => {
  const tree = processor.runSync(processor.parse(content)) as Root;
  const headings: ArticleHeading[] = [];

  const visit = (node: Root | Element) => {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      const id = child.properties?.id;
      // The footnotes section's screen-reader-only "Footnotes" label isn't a
      // section of the article
      if (
        child.tagName === "h2" &&
        typeof id === "string" &&
        !isHiddenLabel(child)
      ) {
        headings.push({ id, text: hastToText(child).trim() });
      }
      visit(child);
    }
  };
  visit(tree);

  return headings;
};
