"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { ArticlesCardValues } from "@/serverActions/GetUserArticles";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import ArticleFormWrapper from "./ArticleFormWrapper";
import { PenTool } from "lucide-react";
import { FormData } from "./PostArticle";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
} from "../Modal/Modal";

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
                article_updated_at: new Date().toISOString(),
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
    <Modal open={isModalOpen} onClose={closeModal} size="4xl">
      <ModalHeader
        title="Manage Your Article"
        description="Edit your article title, subtitle & content"
        className="bg-neutral-50 dark:bg-neutral-900/50"
      />

      {/* Content Area */}
      <ModalForm autoComplete="off" onSubmit={handleConfirmSubmit}>
        <ModalBody>
          {/* Article form wrapper */}
          <ArticleFormWrapper
            formData={formData}
            handleChange={handleChange}
            handleTypeSelect={handleTypeSelect}
          />
        </ModalBody>

        {/* Footer/Submit */}
        <ModalFooter stretch={false} className="justify-between gap-4">
          <p className="text-xs text-red-500">**All fields are required**</p>
          <button
            type="submit"
            disabled={updating}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-neutral-100 transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <PenTool className="h-4 w-4" />
            Update Article
          </button>
        </ModalFooter>
      </ModalForm>
    </Modal>
  );
};

export default ArticleEditModal;
