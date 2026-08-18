import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const PreviewModal = ({
  isOpen,
  content,
}: {
  isOpen: boolean;
  content: string;
}) => {
  return (
    <>
      {isOpen && (
        <div className="min-h-100.75 w-full overflow-y-auto px-4 py-3.75">
          {/* 'prose' class comes from @tailwindcss/typography */}
          <article className="prose prose-sm dark:prose-invert prose-img:rounded-xl prose-headings:font-bold prose-a:text-blue-600 prose-code:before:content-none prose-code:after:content-none prose-code:rounded-md prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-[0.875em] max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content || "*Nothing to preview yet...*"}
            </ReactMarkdown>
          </article>
        </div>
      )}
    </>
  );
};

export default PreviewModal;
