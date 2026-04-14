import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          <article className="prose prose-sm dark:prose-invert prose-img:rounded-xl prose-headings:font-bold prose-a:text-blue-600 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || "*Nothing to preview yet...*"}
            </ReactMarkdown>
          </article>
        </div>
      )}
    </>
  );
};

export default PreviewModal;
