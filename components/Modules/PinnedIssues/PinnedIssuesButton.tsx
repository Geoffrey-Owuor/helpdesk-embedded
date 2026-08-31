"use client";

import { useState } from "react";
import { Pin } from "lucide-react";
import { usePinnedIssuesStore } from "@/store/usePinnedIssuesStore";
import PinnedIssuesModal from "./PinnedIssuesModal";

const PinnedIssuesButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pinnedIssues = usePinnedIssuesStore((state) => state.pinnedIssues);

  return (
    <>
      {isModalOpen && (
        <PinnedIssuesModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          pinnedIssues={pinnedIssues}
        />
      )}
      <button
        onClick={() => setIsModalOpen(true)}
        title="Pinned issues"
        className="pin-btn relative inline-flex items-center justify-center rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Pin className="pin-icon h-5 w-5" />

        {pinnedIssues.length > 0 && (
          <span className="absolute right-0.5 bottom-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] leading-none font-semibold tracking-tighter text-white">
            {pinnedIssues.length > 9 ? "9+" : pinnedIssues.length}
          </span>
        )}
      </button>
    </>
  );
};

export default PinnedIssuesButton;
