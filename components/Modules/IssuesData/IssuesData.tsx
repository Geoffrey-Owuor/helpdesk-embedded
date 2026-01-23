"use client";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { titleHelper } from "@/public/assets";
import IssueStatusFormatter from "./IssueStatusFormatter";
import { dateFormatter } from "@/public/assets";
import IssuesDataSkeleton from "@/components/Skeletons/IssuesDataSkeleton";
import { useUser } from "@/contexts/UserContext";
import ShowHideColumnsLogic from "./ShowHideColumnsLogic";
import SearchFilterLogic from "./SearchFilterLogic";
import { RefreshCcw } from "lucide-react";

// Define column widths here to ensure header and data align perfectly
// shrink-0 prevents the columns from squishing if screen is small
const colWidths = {
  ref: "w-24 shrink-0",
  status: "w-24 shrink-0",
  type: "w-24 shrink-0",
  submitter: "w-32 shrink-0",
  date: "w-32 shrink-0",
  dept: "w-32 shrink-0",
  agent: "w-32 shrink-0",
  title: "w-50 shrink-0",
  desc: "w-80 shrink-0", // Larger width for description
};

const IssuesData = () => {
  const { issuesData, loading, refetchIssues } = useIssuesData();
  const { role, department } = useUser();

  // Determine the text to display in title based on the current user role
  const textRoleMapping: Record<string, string> = {
    user: "you have submitted",
    admin: `submitted by users to ${department}`,
    agent: "assigned to you",
  };

  return (
    <>
      {/* Title Area and Issue Data filtering and other functionalities */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:justify-between">
        {/* The title and search functionality */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex flex-col px-2">
            <span className="text-xl font-semibold">Issues Data</span>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Issues {textRoleMapping[role]}
            </span>

            <span className="text-xs text-neutral-500">
              Total Issues: {issuesData.length}
            </span>
          </div>

          {/* The filtering logic */}
          <SearchFilterLogic />
        </div>

        {/* The refresh button */}
        <div className="flex items-center justify-between md:justify-center md:gap-4">
          <button
            onClick={refetchIssues}
            className="flex h-9.5 cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-3 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <RefreshCcw strokeWidth={1} className="h-5 w-5" />
            <span>Refresh</span>
          </button>

          {/* Show/Hide Columns Logic */}
          <ShowHideColumnsLogic />
        </div>
      </div>

      {/* The data div that shows the issues */}
      <div className="w-full overflow-x-auto pb-4">
        {/* Container with min-w-max ensures the children don't wrap/squish */}
        <div className="min-w-max space-y-2">
          {/* --- HEADER ROW --- */}
          <div className="flex items-center gap-4 px-4 pb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            <div className={colWidths.ref}>#Reference</div>
            <div className={colWidths.status}>Status</div>
            <div className={colWidths.type}>Type</div>
            <div className={colWidths.submitter}>Submitter</div>
            <div className={colWidths.date}>Date Submitted</div>
            <div className={colWidths.dept}>Department</div>
            <div className={colWidths.agent}>Agent</div>
            <div className={colWidths.title}>Title</div>
            <div className={colWidths.desc}>Description</div>
          </div>

          {/* --- DATA MAPPING AND PAGINATION --- */}
          {loading ? (
            <IssuesDataSkeleton />
          ) : (
            <div>
              <div className="space-y-3">
                {issuesData.length === 0 ? (
                  /* --- FALLBACK MESSAGE --- */
                  <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 shadow-sm dark:border-neutral-700 dark:bg-neutral-800/50">
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No issues found.
                    </p>
                  </div>
                ) : (
                  /* --- EXISTING LIST MAPPING --- */
                  issuesData.map((issueData) => (
                    <div
                      key={issueData.issue_uuid}
                      className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4 shadow transition-colors duration-200 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-700/50"
                    >
                      <div
                        title={titleHelper(issueData.issue_reference_id)}
                        className={colWidths.ref}
                      >
                        <span className="font-semibold text-neutral-500 dark:text-neutral-300">
                          {issueData.issue_reference_id}
                        </span>
                      </div>

                      <div
                        title={titleHelper(issueData.issue_status)}
                        className={colWidths.status}
                      >
                        <IssueStatusFormatter status={issueData.issue_status} />
                      </div>

                      <div
                        title={titleHelper(issueData.issue_type)}
                        className={colWidths.type}
                      >
                        <span className="truncate text-gray-900 dark:text-white">
                          {issueData.issue_type}
                        </span>
                      </div>

                      <div
                        title={titleHelper(issueData.issue_submitter_name)}
                        className={colWidths.submitter}
                      >
                        <span className="truncate text-gray-900 dark:text-white">
                          {issueData.issue_submitter_name}
                        </span>
                      </div>

                      <div
                        title={dateFormatter(issueData.issue_created_at)}
                        className={colWidths.submitter}
                      >
                        <span className="truncate text-gray-900 dark:text-white">
                          {dateFormatter(issueData.issue_created_at)}
                        </span>
                      </div>

                      <div
                        title={titleHelper(
                          issueData.issue_submitter_department,
                        )}
                        className={colWidths.dept}
                      >
                        <span className="truncate text-gray-900 dark:text-white">
                          {issueData.issue_submitter_department}
                        </span>
                      </div>

                      <div
                        title={titleHelper(issueData.issue_agent_name)}
                        className={colWidths.agent}
                      >
                        <span
                          className={`truncate ${
                            issueData.issue_agent_name === "Not Assigned"
                              ? "text-amber-500"
                              : "text-green-500"
                          }`}
                        >
                          {issueData.issue_agent_name}
                        </span>
                      </div>

                      <div
                        title={titleHelper(issueData.issue_title)}
                        className={colWidths.title}
                      >
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {issueData.issue_title}
                        </p>
                      </div>

                      <div
                        title={titleHelper(issueData.issue_description)}
                        className={colWidths.desc}
                      >
                        <p className="truncate text-gray-900 dark:text-white">
                          {issueData.issue_description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* This is where we will put our pagination */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IssuesData;
