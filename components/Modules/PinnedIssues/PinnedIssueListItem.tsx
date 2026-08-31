"use client";

import { PinOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";
import { useLoadingStore } from "@/store/useLoadingStore";
import { useAlertStore } from "@/store/useAlertStore";
import {
  usePinnedIssuesStore,
  PinnedIssue,
} from "@/store/usePinnedIssuesStore";
import { titleHelper } from "@/public/assets";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import IssuePriorityFormatter from "../IssuesData/IssuePriorityFormatter";

type PinnedIssueListItemProps = {
  issue: PinnedIssue;
  // Called right before navigating, e.g. so a hosting modal can close itself first
  onBeforeNavigate?: () => void;
};

const PinnedIssueListItem = ({
  issue,
  onBeforeNavigate,
}: PinnedIssueListItemProps) => {
  const router = useRouter();
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const unpinIssue = usePinnedIssuesStore((state) => state.unpinIssue);

  const handleNavigate = () => {
    onBeforeNavigate?.();
    setLoadingLine(true);
    router.push(
      `/dashboard/${issue.issue_uuid}?title=${encodeURIComponent(issue.issue_title)}&description=${encodeURIComponent(issue.issue_description)}`,
    );
  };

  const handleUnpin = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    unpinIssue(issue.issue_uuid);
    triggerAlert("success", "Issue unpinned");
  };

  return (
    <li
      onClick={handleNavigate}
      className="flex cursor-pointer items-start gap-3 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
            {issue.issue_reference_id}
          </span>
          <IssueStatusFormatter status={issue.issue_status} />
          <IssuePriorityFormatter priority={issue.issue_priority} />
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
        onClick={handleUnpin}
        title="Unpin issue"
        className="shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-red-400"
      >
        <PinOff className="h-4 w-4" />
      </button>
    </li>
  );
};

export default PinnedIssueListItem;
