"use client";

import { FormEvent, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import ClientPortal from "../ClientPortal";
import DocumentUpload from "../IssueModals/DocumentUpload";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssueValueTypes } from "@/public/assets";

type AddAttachmentModalProps = {
  uuid: string;
  isModalOpen: boolean;
  closeModal: () => void;
  activeQueryKey: (string | boolean)[];
};

const AddAttachmentModal = ({
  uuid,
  isModalOpen,
  closeModal,
  activeQueryKey,
}: AddAttachmentModalProps) => {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);

  // Focus Trapping
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isModalOpen, closeModal);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  const { mutate: addAttachments, isPending } = useMutation({
    mutationFn: (uploadFiles: File[]) => {
      const submitData = new FormData();
      uploadFiles.forEach((file) => submitData.append("attachments", file));

      return apiClient.post(`/attachments/${uuid}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    onSuccess: (response, uploadFiles) => {
      // Keeps the attachments indicator on the issues table/cards in sync
      // without refetching the whole dashboard list
      queryClient.setQueryData(
        activeQueryKey,
        (oldData: Record<string, IssueValueTypes>[]) => {
          if (!oldData) return oldData;

          return oldData.map((issue: Record<string, IssueValueTypes>) =>
            issue.issue_uuid === uuid
              ? {
                  ...issue,
                  attachments_count:
                    Number(issue.attachments_count ?? 0) + uploadFiles.length,
                  issue_updated_at: new Date().toISOString(),
                }
              : issue,
          );
        },
      );

      // Refetch the attachments viewer on this page
      queryClient.invalidateQueries({ queryKey: ["issueAttachments", uuid] });

      hideOverlay();
      setFiles([]);
      closeModal();

      triggerAlert("success", response.data.message);
    },

    onError: (error) => {
      hideOverlay();
      triggerAlert("error", getApiErrorMessage(error));
    },
  });

  const handleSubmit = async () => {
    hideDialog();
    showOverlay("Adding");
    addAttachments(files);
  };

  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      triggerAlert("error", "Select at least one file to attach");
      return;
    }

    triggerDialog({
      title: "Add Attachment",
      description: `Confirm adding ${files.length} file${files.length > 1 ? "s" : ""} to this issue.`,
      onConfirm: handleSubmit,
    });
  };

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80">
        {/* Modal Container */}
        <div
          ref={modalRef}
          className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Add Attachment
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Attach additional files to this issue.
              </p>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleConfirmSubmit} className="space-y-6">
            <DocumentUpload
              files={files}
              setFiles={setFiles}
              maxTotalSizeMB={2}
            />

            <button
              type="submit"
              disabled={files.length === 0 || isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400 dark:focus:ring-offset-neutral-900"
            >
              <Paperclip className="h-4 w-4" />
              Add Attachment
            </button>
          </form>
        </div>
      </div>
    </ClientPortal>
  );
};

export default AddAttachmentModal;
