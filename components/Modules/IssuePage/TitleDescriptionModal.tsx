"use client";
import { ChangeEvent, FormEvent, useState, useRef } from "react";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useAlertStore } from "@/store/useAlertStore";
import ClientPortal from "../ClientPortal";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import apiClient from "@/lib/AxiosClient";
import { X } from "lucide-react";
import { IssueValueTypes } from "@/public/assets";
import FormAsterisk from "../FormAsterisk";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type Payload = {
  uuid: string;
  userId: IssueValueTypes;
  issue_title: IssueValueTypes;
  issue_description: IssueValueTypes;
};

type TitleDescriptionModalProps = {
  title: IssueValueTypes;
  description: IssueValueTypes;
  uuid: string;
  activeQueryKey: (string | boolean)[];
  userId: IssueValueTypes;
  isModalOpen: boolean;
  closeModal: () => void;
};
const TitleDescriptionModal = ({
  title,
  description,
  uuid,
  activeQueryKey,
  userId,
  isModalOpen,
  closeModal,
}: TitleDescriptionModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    issue_title: title || "",
    issue_description: description || "",
  });

  // Focus Trapping
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isModalOpen, closeModal);

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
        activeQueryKey,
        (oldData: Record<string, IssueValueTypes>[]) => {
          if (!oldData) return oldData;
          return oldData.map((issue: Record<string, IssueValueTypes>) =>
            issue.issue_uuid === payload.uuid
              ? {
                  ...issue,
                  issue_title: payload.issue_title,
                  issue_description: payload.issue_description,
                  issue_updated_at: new Date().toISOString(),
                }
              : issue,
          );
        },
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
  });

  // Simplified handleSubmit
  const handleSubmit = async () => {
    const payload = { ...formData, uuid, userId };
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
    <ClientPortal>
      {/* Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/60">
        {/* Modal Container */}
        <div
          ref={modalRef}
          className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Update Title & Description
            </h2>
            <button
              onClick={closeModal}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Update Form */}
          <form onSubmit={handleConfirmSubmit} className="space-y-6">
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
                rows={4}
                placeholder="Please describe the issue in detail..."
                className="resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>

            {/* Update button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isUpdating ||
                  !formData.issue_description ||
                  !formData.issue_title ||
                  (formData.issue_description === description &&
                    formData.issue_title === title)
                }
                className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-neutral-900"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </ClientPortal>
  );
};

export default TitleDescriptionModal;
