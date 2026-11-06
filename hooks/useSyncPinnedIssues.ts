"use client";
import { useEffect } from "react";
import { usePinnedIssuesHydrated } from "@/hooks/usePinnedIssuesHydrated";
import { PinnedIssue, usePinnedIssuesStore } from "@/store/usePinnedIssuesStore";

// Keeps pinned issues in step with issue data the page just loaded. Waits for
// the stored pins to load, or there would be nothing to update yet.
export const useSyncPinnedIssues = (
  issues: Pick<PinnedIssue, "issue_uuid">[] | undefined,
) => {
  const hydrated = usePinnedIssuesHydrated();
  const syncPinnedIssues = usePinnedIssuesStore(
    (state) => state.syncPinnedIssues,
  );

  useEffect(() => {
    if (hydrated && issues) syncPinnedIssues(issues);
  }, [hydrated, issues, syncPinnedIssues]);
};
