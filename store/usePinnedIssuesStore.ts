import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PinnedIssue = {
  issue_uuid: string;
  issue_reference_id: string;
  issue_status: string;
  issue_priority: string;
  issue_title: string;
  issue_description: string;
};

// Oldest pin is evicted once this many issues are pinned at once
const MAX_PINNED_ISSUES = 20;

interface PinnedIssuesState {
  pinnedIssues: PinnedIssue[];
}

interface PinnedIssuesActions {
  // Returns true if pinning this issue evicted the oldest pin to stay within the cap
  pinIssue: (issue: PinnedIssue) => boolean;
  unpinIssue: (issue_uuid: string) => void;
}

export const usePinnedIssuesStore = create<
  PinnedIssuesState & PinnedIssuesActions
>()(
  persist(
    (set, get) => ({
      pinnedIssues: [],

      pinIssue: (issue) => {
        const { pinnedIssues } = get();
        if (pinnedIssues.some((p) => p.issue_uuid === issue.issue_uuid)) {
          return false;
        }

        const next = [issue, ...pinnedIssues];
        const evicted = next.length > MAX_PINNED_ISSUES;
        set({
          pinnedIssues: evicted ? next.slice(0, MAX_PINNED_ISSUES) : next,
        });
        return evicted;
      },

      unpinIssue: (issue_uuid) =>
        set((state) => ({
          pinnedIssues: state.pinnedIssues.filter(
            (p) => p.issue_uuid !== issue_uuid,
          ),
        })),
    }),
    {
      name: "HelpDesk-pinned-issues-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ pinnedIssues: state.pinnedIssues }),
    },
  ),
);
