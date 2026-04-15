"use client";
import ClientPortal from "../ClientPortal";
import { useRef, useState, ChangeEvent, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { ArticlesCardValues } from "@/serverActions/GetUserArticles";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import ArticleFormWrapper from "./ArticleFormWrapper";
import { PenTool, X } from "lucide-react";
import { FormData } from "./PostArticle";

type ArticleEditModalProps = {
  closeModal: () => void;
  isModalOpen: boolean;
  articleData: FormData;
};

const ArticleEditModal = ({
  closeModal,
  isModalOpen,
  articleData,
}: ArticleEditModalProps) => {
  const queryClient = useQueryClient();

  // Set the received formData
  const [formData, setFormData] = useState<FormData>(articleData);

  const modalRef = useRef<HTMLDivElement | null>(null);

  useFocusTrapping(modalRef, isModalOpen, closeModal);

  // Zustand States
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
      title: "Update Article info",
      description: "Confirm editing of this article",
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
    updateArticleMutation({ formData: trimmedData, readTime });
  };

  const { mutate: updateArticleMutation, isPending: updating } = useMutation({
    mutationFn: async ({
      formData,
      readTime,
    }: {
      formData: FormData;
      readTime: string;
    }) => apiClient.put("update-article", { formData, readTime }),
    onMutate: () => showOverlay("Updating"),
    onSuccess: (response, { formData, readTime }) => {
      queryClient.setQueryData(
        ["UserArticlesInfo"],
        (oldData: ArticlesCardValues[]) => {
          if (!oldData) return oldData;
          return oldData.map((article) => {
            if (article.article_id === formData.articleKey) {
              return {
                ...article,
                article_read_time: readTime,
                article_title: formData.articleTitle,
                article_subtitle: formData.articleSubtitle,
                article_type: formData.articleType,
                article_updated_at: new Date().toLocaleDateString(),
                article_content: formData.articleContent,
                can_edit: false,
              };
            }

            return article;
          });
        },
      );

      hideOverlay();
      closeModal();
      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
  });

  return (
    <ClientPortal>
      {/* The Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all dark:bg-black/60">
        <div
          ref={modalRef}
          className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Manage Your Article
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Edit your article title, subtitle & content
              </p>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="layout-scrollbar overflow-y-auto px-6 py-4">
            <form autoComplete="off" onSubmit={handleConfirmSubmit}>
              {/* Article form wrapper */}
              <ArticleFormWrapper
                formData={formData}
                handleChange={handleChange}
                handleTypeSelect={handleTypeSelect}
              />

              {/* Footer/Submit */}
              <div className="flex items-center justify-between py-4">
                <p className="text-xs text-neutral-400 dark:text-neutral-600">
                  **All fields are required**
                </p>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-neutral-100 transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                >
                  <PenTool className="h-4 w-4" />
                  Update Article
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default ArticleEditModal;
