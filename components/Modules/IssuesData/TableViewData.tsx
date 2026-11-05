"use client";

import { useColumnStore } from "@/store/useColumnStore";
import { titleHelper } from "@/lib/assets";
import Link from "next/link";
import IssueStatusFormatter from "./IssueStatusFormatter";
import { dateFormatter } from "@/lib/assets";
import { AssignedAgentFormatter } from "./AssignedAgentFormatter";
import { useRouter } from "next/navigation";
import IssuePriorityFormatter from "./IssuePriorityFormatter";
import { issueFlagColors } from "@/lib/indicatorStyles";
import RelativeTimeBadge from "./RelativeTimeBadge";
import { GitMerge, Paperclip, UndoDot, UsersRound } from "lucide-react";
import { ResolutionTimePill } from "./ResolutionTimePill";
import PinButton from "../PinnedIssues/PinButton";
import {
  IssueActionHandler,
  IssueActionsMenu,
  useIssueMenuItems,
} from "./IssueListActions";

type TableViewDataProps = {
  currentIssues: Record<string, string | number>[];
  onAction: IssueActionHandler;
};

const TableViewData = ({ currentIssues, onAction }: TableViewDataProps) => {
  const visibleColumns = useColumnStore((state) => state.visibleColumns);
  const router = useRouter();
  const getMenuItems = useIssueMenuItems(onAction);

  // No sticky column to give up width to when no row has an action
  const showActions = currentIssues.some(
    (issue) => getMenuItems(issue).length > 0,
  );

  return (
    <div className="w-full rounded-xl border border-neutral-200 bg-gray-50 py-2 pr-4 pl-3 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Rounded card that doesn't clip: the horizontal scroller sits inside its padding. A rounded scroller forces a clip mask that is recomposited on every page scroll.
          The scroller's own left padding keeps the rows' shadow from being cut at its edge. The right side gets none: the sticky actions column has to sit flush with the edge, or scrolled cells would show past it. */}
      <div className="overflow-x-auto bg-gray-50 pl-1 dark:bg-neutral-950">
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
              {visibleColumns.priority && (
                <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Priority
                </th>
              )}
              {visibleColumns.submitter && (
                <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Submitter
                </th>
              )}
              {visibleColumns.relativeTime && (
                <th className="px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Time Badge
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
              {showActions && (
                <th className="sticky right-0 z-10 border-l border-neutral-200 bg-gray-50 px-3 pb-2 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:border-neutral-800 dark:bg-neutral-950 dark:text-gray-400">
                  Actions
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
                  className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400"
                >
                  No issues found.
                </td>
              </tr>
            ) : (
              currentIssues.map((issueData) => (
                <tr
                  key={issueData.issue_uuid}
                  onClick={() =>
                    router.push(`/dashboard/${issueData.issue_uuid}`)
                  }
                  className="group cursor-pointer rounded-xl shadow-sm transition-transform duration-200"
                >
                  {/* ROW STYLING NOTES: 
                    - We apply bg-neutral-50, and padding to every TD.
                    - first:rounded-l-xl rounds the left side of the row.
                    - last:rounded-r-xl rounds the right side of the row.
                            */}

                  {visibleColumns.ref && (
                    <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          onClick={(e) => e.stopPropagation()}
                          title={titleHelper(issueData.issue_reference_id)}
                          href={`/dashboard/${issueData.issue_uuid}`}
                          className="max-w-50 truncate text-sm font-semibold text-neutral-900 hover:text-blue-500 hover:underline dark:text-neutral-100"
                        >
                          {issueData.issue_reference_id}
                        </Link>
                        {Number(issueData.attachments_count) > 0 && (
                          <Paperclip className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                        )}
                        {Number(issueData.reopened_count) > 0 && (
                          <UndoDot
                            aria-label="Reopened issue"
                            className={`h-3.5 w-3.5 ${issueFlagColors.reopened}`}
                          />
                        )}
                        {Number(issueData.escalated_count) > 0 && (
                          <GitMerge
                            aria-label="Escalated issue"
                            className={`h-3.5 w-3.5 ${issueFlagColors.escalated}`}
                          />
                        )}
                        {Number(issueData.collaborators_count) > 0 && (
                          <UsersRound
                            aria-label="Collaborated issue"
                            className={`h-3.5 w-3.5 ${issueFlagColors.collaborated}`}
                          />
                        )}
                        <PinButton
                          size={14}
                          revealOnHover
                          issue={{
                            issue_uuid: String(issueData.issue_uuid),
                            issue_reference_id: String(
                              issueData.issue_reference_id,
                            ),
                            issue_status: String(issueData.issue_status),
                            issue_priority: String(issueData.issue_priority),
                            issue_title: String(issueData.issue_title),
                            issue_description: String(
                              issueData.issue_description,
                            ),
                          }}
                        />
                      </div>
                    </td>
                  )}

                  {visibleColumns.status && (
                    <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <IssueStatusFormatter status={issueData.issue_status} />
                    </td>
                  )}

                  {visibleColumns.type && (
                    <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <div className="flex items-center gap-2">
                        <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                          {issueData.issue_type}
                        </p>
                        {/* Resolution Time */}
                        {(issueData.issue_status === "resolved" ||
                          issueData.issue_status === "closed") &&
                          issueData.issue_created_at &&
                          issueData.issue_date_resolved && (
                            <ResolutionTimePill
                              dateSubmitted={issueData.issue_created_at}
                              dateResolved={issueData.issue_date_resolved}
                            />
                          )}
                      </div>
                    </td>
                  )}

                  {visibleColumns.priority && (
                    <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <IssuePriorityFormatter
                        priority={issueData.issue_priority}
                      />
                    </td>
                  )}

                  {visibleColumns.submitter && (
                    <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <p className="max-w-30 truncate text-sm text-gray-900 dark:text-white">
                        {issueData.issue_submitter_name}
                      </p>
                    </td>
                  )}

                  {visibleColumns.relativeTime && (
                    <td className="bg-white px-4 py-4 whitespace-nowrap group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <RelativeTimeBadge
                        createdAt={issueData.issue_created_at}
                        status={issueData.issue_status}
                      />
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

                  {/* Actions: the row's colours are translucent in dark mode and
                      its corner is rounded, so the sticky cell itself takes the
                      card's opaque colour (hiding what scrolls under it) and an
                      inner layer paints the row, with its own copy of the row's
                      shadow - the opaque cell covers the row's. The row's own
                      shadow spills just outside it and runs on to the far end
                      of the row, so ::before stretches the card colour over it
                      too (the gap between rows is wider than either shadow).
                      A miss beside the button stays in the cell instead of
                      opening the issue. */}
                  {showActions && (
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="sticky right-0 z-10 h-14 w-16 min-w-16 cursor-default bg-gray-50 p-0 before:absolute before:inset-x-0 before:-inset-y-1.5 before:bg-gray-50 dark:bg-neutral-950 dark:before:bg-neutral-950"
                    >
                      <div className="absolute inset-0 flex items-center justify-center rounded-r-xl border-l shadow-sm border-neutral-200 bg-white group-hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                        <IssueActionsMenu
                          issue={issueData}
                          items={getMenuItems(issueData)}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableViewData;
