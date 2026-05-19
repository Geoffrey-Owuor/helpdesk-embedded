"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import IssuesDocsSkeleton from "../Skeletons/IssuesDocsSkeleton";
import {
  ChevronRight,
  Lightbulb,
  Building2,
  AlertCircle,
  RotateCcw,
  TextAlignStart,
  Files,
} from "lucide-react";

import {
  fetchedIssuesDocs,
  IssueDoc,
  GroupedIssueDocs,
} from "@/serverActions/GetIssuesDocs";

type IssueListProps = {
  issues: IssueDoc[];
  expanded: number | null;
  setExpanded: Dispatch<SetStateAction<number | null>>;
};

// Helper component to render a list of issues
const IssueList = ({ issues, expanded, setExpanded }: IssueListProps) => (
  <div className="relative">
    <ol className="space-y-4">
      {issues.map((issue, index) => {
        const isOpen = expanded === issue.id;
        return (
          <li key={issue.id}>
            <button
              onClick={() => setExpanded(isOpen ? null : issue.id)}
              className="group w-full rounded-xl border border-neutral-200 bg-white p-5 text-left transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
              aria-expanded={isOpen}
            >
              <div className="flex items-start gap-4">
                {/* Number / Icon Area */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors group-hover:border-neutral-300 group-hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:group-hover:border-neutral-700 dark:group-hover:text-white">
                  <TextAlignStart className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-neutral-400 dark:text-neutral-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {issue.issue_type}
                      </h3>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                    />
                  </div>

                  {/* Expanded Description Content */}
                  {isOpen && (
                    <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {issue.issue_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  </div>
);

const IssuesDocs = () => {
  // Expansion state for the accordion
  const [expanded, setExpanded] = useState<number | null>(null);

  // --- TANSTACK REACT QUERY ---
  const {
    data: groupedDocs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<GroupedIssueDocs[]>({
    queryKey: ["issues_docs_data"],
    queryFn: fetchedIssuesDocs,
  });

  return (
    // TODO: Ensure this ID matches any anchor links you use for navigation
    <div id="issues-docs" className="scroll-mt-24">
      {/* Global Section Header */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <Files className="h-3.5 w-3.5" />
            Documentation
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
            Issues Documentation
          </h2>
          <p className="mt-3 max-w-xl text-base text-neutral-500 dark:text-neutral-400">
            Browse through department-specific issue types to understand what
            they mean/entail before submitting your issue. Click on an issue
            type to view more details.
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => refetch()}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 active:scale-95 disabled:opacity-70 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <RotateCcw
            size={16}
            className={"text-neutral-500 dark:text-neutral-400"}
          />
          Refresh
        </button>
      </div>

      {/* Dynamic Content Area */}
      {isLoading ? (
        // Loading State
        <IssuesDocsSkeleton />
      ) : isError ? (
        // Error State
        <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-4 text-sm font-medium text-red-800 dark:text-red-400">
            Failed to load documentation.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-sm font-semibold text-red-600 underline hover:text-red-700 dark:text-red-400"
          >
            Try again
          </button>
        </div>
      ) : (
        // Data Grid
        <div className="grid grid-cols-1 gap-10">
          {groupedDocs.length > 0 ? (
            groupedDocs.map((group) => (
              <div key={group.department}>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white">
                  <Building2 className="h-6 w-6 text-blue-500" />
                  {group.department}
                </h3>
                <IssueList
                  issues={group.issues}
                  expanded={expanded}
                  setExpanded={setExpanded}
                />
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full flex min-h-50 items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No department documentation available at this time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick tip callout */}
      <div className="mt-12 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            Pro tip
          </p>
          <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-400">
            Can&apos;t find the issue type you&apos;re looking for? Reach out to
            IT, and we&apos;ll help categorize your issue and expand our options
            for future use
          </p>
        </div>
      </div>
    </div>
  );
};

export default IssuesDocs;
