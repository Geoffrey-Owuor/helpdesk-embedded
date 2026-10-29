import { FileText } from "lucide-react";
import { IssueDetail } from "@/queries/fetchIssue";
import { dateFormatter } from "@/lib/assets";
import { closeReasonLabel } from "@/lib/issues/closeReasons";

// The issue's update/resolve/close dates, and why it closed if it wasn't resolved
export const IssueMetadataCard = ({ issue }: { issue: IssueDetail }) => {
  const closedWithout = closeReasonLabel(issue.issue_close_reason);
  const rows = [
    { label: "Date Updated", value: dateFormatter(issue.issue_updated_at) },
    { label: "Date Resolved", value: dateFormatter(issue.issue_date_resolved) },
    { label: "Date Closed", value: dateFormatter(issue.issue_date_closed) },
    ...(closedWithout
      ? [{ label: "Closed Without Resolution", value: closedWithout }]
      : []),
  ];

  return (
    <div className="flex flex-col rounded-xl border-t-2 border-black dark:border-white">
      {/* Card header */}
      <div className="flex items-center justify-between p-6">
        <div className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Other Metadata
          </h2>
        </div>
        <p className="hidden text-sm text-neutral-500 sm:inline-flex dark:text-neutral-400">
          Relevant metadata
        </p>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-neutral-100 px-6 dark:divide-neutral-800">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {label}
            </span>
            <span className="line-clamp-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
