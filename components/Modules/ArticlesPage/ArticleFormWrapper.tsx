"use client";
import {
  BookOpen,
  ChevronDown,
  FileTypeCorner,
  Library,
  Lightbulb,
  Newspaper,
  Subtitles,
  Type,
} from "lucide-react";
import MdEditor from "./MdEditor";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import { FormData } from "./PostArticle";

const ARTICLE_TYPES = [
  { value: "news", label: "News", icon: Newspaper },
  { value: "manual", label: "Manual", icon: BookOpen },
  { value: "blog", label: "Blog", icon: Lightbulb },
];

type ArticleWrapperProps = {
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => void;
  formData: FormData;
  handleTypeSelect: (value: string) => void;
};

const ArticleFormWrapper = ({
  formData,
  handleChange,
  handleTypeSelect,
}: ArticleWrapperProps) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedType = ARTICLE_TYPES.find(
    (t) => t.value === formData.articleType,
  );

  const wordCount = formData.articleContent.trim()
    ? formData.articleContent.trim().split(/\s+/).length
    : 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="divide-y divide-neutral-100 dark:divide-neutral-800 dark:border-neutral-800">
      {/* Title */}
      <div className="py-4">
        <label className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          <Type className="h-3.5 w-3.5" />
          Title
        </label>
        <input
          name="articleTitle"
          type="text"
          value={formData.articleTitle}
          onChange={handleChange}
          placeholder="Give your article a compelling title…"
          required
          className="w-full bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-300 dark:text-neutral-100 dark:placeholder:text-neutral-600"
        />
      </div>

      {/* Subtitle */}
      <div className="py-4">
        <label className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          <Subtitles className="h-3.5 w-3.5" />
          Subtitle
        </label>
        <input
          name="articleSubtitle"
          type="text"
          value={formData.articleSubtitle}
          onChange={handleChange}
          placeholder="A short supporting line…"
          required
          className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-300 dark:text-neutral-100 dark:placeholder:text-neutral-600"
        />
      </div>

      {/* Article Type */}
      <div className="py-4">
        <label className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          <FileTypeCorner className="h-3.5 w-3.5" />
          Article Type
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
              formData.articleType
                ? "border-transparent bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                : "border-neutral-200 bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-700/40"
            } `}
          >
            {selectedType ? (
              <>
                <selectedType.icon className="h-4 w-4" />
                {selectedType.label}
              </>
            ) : (
              "Select a type"
            )}
            <ChevronDown
              className={`ml-1 h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="animate-in fade-in slide-in-from-top-1 absolute left-0 z-20 mt-2 min-w-45 space-y-1 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg duration-150 dark:border-neutral-700 dark:bg-neutral-900">
              {ARTICLE_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    handleTypeSelect(value);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-colors duration-100 ${
                    formData.articleType === value
                      ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  } `}
                >
                  <Icon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="py-4">
        <label className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          <Library className="h-3.5 w-3.5" />
          Content
        </label>
        {/* Where we put our custom MD editor */}
        <MdEditor value={formData.articleContent} onChange={handleChange} />

        {/* Word count / read time */}
        {wordCount > 0 && (
          <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
            <span>{wordCount.toLocaleString()} words</span>
            <span className="inline-block h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span>~{readTime} min read</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleFormWrapper;
