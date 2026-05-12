"use client";
import ClientPortal from "../ClientPortal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssueValueTypes } from "@/public/assets";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { FormEvent, useRef, useState } from "react";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { BookmarkCheck, MessageSquareText, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

type ReopenIssueModalProps = {
  uuid: string;
  closeModal: () => void;
  isModalOpen: boolean;
  activeQueryKey: (string | boolean)[];
  activeCardsKey: (string | boolean)[];
};

const ReopenIssueModal = ({
  uuid,
  closeModal,
  isModalOpen,
  activeQueryKey,
  activeCardsKey,
}: ReopenIssueModalProps) => {
  const queryClient = useQueryClient();

  const { username } = useUser();

  const modalRef = useRef<HTMLDivElement | null>(null);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  useFocusTrapping(modalRef, isModalOpen, closeModal);

  const [reason, setReason] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    reopenIssue();
  };

  const { mutate: reopenIssue, isPending } = useMutation({
    mutationFn: () => apiClient.put("/reopen-issue", { uuid, reason }),
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
                  issue_updated_at: new Date().toISOString(),
                  issue_created_at: new Date().toISOString(),
                  issue_reopened_reason: reason,
                  issue_reopened: "Yes",
                  issue_status: "open",
                  issue_reopener_name: username,
                  issue_reopened_date: new Date().toISOString(),
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

  if (!isModalOpen) return null;

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 bg-black/50 transition-opacity dark:bg-black/60" />

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
                Reopen Issue
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Reopen a closed issue for some reason
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
              <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <BookmarkCheck className="h-4 w-4 shrink-0 text-neutral-400" />
                Status
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/30">
                <IssueStatusFormatter status="open" />
              </div>
            </div>

            {/* Reason Text Area */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reason"
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                <MessageSquareText className="h-3.5 w-3.5 text-neutral-400" />
                Reopen Reason
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add a reason for reopening this issue..."
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
                disabled={isPending || !reason.trim()}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
              >
                {isPending ? "Reopening…" : "Reopen Issue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ClientPortal>
  );
};

export default ReopenIssueModal;
