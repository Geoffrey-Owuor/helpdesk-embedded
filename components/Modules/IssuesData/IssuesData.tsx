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
import { RotateCcw } from "lucide-react";
import ClearFilters from "./ClearFilters";
import SearchFilters from "./SearchFilters";
import { useColumnVisibility } from "@/contexts/ColumnVisibilityContext";
import { useState } from "react";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import ViewAgentAdminFilter from "./ViewAgentAdminFilter";
import Pagination from "./Pagination";

const IssuesData = () => {
  const { issuesData, loading, refetchIssues } = useIssuesData();
  const { role, department } = useUser();
  const { visibleColumns } = useColumnVisibility();
  const { agentAdminFilter } = useSearchLogic();

  // Pagination states and logic
  const [currentPage, setCurrentPage] = useState(1);
  const [issuesPerPage, setIssuesPerPage] = useState(10);
  const totalPages = Math.ceil(issuesData.length / issuesPerPage);
  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = issuesData.slice(
    indexOfFirstIssue,
    Math.min(indexOfLastIssue, issuesData.length),
  );

  // Handle issue refetching
  const handleRefetchIssues = () => {
    refetchIssues();
    setCurrentPage(1);
  };

  // default subtitle
  const defaultSubtitle = `you have submitted`;
  const generatedSubtitle = () => {
    // Determine the text to display in title based on the current user role
    const textRoleMapping: Record<string, string> = {
      user: defaultSubtitle,
      admin:
        agentAdminFilter === "agentAdminFilter"
          ? defaultSubtitle
          : `Incoming for ${department}`,
      agent:
        agentAdminFilter === "agentAdminFilter"
          ? defaultSubtitle
          : "Assigned to You",
    };

    return textRoleMapping[role];
  };

  return (
    <>
      {/* Title Area Refresh Button, show/hide columns and Clear filters functionalities */}
      <div className="mb-4 flex flex-col gap-6 md:flex-row md:justify-between">
        {/* The title and toggle */}
        <div className="flex items-center justify-between md:justify-center md:gap-10">
          <div className="inline-flex flex-col">
            <span className="text-xl font-semibold">Issues Data</span>
            <span className="text-sm text-neutral-800 dark:text-neutral-400">
              Issues {generatedSubtitle()}
            </span>

            <span className="text-xs text-neutral-500">
              Total issues displayed: {issuesData.length || "none"}
            </span>
          </div>
          {role !== "user" && (
            <ViewAgentAdminFilter setCurrentPage={setCurrentPage} />
          )}
        </div>

        {/* The refresh button, clear filters, hide columns */}
        <div className="flex items-center justify-start gap-4 md:justify-center">
          {/* Clearing filters */}
          <ClearFilters setCurrentPage={setCurrentPage} />
          <button
            onClick={handleRefetchIssues}
            className="flex h-9.5 items-center gap-2 rounded-xl bg-neutral-900 px-3 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <RotateCcw className="h-4.5 w-4.5" />
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
        <SearchFilters setCurrentPage={setCurrentPage} />
      </div>

      {loading ? (
        <IssuesDataSkeleton />
      ) : (
        <div>
          {/* The data div that shows the issues */}
          <div className="w-full overflow-x-auto rounded-xl bg-gray-100/50 px-4 py-2 dark:bg-neutral-900/50">
            {/* 2. Table: 'border-separate' and 'border-spacing-y-3' create the gap between rows */}
            <table className="min-w-full border-separate border-spacing-y-3 text-left">
              {/* --- HEADER --- */}
              <thead>
                <tr>
                  {visibleColumns.ref && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      #Reference
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Status
                    </th>
                  )}
                  {visibleColumns.type && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Type
                    </th>
                  )}
                  {visibleColumns.submitter && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Submitter
                    </th>
                  )}
                  {visibleColumns.date && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Date Submitted
                    </th>
                  )}
                  {visibleColumns.subDept && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Submitter Dept
                    </th>
                  )}
                  {visibleColumns.targetDept && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Target Dept
                    </th>
                  )}
                  {visibleColumns.agent && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Agent
                    </th>
                  )}
                  {visibleColumns.title && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Title
                    </th>
                  )}
                  {visibleColumns.desc && (
                    <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                      Description
                    </th>
                  )}
                </tr>
              </thead>

              {/* --- BODY --- */}
              <tbody>
                {issuesData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={100}
                      className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400"
                    >
                      No issues found.
                    </td>
                  </tr>
                ) : (
                  currentIssues.map((issueData) => (
                    <tr
                      key={issueData.issue_uuid}
                      className="group rounded-xl shadow-sm transition-transform duration-200"
                    >
                      {/* ROW STYLING NOTES: 
                  - We apply bg-neutral-50, and padding to every TD.
                  - first:rounded-l-xl rounds the left side of the row.
                  - last:rounded-r-xl rounds the right side of the row.
              */}

                      {visibleColumns.ref && (
                        <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p className="max-w-30 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {issueData.issue_reference_id}
                          </p>
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <IssueStatusFormatter
                            status={issueData.issue_status}
                          />
                        </td>
                      )}

                      {visibleColumns.type && (
                        <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                            {issueData.issue_type}
                          </p>
                        </td>
                      )}

                      {visibleColumns.submitter && (
                        <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                            {issueData.issue_submitter_name}
                          </p>
                        </td>
                      )}

                      {visibleColumns.date && (
                        <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                            {dateFormatter(issueData.issue_created_at)}
                          </p>
                        </td>
                      )}

                      {visibleColumns.subDept && (
                        <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                            {issueData.issue_submitter_department}
                          </p>
                        </td>
                      )}

                      {visibleColumns.targetDept && (
                        <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                            {issueData.issue_target_department}
                          </p>
                        </td>
                      )}

                      {visibleColumns.agent && (
                        <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p
                            className={`max-w-30 truncate text-sm ${
                              issueData.issue_agent_name === "Not Assigned"
                                ? "text-amber-500"
                                : "text-green-500"
                            }`}
                          >
                            {issueData.issue_agent_name}
                          </p>
                        </td>
                      )}

                      {/* Title: Use max-w and truncate instead of fixed w-50 */}
                      {visibleColumns.title && (
                        <td className="max-w-50 bg-white px-4 py-4 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p
                            className="truncate text-sm font-semibold text-gray-900 dark:text-white"
                            title={titleHelper(issueData.issue_title)}
                          >
                            {issueData.issue_title}
                          </p>
                        </td>
                      )}

                      {/* Description: Use max-w and truncate instead of fixed w-80 */}
                      {visibleColumns.desc && (
                        <td className="max-w-[320px] bg-white px-4 py-4 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-800/50 dark:group-hover:bg-neutral-700/50">
                          <p
                            className="truncate text-sm text-gray-900 dark:text-white"
                            title={titleHelper(issueData.issue_description)}
                          >
                            {issueData.issue_description}
                          </p>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Our pagination ui */}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            issuesPerPage={issuesPerPage}
            setIssuesPerPage={setIssuesPerPage}
            totalPages={totalPages}
            indexOfFirstIssue={indexOfFirstIssue}
            indexOfLastIssue={indexOfLastIssue}
            issuesLength={issuesData.length}
          />
        </div>
      )}
    </>
  );
};

export default IssuesData;
