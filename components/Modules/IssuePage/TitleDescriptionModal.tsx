"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { useAlertStore } from "@/store/useAlertStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import apiClient from "@/lib/AxiosClient";
import { IssueValueTypes } from "@/lib/assets";
import FormAsterisk from "../FormAsterisk";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { IssueDetail } from "@/queries/fetchIssue";
import { invalidateIssuesCaches } from "@/utils/invalidateIssuesCaches";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
} from "../Modal/Modal";

type Payload = {
  uuid: string;
  issue_title: IssueValueTypes;
  issue_description: IssueValueTypes;
};

type TitleDescriptionModalProps = {
  title: IssueValueTypes;
  description: IssueValueTypes;
  uuid: string;
  isModalOpen: boolean;
  closeModal: () => void;
};
const TitleDescriptionModal = ({
  title,
  description,
  uuid,
  isModalOpen,
  closeModal,
}: TitleDescriptionModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    issue_title: title || "",
    issue_description: description || "",
  });
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  // state data
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const { mutate: updateIssueMutation, isPending: isUpdating } = useMutation({
    mutationFn: (payload: Payload) =>
      apiClient.put("/update-issueinfo", payload),

    onSuccess: (response, payload) => {
      // 1. Update cache only after confirmed API success
      queryClient.setQueryData(
        ["issue", uuid],
        (old: IssueDetail | undefined) =>
          old
            ? {
                ...old,
                issue_title: payload.issue_title,
                issue_description: payload.issue_description,
                issue_updated_at: new Date().toISOString(),
              }
            : old,
      );

      // Hide overlay on success
      hideOverlay();

      closeModal();

      triggerAlert("success", response.data.message);
    },

    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
    onSettled: () => {
      invalidateIssuesCaches(queryClient, { uuid });
    },
  });

  // Simplified handleSubmit
  const handleSubmit = async () => {
    const payload = { ...formData, uuid };
    hideDialog();
    showOverlay("Updating");
    updateIssueMutation(payload);
  };

  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();
    triggerDialog({
      title: "Update Issue Info",
      description: "Confirm the changes made.",
      onConfirm: handleSubmit,
    });
  };

  return (
    <Modal open={isModalOpen} onClose={closeModal} size="lg" tone="muted">
      <ModalHeader title="Update Title & Description" />

      <ModalForm onSubmit={handleConfirmSubmit}>
        <ModalBody className="space-y-6">
          {/* Issue Title */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="issue_title"
              className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
            >
              <span>Issue Title</span>
              <FormAsterisk />
            </label>
            <input
              type="text"
              name="issue_title"
              id="issue_title"
              value={formData.issue_title}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              maxLength={50}
              placeholder="Brief summary of the issue (50 characters maximum)"
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Issue Description */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="issue_description"
              className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
            >
              <span>Description</span>
              <FormAsterisk />
            </label>
            <textarea
              id="issue_description"
              name="issue_description"
              value={formData.issue_description}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              rows={6}
              placeholder="Please describe the issue in detail..."
              className="default-scrollbar rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
        </ModalBody>

        {/* Update button */}
        <ModalFooter>
          <button
            type="submit"
            disabled={
              isUpdating ||
              !formData.issue_description ||
              !formData.issue_title ||
              (formData.issue_description === description &&
                formData.issue_title === title)
            }
            className="w-full rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none disabled:opacity-60 sm:w-full dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus:ring-offset-neutral-900"
          >
            Update
          </button>
        </ModalFooter>
      </ModalForm>
    </Modal>
  );
};

export default TitleDescriptionModal;
