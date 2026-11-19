import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import {
  articleSanitizeSchema,
  rehypeArticleAnchors,
} from "@/lib/articles/markdownPlugins";
import MarkdownVideoLink from "./MarkdownVideoLink";
import MarkdownCodeBlock from "./MarkdownCodeBlock";

// react-markdown passes the hast `node` to every custom component; it must
// not be spread onto the DOM element (it renders as node="[object Object]").
const withoutNode = <P extends object>(props: P & { node?: unknown }): P => {
  const rest = { ...props };
  delete rest.node;
  return rest;
};

const components: Components = {
  a: (props) => <MarkdownVideoLink {...withoutNode(props)} />,
  pre: MarkdownCodeBlock,
  // Wide tables scroll sideways instead of widening the page on phones
  table: (props) => (
    <div className="small-scrollbar my-8 overflow-x-auto">
      <table {...withoutNode(props)} className="my-0" />
    </div>
  ),
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element -- remote article images of unknown size
    <img
      {...withoutNode(props)}
      alt={props.alt ?? ""}
      loading="lazy"
      decoding="async"
    />
  ),
};

const SIZE_CLASSES = {
  lg: "prose-lg",
  sm: "prose-sm",
} as const;

type MarkdownContentProps = {
  content: string;
  size?: keyof typeof SIZE_CLASSES;
  id?: string;
};

// Article Markdown, shared by the article page and the editor preview so
// both render the same thing.
const MarkdownContent = ({
  content,
  size = "lg",
  id,
}: MarkdownContentProps) => (
  <div
    id={id}
    className={`md-content prose ${SIZE_CLASSES[size]} dark:prose-invert prose-headings:scroll-mt-4 prose-headings:font-semibold prose-a:text-neutral-900 prose-a:decoration-neutral-400 prose-a:underline-offset-2 hover:prose-a:decoration-neutral-900 dark:prose-a:text-neutral-100 dark:hover:prose-a:decoration-neutral-100 prose-img:max-w-full prose-img:rounded-xl prose-code:rounded-md prose-code:border prose-code:border-neutral-200 prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-normal prose-code:text-neutral-800 prose-code:before:content-none prose-code:after:content-none dark:prose-code:border-neutral-800 dark:prose-code:bg-neutral-900 dark:prose-code:text-neutral-200 max-w-none wrap-break-word`}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // Ids are prefixed once, by sanitize; rehypeArticleAnchors fixes the links
      remarkRehypeOptions={{ clobberPrefix: "" }}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, articleSanitizeSchema],
        [rehypeHighlight, { detect: false }],
        rehypeArticleAnchors,
      ]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownContent;
