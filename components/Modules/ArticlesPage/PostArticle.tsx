"use client";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetArticleKey } from "@/serverActions/GetArticleKey";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import {
  ChevronDown,
  Newspaper,
  BookOpen,
  Lightbulb,
  Send,
  Type,
  Subtitles,
  Library,
  FileTypeCorner,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
  RotateCcw,
} from "lucide-react";

type FormData = {
  articleKey: string;
  articleTitle: string;
  articleSubtitle: string;
  articleType: string;
  articleContent: string;
};

const ARTICLE_TYPES = [
  { value: "news", label: "News", icon: Newspaper },
  { value: "manual", label: "Manual", icon: BookOpen },
  { value: "blog", label: "Blog", icon: Lightbulb },
];

const PostArticle = () => {
  // Fetch the article key from the database
  const {
    data: VALID_KEY = "",
    isPending: fetching,
    refetch: refetchKey,
  } = useQuery({
    queryKey: ["ArticleKeyData"],
    queryFn: GetArticleKey,
  });

  const [formData, setFormData] = useState<FormData>({
    articleKey: "",
    articleTitle: "",
    articleSubtitle: "",
    articleType: "",
    articleContent: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const keyIsInvalid =
    formData.articleKey.length > 0 && formData.articleKey !== VALID_KEY;
  const keyIsValid = formData.articleKey === VALID_KEY;

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, articleType: value }));
    setDropdownOpen(false);
  };

  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();
    triggerDialog({
      title: "Post Article",
      description: "Confirm posting of this article",
      onConfirm: handleSubmit,
    });
  };

  const handleSubmit = async () => {
    hideDialog();
    const readTime = `${Math.ceil(formData.articleContent.split(" ").length / 200)} min read`;
    postBlogMutation({ formData, readTime });
  };

  const { mutate: postBlogMutation, isPending: loading } = useMutation({
    mutationFn: async ({
      formData,
      readTime,
    }: {
      formData: FormData;
      readTime: string;
    }) => apiClient.post("/postarticle", { formData, readTime }),
    onMutate: () => showOverlay("Adding"),
    onSuccess: (response) => {
      hideOverlay();
      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
  });

  const selectedType = ARTICLE_TYPES.find(
    (t) => t.value === formData.articleType,
  );
  const wordCount = formData.articleContent.trim()
    ? formData.articleContent.trim().split(/\s+/).length
    : 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="">
      {/* SubText + Article Key */}
      <div className="mb-3">
        <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
          Fill in the details below to publish your article.
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className={`flex w-fit min-w-60 items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-colors duration-150 dark:bg-neutral-900/60 ${
                keyIsInvalid
                  ? "border-red-400 dark:border-red-500"
                  : keyIsValid
                    ? "border-green-500 dark:border-green-400"
                    : "border-neutral-200 dark:border-neutral-800"
              } `}
            >
              <KeyRound
                className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                  keyIsInvalid
                    ? "text-red-400 dark:text-red-500"
                    : keyIsValid
                      ? "text-green-500 dark:text-green-400"
                      : "text-neutral-400 dark:text-neutral-500"
                }`}
              />
              <input
                type="text"
                name="articleKey"
                disabled={fetching}
                value={formData.articleKey}
                onChange={handleChange}
                placeholder={
                  fetching ? "loading input..." : "Enter a valid article key..."
                }
                className="text-neutral-900 outline-none placeholder:text-neutral-300 disabled:cursor-none dark:text-neutral-100 dark:placeholder:text-neutral-600"
              />
              {keyIsValid && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 dark:text-green-400" />
              )}
            </div>
            {/* Refresh button */}
            <button
              type="button"
              onClick={() => refetchKey()}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3.5 py-2.5 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:flex">Refetch Key</span>
            </button>
          </div>
          {keyIsInvalid && (
            <p className="flex items-center gap-1.5 pl-1 text-xs text-red-500 dark:text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" /> Invalid article key.
            </p>
          )}
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleConfirmSubmit}
        autoComplete="off"
        className="divide-y divide-neutral-100 dark:divide-neutral-800 dark:border-neutral-800"
      >
        {/* Title */}
        <div className="py-5">
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
            className="w-full bg-transparent text-base font-medium text-neutral-900 outline-none placeholder:text-neutral-300 dark:text-neutral-100 dark:placeholder:text-neutral-600"
          />
        </div>

        {/* Subtitle */}
        <div className="py-5">
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
        <div className="py-5">
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
              <div className="animate-in fade-in slide-in-from-top-1 absolute left-0 z-20 mt-2 min-w-[180px] space-y-1 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg duration-150 dark:border-neutral-700 dark:bg-neutral-900">
                {ARTICLE_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleTypeSelect(value)}
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
        <div className="py-5">
          <label className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
            <Library className="h-3.5 w-3.5" />
            Content
          </label>
          {/* Where we put our custom MD editor */}
          <textarea
            name="articleContent"
            value={formData.articleContent}
            onChange={handleChange}
            placeholder="Write your article content here…"
            required
            rows={10}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-300 dark:text-neutral-100 dark:placeholder:text-neutral-600"
          />

          {/* Word count / read time */}
          {wordCount > 0 && (
            <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
              <span>{wordCount.toLocaleString()} words</span>
              <span className="inline-block h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span>~{readTime} min read</span>
            </div>
          )}
        </div>

        {/* Footer / Submit */}
        <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 px-6 py-4 dark:bg-neutral-900/50">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            All fields are required
          </p>
          <button
            type="submit"
            disabled={loading || keyIsInvalid}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-neutral-100 transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Send className="h-4 w-4" />
            {loading ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostArticle;
