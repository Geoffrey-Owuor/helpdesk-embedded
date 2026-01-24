"use client";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { titleHelper } from "@/public/assets";
import IssueStatusFormatter from "./IssueStatusFormatter";
import { dateFormatter } from "@/public/assets";
import IssuesDataSkeleton from "@/components/Skeletons/IssuesDataSkeleton";
import { useUser } from "@/contexts/UserContext";
import ShowHideColumnsLogic from "./ShowHideColumnsLogic";
import SearchFilterLogic from "./SearchFilterLogic";
import SearchInputFields from "./SearchInputFields";
import { RefreshCcw } from "lucide-react";
import ClearFilters from "./ClearFilters";
import SearchFilters from "./SearchFilters";

// Define column widths here to ensure header and data align perfectly
// shrink-0 prevents the columns from squishing if screen is small
const colWidths = {
  ref: "w-24 shrink-0",
  status: "w-24 shrink-0",
  type: "w-26 shrink-0",
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
    admin: `submitted to ${department}`,
    agent: "assigned to you",
  };

  return (
    <>
      {/* Title Area Refresh Button, show/hide columns and Clear filters functionalities */}
      <div className="mb-4 flex flex-col gap-6 md:flex-row md:justify-between">
        {/* The title  */}
        <div className="flex flex-col">
          <span className="text-xl font-semibold">Issues Data</span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Issues {textRoleMapping[role]}
          </span>

          <span className="text-xs text-neutral-500">
            Total issues displayed: {issuesData.length}
          </span>
        </div>

        {/* The refresh button, clear filters, hide columns */}
        <div className="flex items-center justify-start gap-4 md:justify-center">
          {/* Clearing filters */}
          <ClearFilters />
          <button
            onClick={refetchIssues}
            className="flex h-9.5 cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-3 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <RefreshCcw className="h-4.5 w-4.5" />
            <span>Refresh</span>
          </button>

          {/* Show/Hide Columns Logic */}
          <ShowHideColumnsLogic />
        </div>
      </div>

      {/* The filtering logic and search input fields */}

      <div className="mb-6 flex flex-wrap items-center justify-start gap-4 md:justify-center">
        <SearchFilterLogic />
        <SearchInputFields />
        {/* The search button */}
        <SearchFilters />
      </div>

      {/* The data div that shows the issues */}
      <div className="mb-6 w-full overflow-x-auto rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        {/* Container with min-w-max ensures the children don't wrap/squish */}
        <div className="min-w-max space-y-2">
          {/* --- HEADER ROW --- */}
          <div className="flex items-center gap-4 px-4 pb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            <div className={colWidths.ref}>#Reference</div>
            <div className={colWidths.status}>Status</div>
            <div className={colWidths.type}>Type</div>
            <div className={colWidths.submitter}>Submitter</div>
            <div className={colWidths.date}>Date Submitted</div>
            <div className={`${colWidths.dept} truncate`}>
              Submitter Department
            </div>
            <div className={`${colWidths.dept} truncate`}>
              Target Department
            </div>
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
                        <p className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
                          {issueData.issue_reference_id}
                        </p>
                      </div>

                      <div
                        className={colWidths.status}
                        title={titleHelper(issueData.issue_status)}
                      >
                        <IssueStatusFormatter status={issueData.issue_status} />
                      </div>

                      <div
                        title={titleHelper(issueData.issue_type)}
                        className={colWidths.type}
                      >
                        <p className="truncate text-gray-900 dark:text-white">
                          {issueData.issue_type}
                        </p>
                      </div>

                      <div
                        title={titleHelper(issueData.issue_submitter_name)}
                        className={colWidths.submitter}
                      >
                        <p className="truncate text-gray-900 dark:text-white">
                          {issueData.issue_submitter_name}
                        </p>
                      </div>

                      <div
                        title={dateFormatter(issueData.issue_created_at)}
                        className={colWidths.date}
                      >
                        <p className="truncate text-gray-900 dark:text-white">
                          {dateFormatter(issueData.issue_created_at)}
                        </p>
                      </div>

                      <div
                        title={titleHelper(
                          issueData.issue_submitter_department,
                        )}
                        className={colWidths.dept}
                      >
                        <p className="truncate text-gray-900 dark:text-white">
                          {issueData.issue_submitter_department}
                        </p>
                      </div>

                      <div
                        title={titleHelper(issueData.issue_target_department)}
                        className={colWidths.dept}
                      >
                        <p className="truncate text-gray-900 dark:text-white">
                          {issueData.issue_target_department}
                        </p>
                      </div>

                      <div
                        title={titleHelper(issueData.issue_agent_name)}
                        className={colWidths.agent}
                      >
                        <p
                          className={`truncate ${
                            issueData.issue_agent_name === "Not Assigned"
                              ? "text-amber-500"
                              : "text-green-500"
                          }`}
                        >
                          {issueData.issue_agent_name}
                        </p>
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
