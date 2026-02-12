"use client";

import { IssueAgents } from "@/serverActions/GetIssueAgents";
import { Bug, Mail, Loader2, Info, UserRound } from "lucide-react";

type IssueTypesInfoProps = {
  loading: boolean;
  agentsFlatInfo: IssueAgents[];
};

const IssueTypesInfo = ({ loading, agentsFlatInfo }: IssueTypesInfoProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
        <Loader2 className="h-8 w-8 animate-spin opacity-20" />
        <p className="mt-2 text-sm italic">Loading issue configurations...</p>
      </div>
    );
  }

  if (agentsFlatInfo.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-12 text-neutral-500 dark:border-neutral-800">
        <Info className="mb-2 opacity-20" size={32} />
        <p className="text-sm">No issue types have been mapped yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Issue Types
        </h4>
        <p className="text-xs text-neutral-500">
          Overview of specific issue types and their assigned agents.
        </p>
      </div>

      <div className="grid gap-3">
        {agentsFlatInfo.map((item, index) => (
          <div
            key={`${item.issue_type}-${index}`}
            className="group flex justify-between rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
          >
            {/* Left Section: Issue Type And Agent Info */}
            <div className="flex flex-col gap-4">
              {/* Issue Type */}
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  <Bug className="transition-colors group-hover:text-red-500" />
                </div>
                <h5 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.issue_type}
                </h5>
              </div>

              {/* Agent info */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <UserRound size={14} />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {item.agent_name}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-neutral-500">
                    <Mail size={10} />
                    <span>{item.agent_email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Edit button - Visible on hover */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueTypesInfo;
