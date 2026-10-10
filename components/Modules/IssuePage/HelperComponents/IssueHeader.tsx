"use client";
import { ReactNode, useState } from "react";
import { Calendar, GitMerge, RotateCcw, UndoDot } from "lucide-react";
import { IssueDetail } from "@/queries/fetchIssue";
import { dateFormatter, titleHelper } from "@/public/assets";
import IssueStatusFormatter from "../../IssuesData/IssueStatusFormatter";
import IssuePriorityFormatter from "../../IssuesData/IssuePriorityFormatter";
import RelativeTimeBadge from "../../IssuesData/RelativeTimeBadge";
import { ResolutionTimePill } from "../../IssuesData/ResolutionTimePill";
import EscalationHistoryModal from "../EscalationHistoryModal";
import ReopenHistoryModal from "../ReopenHistoryModal";

const historyButtonClass =
  "inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-2.5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-neutral-800 sm:px-2.5 sm:py-1 sm:text-[11px] dark:bg-white dark:text-black dark:hover:bg-neutral-200";

// Title, reference, status/priority and timing for an issue, shared by the
// issue page and its read-only analytics mirror. The issue page fills the
// slots with its actions; the analytics page leaves them empty.
export const IssueHeader = ({
  issue,
  onRefresh,
  leadingActions,
  actions,
  controls,
}: {
  issue: IssueDetail;
  onRefresh: () => void;
  // Before the history buttons in the top row
  leadingActions?: ReactNode;
  // After the history buttons in the top row
  actions?: ReactNode;
  // After the refresh button in the bottom row
  controls?: ReactNode;
}) => {
  const [escalationHistoryOpen, setEscalationHistoryOpen] = useState(false);
  const [reopenHistoryOpen, setReopenHistoryOpen] = useState(false);

  const isFinished =
    issue.issue_status === "resolved" || issue.issue_status === "closed";

  return (
    <>
      {/* Escalation History Modal */}
      {escalationHistoryOpen && (
        <EscalationHistoryModal
          isOpen={escalationHistoryOpen}
          uuid={issue.issue_uuid}
          closeModal={() => setEscalationHistoryOpen(false)}
        />
      )}

      {/* Reopen History Modal */}
      {reopenHistoryOpen && (
        <ReopenHistoryModal
          isOpen={reopenHistoryOpen}
          uuid={issue.issue_uuid}
          closeModal={() => setReopenHistoryOpen(false)}
        />
      )}

      <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-3">
          <h1
            title={titleHelper(issue.issue_title)}
            className="line-clamp-1 max-w-100 text-xl font-semibold wrap-break-word text-neutral-900 dark:text-white"
          >
            {issue.issue_title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-mono text-[15px] font-semibold text-blue-600 dark:text-blue-400">
              {issue.issue_reference_id}
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              {dateFormatter(issue.issue_created_at)}
            </div>
            <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
            <IssueStatusFormatter status={issue.issue_status} />
            <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
            <IssuePriorityFormatter priority={issue.issue_priority} />
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {leadingActions}

            {/* Reopen history button */}
            {Number(issue.reopened_count) > 0 && (
              <button
                onClick={() => setReopenHistoryOpen(true)}
                className={historyButtonClass}
              >
                <UndoDot size={12} />
                reopening history
              </button>
            )}

            {/* Escalation history button */}
            {Number(issue.escalated_count) > 0 && (
              <button
                onClick={() => setEscalationHistoryOpen(true)}
                className={historyButtonClass}
              >
                <GitMerge size={12} />
                escalation history
              </button>
            )}

            {actions}

            {/* Relative time badge */}
            <RelativeTimeBadge
              createdAt={issue.issue_created_at}
              status={issue.issue_status}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Resolution time */}
            {isFinished && issue.issue_date_resolved && (
              <ResolutionTimePill
                dateSubmitted={issue.issue_created_at}
                dateResolved={issue.issue_date_resolved}
              />
            )}
            <button
              onClick={onRefresh}
              className="rounded-xl bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>

            {controls}
          </div>
        </div>
      </div>
    </>
  );
};
