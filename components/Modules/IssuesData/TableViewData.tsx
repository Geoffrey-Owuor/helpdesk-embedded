"use client";

import { useColumnVisibility } from "@/contexts/ColumnVisibilityContext";
import { titleHelper } from "@/public/assets";
import Link from "next/link";
import IssueStatusFormatter from "./IssueStatusFormatter";
import { dateFormatter } from "@/public/assets";
import { AssignedAgentFormatter } from "./AssignedAgentFormatter";
import { useRouter } from "next/navigation";
import { useLoadingLine } from "@/contexts/LoadingLineContext";

type TableViewDataProps = {
  currentIssues: Record<string, string | number>[];
  dynamicUrlParam: string;
};

const TableViewData = ({
  currentIssues,
  dynamicUrlParam,
}: TableViewDataProps) => {
  const { visibleColumns } = useColumnVisibility();
  const router = useRouter();
  const { setLoadingLine } = useLoadingLine();

  return (
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
          {currentIssues.length === 0 ? (
            <tr>
              <td
                colSpan={100}
                className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400"
              >
                No issues found.
              </td>
            </tr>
          ) : (
            currentIssues.map((issueData) => (
              <tr
                key={issueData.issue_uuid}
                onClick={() => {
                  setLoadingLine(true);
                  router.push(
                    `/dashboard/${issueData.issue_uuid}?type=${dynamicUrlParam}&title=${encodeURIComponent(issueData.issue_title)}&description=${encodeURIComponent(issueData.issue_description)}`,
                  );
                }}
                className="group cursor-pointer rounded-xl shadow-sm transition-transform duration-200"
              >
                {/* ROW STYLING NOTES: 
                  - We apply bg-neutral-50, and padding to every TD.
                  - first:rounded-l-xl rounds the left side of the row.
                  - last:rounded-r-xl rounds the right side of the row.
                          */}

                {visibleColumns.ref && (
                  <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <Link
                      onClick={(e) => {
                        e.stopPropagation();
                        setLoadingLine(true);
                      }}
                      href={`/dashboard/${issueData.issue_uuid}?type=${dynamicUrlParam}&title=${encodeURIComponent(issueData.issue_title)}&description=${encodeURIComponent(issueData.issue_description)}`}
                      className="max-w-30 truncate text-sm font-semibold text-neutral-900 hover:text-blue-500 hover:underline dark:text-neutral-100"
                    >
                      {issueData.issue_reference_id}
                    </Link>
                  </td>
                )}

                {visibleColumns.status && (
                  <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <IssueStatusFormatter status={issueData.issue_status} />
                  </td>
                )}

                {visibleColumns.type && (
                  <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                      {issueData.issue_type}
                    </p>
                  </td>
                )}

                {visibleColumns.submitter && (
                  <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                      {issueData.issue_submitter_name}
                    </p>
                  </td>
                )}

                {visibleColumns.date && (
                  <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                      {dateFormatter(issueData.issue_created_at)}
                    </p>
                  </td>
                )}

                {visibleColumns.subDept && (
                  <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                      {issueData.issue_submitter_department}
                    </p>
                  </td>
                )}

                {visibleColumns.targetDept && (
                  <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                      {issueData.issue_target_department}
                    </p>
                  </td>
                )}

                {visibleColumns.agent && (
                  <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <AssignedAgentFormatter
                      agentName={issueData.issue_agent_name}
                    />
                  </td>
                )}

                {/* Title: Use max-w and truncate instead of fixed w-50 */}
                {visibleColumns.title && (
                  <td className="max-w-50 bg-white px-4 py-4 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
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
                  <td className="max-w-[320px] bg-white px-4 py-4 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
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
  );
};

export default TableViewData;
