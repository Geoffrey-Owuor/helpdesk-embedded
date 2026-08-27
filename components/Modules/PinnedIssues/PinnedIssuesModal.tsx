"use client";

import { X, PinOff, MapPinX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, MouseEvent, useRef } from "react";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useLoadingStore } from "@/store/useLoadingStore";
import { useAlertStore } from "@/store/useAlertStore";
import { usePinnedIssuesStore, PinnedIssue } from "@/store/usePinnedIssuesStore";
import { titleHelper } from "@/public/assets";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import IssuePriorityFormatter from "../IssuesData/IssuePriorityFormatter";

type PinnedIssuesModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  pinnedIssues: PinnedIssue[];
};

const PinnedIssuesModal = ({
  isModalOpen,
  setIsModalOpen,
  pinnedIssues,
}: PinnedIssuesModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isModalOpen, () => setIsModalOpen(false));

  const router = useRouter();
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const unpinIssue = usePinnedIssuesStore((state) => state.unpinIssue);

  const handleRouteChange = (issue: PinnedIssue) => {
    setIsModalOpen(false);
    setLoadingLine(true);
    router.push(
      `/dashboard/${issue.issue_uuid}?title=${encodeURIComponent(issue.issue_title)}&description=${encodeURIComponent(issue.issue_description)}`,
    );
  };

  const handleUnpin = (e: MouseEvent<HTMLButtonElement>, issue_uuid: string) => {
    e.stopPropagation();
    unpinIssue(issue_uuid);
    triggerAlert("success", "Issue unpinned");
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 transition-all dark:bg-black/80">
      <div
        ref={modalRef}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Pinned Issues
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="layout-scrollbar flex-1 overflow-y-auto">
          {pinnedIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-neutral-500">
              <div className="rounded-full bg-blue-500/10 p-4">
                <MapPinX
                  className="h-12 w-12 text-blue-400"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-sm font-semibold">No pinned issues yet</p>
              <p className="max-w-xs text-center text-xs">
                Pin an issue from its card, table row, or details page to
                check on it later
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {pinnedIssues.map((issue) => (
                <li
                  key={issue.issue_uuid}
                  onClick={() => handleRouteChange(issue)}
                  className="flex cursor-pointer items-start gap-3 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                        {issue.issue_reference_id}
                      </span>
                      <IssueStatusFormatter status={issue.issue_status} />
                      <IssuePriorityFormatter
                        priority={issue.issue_priority}
                        showText={false}
                      />
                    </div>
                    <p
                      title={titleHelper(issue.issue_title)}
                      className="line-clamp-1 text-sm font-semibold wrap-break-word text-neutral-800 dark:text-neutral-200"
                    >
                      {issue.issue_title}
                    </p>
                    {issue.issue_description && (
                      <p
                        title={titleHelper(issue.issue_description)}
                        className="mt-0.5 line-clamp-1 text-xs wrap-break-word text-neutral-500 dark:text-neutral-400"
                      >
                        {issue.issue_description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleUnpin(e, issue.issue_uuid)}
                    title="Unpin issue"
                    className="shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-red-400"
                  >
                    <PinOff className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinnedIssuesModal;
