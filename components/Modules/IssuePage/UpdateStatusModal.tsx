"use client";

import ClientPortal from "../ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useRef, useState, useEffect } from "react";
import { X, MessageSquareText, BookmarkCheck, Lightbulb } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import { IssueValueTypes } from "@/public/assets";

type UpdateStatusModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  uuid: string;
  selectedStatus: string;
  activeQueryKey: (string | boolean)[];
  activeCardsKey: (string | boolean)[];
};

const UpdateStatusModal = ({
  isOpen,
  closeModal,
  uuid,
  selectedStatus,
  activeQueryKey,
  activeCardsKey,
}: UpdateStatusModalProps) => {
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  const [remarks, setRemarks] = useState(`Issue ${selectedStatus}`);

  // Sync default value whenever the selected status changes
  useEffect(() => {
    Promise.resolve().then(() => setRemarks(`Issue ${selectedStatus}`));
  }, [selectedStatus]);

  useFocusTrapping(modalRef, isOpen, closeModal);

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: () =>
      apiClient.put("/update-status", {
        uuid,
        status: selectedStatus,
        remarks,
      }),
    onMutate: () => showOverlay("Updating"),
    onSuccess: (response) => {
      queryClient.setQueryData(
        activeQueryKey,
        (oldData: Record<string, IssueValueTypes>[]) => {
          if (!oldData) return oldData;
          return oldData.map((issue) =>
            issue.issue_uuid === uuid
              ? {
                  ...issue,
                  issue_status: selectedStatus,
                  issue_remarks: remarks,
                  issue_updated_at: new Date().toISOString(),
                  issue_date_resolved:
                    selectedStatus === "resolved"
                      ? new Date().toISOString()
                      : issue.issue_date_resolved,
                  issue_date_closed:
                    selectedStatus === "closed"
                      ? new Date().toISOString()
                      : issue.issue_date_closed,
                }
              : issue,
          );
        },
      );

      closeModal();
      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      triggerAlert("error", getApiErrorMessage(error));
    },
    onSettled: () => {
      hideOverlay();
      queryClient.invalidateQueries({ queryKey: activeCardsKey });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatus();
  };

  if (!isOpen) return null;

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 transition-opacity dark:bg-black/80" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
      >
        <div className="flex w-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Update Status
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Add optional remarks before confirming
              </p>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-6 py-5"
          >
            {/* Selected status preview */}
            <div className="flex flex-col gap-1.5">
              {selectedStatus === "closed" && (
                <span className="mb-1.5 inline-flex items-center gap-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                  Only close an issue if it&apos;s already been resolved or is
                  no longer relevant.
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <BookmarkCheck className="h-4 w-4 shrink-0 text-neutral-400" />
                Selected Status
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/30">
                <IssueStatusFormatter status={selectedStatus} />
              </div>
            </div>

            {/* Remarks textarea */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="remarks"
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                <MessageSquareText className="h-3.5 w-3.5 text-neutral-400" />
                Agent Remarks
              </label>
              <textarea
                id="remarks"
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add a remark..."
                required
                className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              />
            </div>

            {/* Footer */}
            <div className="mt-1 flex items-center justify-end gap-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !remarks.trim()}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
              >
                {isPending ? "Updating…" : "Update Status"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ClientPortal>
  );
};

export default UpdateStatusModal;
