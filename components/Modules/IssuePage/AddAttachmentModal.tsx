"use client";

import { FormEvent, useState } from "react";
import { Paperclip } from "lucide-react";
import DocumentUpload from "../IssueModals/DocumentUpload";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssueDetail } from "@/queries/fetchIssue";
import { invalidateIssuesCaches } from "@/utils/invalidateIssuesCaches";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
} from "../Modal/Modal";

type AddAttachmentModalProps = {
  uuid: string;
  isModalOpen: boolean;
  closeModal: () => void;
};

const AddAttachmentModal = ({
  uuid,
  isModalOpen,
  closeModal,
}: AddAttachmentModalProps) => {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
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
      // Keeps the attachments indicator on the issue page/list/cards in sync
      // without refetching the whole dashboard list
      queryClient.setQueryData(
        ["issue", uuid],
        (old: IssueDetail | undefined) =>
          old
            ? {
                ...old,
                attachments_count:
                  Number(old.attachments_count ?? 0) + uploadFiles.length,
                issue_updated_at: new Date().toISOString(),
              }
            : old,
      );

      // Refetch the attachments viewer on this page
      queryClient.invalidateQueries({ queryKey: ["issueAttachments", uuid] });
      invalidateIssuesCaches(queryClient, { uuid });

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
    <Modal open={isModalOpen} onClose={closeModal} size="lg" tone="muted">
      <ModalHeader
        title="Add Attachment"
        description="Attach additional files to this issue."
      />

      <ModalForm onSubmit={handleConfirmSubmit}>
        <ModalBody>
          <DocumentUpload
            files={files}
            setFiles={setFiles}
            maxTotalSizeMB={5}
          />
        </ModalBody>

        <ModalFooter>
          <button
            type="submit"
            disabled={files.length === 0 || isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 sm:w-full dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400 dark:focus:ring-offset-neutral-900"
          >
            <Paperclip className="h-4 w-4" />
            Add Attachment
          </button>
        </ModalFooter>
      </ModalForm>
    </Modal>
  );
};

export default AddAttachmentModal;
