"use client";

import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useState, useEffect } from "react";
import {
  MessageSquareText,
  BookmarkCheck,
  Lightbulb,
  CircleSlash,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import { IssueDetail } from "@/queries/fetchIssue";
import { invalidateIssuesCaches } from "@/utils/invalidateIssuesCaches";
import { CLOSE_REASONS, CloseReason } from "@/lib/issues/closeReasons";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
} from "../Modal/Modal";

type UpdateStatusModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  uuid: string;
  selectedStatus: string;
  currentStatus: string;
};

const UpdateStatusModal = ({
  isOpen,
  closeModal,
  uuid,
  selectedStatus,
  currentStatus,
}: UpdateStatusModalProps) => {
  const queryClient = useQueryClient();
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  const [remarks, setRemarks] = useState(`Issue ${selectedStatus}`);
  const [closeReason, setCloseReason] = useState<CloseReason | null>(null);

  // Closing an issue that wasn't resolved first needs a reason (the server
  // checks the same rule)
  const isPrematureClose =
    selectedStatus === "closed" && currentStatus !== "resolved";

  // Sync default value whenever the selected status changes
  useEffect(() => {
    Promise.resolve().then(() => setRemarks(`Issue ${selectedStatus}`));
  }, [selectedStatus]);
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: () =>
      apiClient.put("/update-status", {
        uuid,
        status: selectedStatus,
        remarks,
        closeReason: isPrematureClose ? closeReason : undefined,
      }),
    onMutate: () => showOverlay("Updating"),
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["issue", uuid],
        (old: IssueDetail | undefined) =>
          old
            ? {
                ...old,
                issue_status: selectedStatus,
                issue_remarks: remarks,
                issue_updated_at: new Date().toISOString(),
                issue_date_resolved:
                  selectedStatus === "resolved" || isPrematureClose
                    ? new Date().toISOString()
                    : old.issue_date_resolved,
                issue_date_closed:
                  selectedStatus === "closed"
                    ? new Date().toISOString()
                    : old.issue_date_closed,
                issue_close_reason:
                  selectedStatus === "closed"
                    ? isPrematureClose
                      ? closeReason
                      : null
                    : old.issue_close_reason,
              }
            : old,
      );

      closeModal();
      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      triggerAlert("error", getApiErrorMessage(error));
    },
    onSettled: () => {
      hideOverlay();
      invalidateIssuesCaches(queryClient, { uuid });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatus();
  };

  return (
    <Modal open={isOpen} onClose={closeModal} variant="dialog" size="md">
      <ModalHeader
        title="Update Status"
        description="Add optional remarks before confirming"
      />

      <ModalForm onSubmit={handleSubmit}>
        <ModalBody className="flex flex-col gap-4">
          {/* Selected status preview */}
          <div className="flex flex-col gap-1.5">
            {selectedStatus === "closed" && (
              <span className="mb-1.5 inline-flex items-center gap-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                Only close an issue if it&apos;s already been resolved or is no
                longer relevant.
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

          {/* Close reason - only for issues closed before being resolved */}
          {isPrematureClose && (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <CircleSlash className="h-3.5 w-3.5 text-neutral-400" />
                Why is this unresolved issue being closed?
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CLOSE_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 transition-colors hover:bg-neutral-50 has-checked:border-neutral-900 has-checked:bg-neutral-50 has-focus-visible:ring-2 has-focus-visible:ring-neutral-300 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900/50 dark:has-checked:border-neutral-300 dark:has-checked:bg-neutral-900 dark:has-focus-visible:ring-neutral-700"
                  >
                    <input
                      type="radio"
                      name="closeReason"
                      value={reason.value}
                      checked={closeReason === reason.value}
                      onChange={() => setCloseReason(reason.value)}
                      required
                      className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
                    />
                    {reason.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

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
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none sm:py-2 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isPending || !remarks.trim() || (isPrematureClose && !closeReason)
            }
            className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 sm:py-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
          >
            {isPending ? "Updating…" : "Update Status"}
          </button>
        </ModalFooter>
      </ModalForm>
    </Modal>
  );
};

export default UpdateStatusModal;
