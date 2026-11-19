import MarkdownContent from "./MarkdownContent";

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
          <MarkdownContent
            size="sm"
            content={content || "*Nothing to preview yet...*"}
          />
        </div>
      )}
    </>
  );
};

export default PreviewModal;
