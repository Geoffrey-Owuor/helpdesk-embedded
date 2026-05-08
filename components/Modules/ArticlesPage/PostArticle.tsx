"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetArticleKey } from "@/serverActions/GetArticleKey";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import ArticleFormWrapper from "./ArticleFormWrapper";
import {
  Send,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
  RotateCcw,
} from "lucide-react";

export interface FormData {
  articleKey: string;
  articleTitle: string;
  articleSubtitle: string;
  articleType: string;
  articleContent: string;
}

const InitialFormState: FormData = {
  articleKey: "",
  articleTitle: "",
  articleSubtitle: "",
  articleType: "",
  articleContent: "",
};

const PostArticle = () => {
  const queryClient = useQueryClient();

  // Fetch the article key from the database
  const {
    data: VALID_KEY = "fall_back_key",
    isPending: fetching,
    refetch: refetchKey,
  } = useQuery({
    queryKey: ["ArticleKeyData"],
    queryFn: GetArticleKey,
    staleTime: 1000 * 60 * 30,
  });

  const [formData, setFormData] = useState<FormData>(InitialFormState);

  const keyIsInvalid =
    formData.articleKey.length > 0 && formData.articleKey !== VALID_KEY;
  const keyIsValid = formData.articleKey === VALID_KEY;

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, articleType: value }));
  };

  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();
    triggerDialog({
      title: "Publish Article",
      description: "Confirm publishing of this article",
      onConfirm: handleSubmit,
    });
  };

  const handleSubmit = async () => {
    hideDialog();
    const readTime = `${Math.ceil(formData.articleContent.split(/\s+/).length / 200)} min read`;

    // Our trimmed formData
    const trimmedData: FormData = {
      ...formData,
      articleTitle: formData.articleTitle.trim(),
      articleSubtitle: formData.articleSubtitle.trim(),
      articleContent: formData.articleContent.trim(),
    };
    postBlogMutation({ formData: trimmedData, readTime });
  };

  const { mutate: postBlogMutation, isPending: loading } = useMutation({
    mutationFn: async ({
      formData,
      readTime,
    }: {
      formData: FormData;
      readTime: string;
    }) => apiClient.post("/post-article", { formData, readTime }),
    onMutate: () => showOverlay("Adding"),
    onSuccess: (response) => {
      hideOverlay();

      // Clearing the formData
      setFormData(InitialFormState);

      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["UserArticlesInfo"] }),
  });

  return (
    <div>
      {/* SubText + Article Key */}
      <div className="mb-3">
        <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
          Fill in the details below to publish your article.
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
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
                  fetching
                    ? "Loading, please wait..."
                    : "Enter a valid article key..."
                }
                className="text-neutral-900 outline-none placeholder:text-neutral-300 disabled:cursor-not-allowed dark:text-neutral-100 dark:placeholder:text-neutral-600"
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
              <span>Refetch Key</span>
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
      <form onSubmit={handleConfirmSubmit} autoComplete="off">
        {/* Form Wrapper */}
        <ArticleFormWrapper
          formData={formData}
          handleChange={handleChange}
          handleTypeSelect={handleTypeSelect}
        />

        {/* Footer / Submit */}
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-red-500">**All fields are required**</p>
          <button
            type="submit"
            disabled={loading || keyIsInvalid || !formData.articleKey}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-neutral-100 transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Send className="h-4 w-4" />
            Publish Article
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostArticle;
