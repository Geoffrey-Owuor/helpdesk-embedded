"use client";

import { X, MapPinX } from "lucide-react";
import { Dispatch, SetStateAction, useRef } from "react";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { PinnedIssue } from "@/store/usePinnedIssuesStore";
import PinnedIssueListItem from "./PinnedIssueListItem";

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
                <PinnedIssueListItem
                  key={issue.issue_uuid}
                  issue={issue}
                  onBeforeNavigate={() => setIsModalOpen(false)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinnedIssuesModal;
