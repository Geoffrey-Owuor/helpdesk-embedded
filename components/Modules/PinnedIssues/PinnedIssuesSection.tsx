"use client";

import { Pin } from "lucide-react";
import { usePinnedIssuesStore } from "@/store/usePinnedIssuesStore";
import PinnedIssueListItem from "./PinnedIssueListItem";

const PinnedIssuesSection = () => {
  const pinnedIssues = usePinnedIssuesStore((state) => state.pinnedIssues);

  if (pinnedIssues.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Pin className="h-4 w-4 text-amber-500" fill="currentColor" />
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Pinned Issues
        </span>
        <span className="text-xs text-neutral-500">
          ({pinnedIssues.length})
        </span>
      </div>
      <ul className="layout-scrollbar max-h-96 divide-y divide-neutral-100 overflow-y-auto rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800/60 dark:border-neutral-800 dark:bg-neutral-950">
        {pinnedIssues.map((issue) => (
          <PinnedIssueListItem key={issue.issue_uuid} issue={issue} />
        ))}
      </ul>
    </div>
  );
};

export default PinnedIssuesSection;
