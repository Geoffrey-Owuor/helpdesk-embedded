"use client";
import { useRouter } from "next/navigation";
import { Paperclip, UndoDot, GitMerge, UsersRound } from "lucide-react";
import { titleHelper, dateFormatter } from "@/public/assets";
import { useLoadingStore } from "@/store/useLoadingStore";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import IssuePriorityFormatter from "../IssuesData/IssuePriorityFormatter";
import { AssignedAgentFormatter } from "../IssuesData/AssignedAgentFormatter";
import { AnalyticsIssueRow } from "./types";

const AnalyticsIssuesTable = ({
  rows,
  isLoading,
}: {
  rows: AnalyticsIssueRow[];
  isLoading: boolean;
}) => {
  const router = useRouter();
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);

  const goToIssue = (uuid: string) => {
    setLoadingLine(true);
    router.push(`/dashboard/analytics/${uuid}`);
  };

  return (
    <div className="layout-scrollbar w-full overflow-x-auto rounded-xl border border-neutral-200 bg-gray-100/50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-950">
      <table className="min-w-full border-separate border-spacing-y-3 text-left">
        <thead>
          <tr>
            {[
              "#Reference",
              "Status",
              "Priority",
              "Type",
              "Submitter",
              "Submitter Dept",
              "Agent",
              "Date Submitted",
            ].map((heading) => (
              <th
                key={heading}
                className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!isLoading && rows.length === 0 ? (
            <tr>
              <td
                colSpan={100}
                className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400"
              >
                No issues found.
              </td>
            </tr>
          ) : (
            rows.map((issue) => (
              <tr
                key={issue.issue_uuid}
                onClick={() => goToIssue(issue.issue_uuid)}
                className="group cursor-pointer rounded-xl shadow-sm transition-transform duration-200"
              >
                <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                  <div className="inline-flex items-center gap-2">
                    <span
                      title={titleHelper(issue.issue_reference_id)}
                      className="max-w-40 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                    >
                      {issue.issue_reference_id}
                    </span>
                    {Number(issue.attachments_count) > 0 && (
                      <Paperclip className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                    )}
                    {Number(issue.reopened_count) > 0 && (
                      <UndoDot
                        aria-label="Reopened issue"
                        className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-400"
                      />
                    )}
                    {Number(issue.escalated_count) > 0 && (
                      <GitMerge
                        aria-label="Escalated issue"
                        className="h-3.5 w-3.5 text-red-600 dark:text-red-400"
                      />
                    )}
                    {Number(issue.collaborators_count) > 0 && (
                      <UsersRound
                        aria-label="Collaborated issue"
                        className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400"
                      />
                    )}
                  </div>
                </td>
                <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                  <IssueStatusFormatter status={issue.issue_status} />
                </td>
                <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                  <IssuePriorityFormatter priority={issue.issue_priority} />
                </td>
                <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                  <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                    {issue.issue_type}
                  </p>
                </td>
                <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                  <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                    {issue.issue_submitter_name}
                  </p>
                </td>
                <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                  <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                    {issue.issue_submitter_department}
                  </p>
                </td>
                <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                  <AssignedAgentFormatter agentName={issue.issue_agent_name} />
                </td>
                <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                  <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                    {dateFormatter(issue.issue_created_at)}
                  </p>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsIssuesTable;
