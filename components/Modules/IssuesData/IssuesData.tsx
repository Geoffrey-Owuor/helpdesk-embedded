"use client";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { titleHelper } from "@/public/assets";
import IssueStatusFormatter from "./IssueStatusFormatter";
import { dateFormatter } from "@/public/assets";

const IssuesData = () => {
  const { issuesData } = useIssuesData();

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

  return (
    // Parent div handles the horizontal overflow
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

        {/* --- DATA MAPPING --- */}
        <div className="space-y-3">
          {issuesData.map((issueData) => (
            <div
              key={issueData.issue_uuid}
              className="flex items-center gap-4 rounded-lg bg-neutral-50 p-4 shadow hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-700/50"
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
                title={titleHelper(issueData.issue_submitter_department)}
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
                  className={`truncate ${issueData.issue_agent_name === "Not Assigned" ? "text-amber-500" : "text-green-500"}`}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default IssuesData;
