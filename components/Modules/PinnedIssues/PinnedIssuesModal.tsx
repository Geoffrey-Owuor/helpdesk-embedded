"use client";

import { MapPinX } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { PinnedIssue } from "@/store/usePinnedIssuesStore";
import PinnedIssueListItem from "./PinnedIssueListItem";
import { Modal, ModalBody, ModalHeader } from "../Modal/Modal";

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
  return (
    <Modal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      size="2xl"
      dismissible
    >
      <ModalHeader title="Pinned Issues" />

      {/* Body */}
      <ModalBody padded={false}>
        {pinnedIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-neutral-500">
            <div className="rounded-full bg-blue-500/10 p-4">
              <MapPinX className="h-12 w-12 text-blue-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold">No pinned issues yet</p>
            <p className="max-w-xs text-center text-xs">
              Pin an issue from its card, table row, or details page to check on
              it later
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
      </ModalBody>
    </Modal>
  );
};

export default PinnedIssuesModal;
