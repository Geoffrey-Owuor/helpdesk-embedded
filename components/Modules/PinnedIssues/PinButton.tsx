"use client";

import { MouseEvent } from "react";
import { Pin } from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";
import { usePinnedIssuesStore, PinnedIssue } from "@/store/usePinnedIssuesStore";

type PinButtonProps = {
  issue: PinnedIssue;
  size?: number;
  className?: string;
  showLabel?: boolean;
  /**
   * Hide the button until the closest `group` ancestor is hovered (or the
   * button is focused). Pinned issues always stay visible so the pin state is
   * never hidden. Ignored when `showLabel` is set.
   */
  revealOnHover?: boolean;
};

const PinButton = ({
  issue,
  size = 16,
  className = "",
  showLabel = false,
  revealOnHover = false,
}: PinButtonProps) => {
  const isPinned = usePinnedIssuesStore((state) =>
    state.pinnedIssues.some((p) => p.issue_uuid === issue.issue_uuid),
  );
  const pinIssue = usePinnedIssuesStore((state) => state.pinIssue);
  const unpinIssue = usePinnedIssuesStore((state) => state.unpinIssue);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPinned) {
      unpinIssue(issue.issue_uuid);
      triggerAlert("success", "Issue unpinned");
      return;
    }

    const evictedOldestPin = pinIssue(issue);
    triggerAlert(
      "success",
      evictedOldestPin
        ? "Issue pinned. Your oldest pin was removed to stay within the 20-pin limit."
        : "Issue pinned successfully",
    );
  };

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isPinned}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white transition-colors ${
          isPinned
            ? "bg-amber-600 hover:bg-amber-700"
            : "bg-neutral-700 hover:bg-neutral-600"
        } ${className}`}
      >
        <Pin size={12} fill={isPinned ? "currentColor" : "none"} />
        {isPinned ? "Pinned" : "Pin"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isPinned ? "Unpin issue" : "Pin issue"}
      aria-pressed={isPinned}
      className={`shrink-0 rounded-full p-1.5 transition-colors ${
        isPinned
          ? "text-amber-500 hover:text-amber-600 dark:text-amber-400"
          : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
      } ${
        revealOnHover && !isPinned
          ? "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
          : ""
      } ${className}`}
    >
      <Pin size={size} fill={isPinned ? "currentColor" : "none"} />
    </button>
  );
};

export default PinButton;
