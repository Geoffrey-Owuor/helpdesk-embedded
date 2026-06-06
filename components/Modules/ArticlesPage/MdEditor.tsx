"use client";
import { useState, ChangeEvent, useEffect } from "react";
import PreviewModal from "./PreviewModal";
import {
  Bold,
  Italic,
  List,
  Heading1,
  Link as LinkIcon,
  Quote,
  Heading2,
  Heading3,
  ListOrdered,
  Heading4,
  PenLine,
  Glasses,
  Keyboard,
} from "lucide-react";

// --- Types ---
type MdEditorProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

type ToolbarButtonProps = {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
};

// --- 2. THE MAIN EDITOR COMPONENT ---
const MdEditor = ({ value, onChange }: MdEditorProps) => {
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const insertText = (before: string, after: string): void => {
    const textarea = document.getElementById(
      "markdown-textarea",
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const beforeText = previousText.substring(0, start);
    const selectedText = previousText.substring(start, end);
    const afterText = previousText.substring(end);

    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;

    onChange({
      target: { name: "articleContent", value: newText },
    } as ChangeEvent<HTMLTextAreaElement>);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "p") {
        event.preventDefault();
        setShowPreview((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showPreview]);

  const handleClick = (): void => {
    setShowPreview(true);
  };

  return (
    <div className="w-full rounded-xl border border-neutral-200 transition-all focus:outline-none dark:border-neutral-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-t-xl border-b border-neutral-200 bg-neutral-50/50 px-2 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
        {!showPreview && (
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarButton
              icon={<Bold size={18} />}
              onClick={() => insertText("**", "**")}
              label="Bold"
            />
            <ToolbarButton
              icon={<Italic size={18} />}
              onClick={() => insertText("*", "*")}
              label="Italic"
            />
            <ToolbarButton
              icon={<Heading1 size={18} />}
              onClick={() => insertText("# ", "")}
              label="Heading1"
            />
            <ToolbarButton
              icon={<Heading2 size={18} />}
              onClick={() => insertText("## ", "")}
              label="Heading2"
            />
            <ToolbarButton
              icon={<Heading3 size={18} />}
              onClick={() => insertText("### ", "")}
              label="Heading3"
            />
            <ToolbarButton
              icon={<Heading4 size={18} />}
              onClick={() => insertText("#### ", "")}
              label="Heading4"
            />
            <div className="mx-2 h-4 w-px bg-neutral-300 dark:bg-neutral-600" />
            <ToolbarButton
              icon={<List size={18} />}
              onClick={() => insertText("- ", "")}
              label="List"
            />
            <ToolbarButton
              icon={<ListOrdered size={18} />}
              onClick={() => insertText("1. ", "")}
              label="Numbered List"
            />
            <ToolbarButton
              icon={<Quote size={18} />}
              onClick={() => insertText("> ", "")}
              label="Quote"
            />
            <ToolbarButton
              icon={<LinkIcon size={18} />}
              onClick={() => insertText("[", "](url)")}
              label="Link"
            />
          </div>
        )}
        {showPreview && (
          <div className="px-2 py-0.75">
            <span className="font-semibold">Content Preview</span>
          </div>
        )}
        <div className="grow" />
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`flex items-center gap-2 rounded-xl ${!showPreview ? "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"} px-3 py-2 text-xs font-semibold transition-colors`}
        >
          <PenLine size={14} />
          Write
        </button>

        <button
          type="button"
          onClick={handleClick}
          className={`group relative mr-2 flex items-center gap-2 rounded-xl ${showPreview ? "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"} px-3 py-2 text-xs font-semibold transition-colors`}
        >
          <Glasses size={14} />
          Preview
          {/* ── TOOLTIP ── */}
          <div className="pointer-events-none absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100 dark:bg-white dark:text-neutral-900">
            <Keyboard
              size={14}
              className="shrink-0 text-neutral-400 dark:text-neutral-500"
            />
            <span>Alt + P</span>

            {/* Tooltip Tail/Arrow (Centered) */}
            <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
          </div>
        </button>
      </div>

      {!showPreview && (
        <textarea
          id="markdown-textarea"
          name="articleContent"
          value={value}
          onChange={onChange}
          required
          style={{ minHeight: "24.87rem" }}
          className="default-scrollbar field-sizing-content w-full resize-none p-4 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
          placeholder="Start writing your masterpiece... (Markdown supported)"
        />
      )}
      <PreviewModal isOpen={showPreview} content={value} />
    </div>
  );
};

const ToolbarButton = ({ icon, onClick, label }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className="cursor-pointer rounded-md p-1.5 text-neutral-700 transition-all hover:bg-neutral-200 hover:text-black hover:shadow-sm dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
  >
    {icon}
  </button>
);

export default MdEditor;
