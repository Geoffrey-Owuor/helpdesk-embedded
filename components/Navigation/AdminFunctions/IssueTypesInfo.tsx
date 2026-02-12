"use client";

import { IssueAgents } from "@/serverActions/GetIssueAgents";
import {
  Bug,
  Mail,
  Loader2,
  Info,
  UserRound,
  UserRoundPen,
  BugPlay,
} from "lucide-react";
import { useState } from "react";
import EditIssueTypeInfo from "./EditIssueTypeInfo";
import { arrayReducer } from "@/utils/ArrayReducer";

type IssueTypesInfoProps = {
  loading: boolean;
  agentsFlatInfo: IssueAgents[];
};

const IssueTypesInfo = ({ loading, agentsFlatInfo }: IssueTypesInfoProps) => {
  // Tracking the id of the active edit section
  const [activeEditId, setActiveEditId] = useState<string | null>(null);

  const handleToggleEdit = (id: string) => {
    // If clicking the same one, close it, otherwise open a new one
    setActiveEditId((prev) => (prev === id ? null : id));
  };

  // Group the flattened array
  const agentsInfo = arrayReducer(agentsFlatInfo);

  // Get the agent names array from agentsInfo
  const agentNames = agentsInfo.map((agentInfo) => ({
    agentName: agentInfo.name,
    agentEmail: agentInfo.email,
  }));

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

      <button className="mb-4 flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-blue-800">
        <BugPlay className="h-4 w-4" />
        <span>Add Issue Type</span>
      </button>

      <div className="grid gap-3">
        {agentsFlatInfo.map((item, index) => (
          // Outer wrapper div
          <div
            key={`${item.issue_type}-${index}`}
            className="flex flex-col gap-4"
          >
            {/* The major card containing issue type information */}
            <div
              className={`group flex justify-between rounded-xl border p-4 transition-all duration-200 ${
                activeEditId === item.issue_type
                  ? "border-blue-500 bg-blue-50/30 shadow-md dark:border-blue-500/50 dark:bg-blue-900/10"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
              }`}
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
              <button
                onClick={() => handleToggleEdit(item.issue_type)}
                className={`${activeEditId === item.issue_type ? "inline-flex" : "hidden hover:inline-flex"} hidden h-8 w-8 items-center justify-center rounded-full bg-neutral-200 group-hover:inline-flex hover:bg-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800`}
              >
                <UserRoundPen className="h-4 w-4" />
              </button>
            </div>

            {/* The edit issueType info div */}
            {activeEditId === item.issue_type && (
              <EditIssueTypeInfo
                agentName={item.agent_name}
                issueType={item.issue_type}
                agentNames={agentNames}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueTypesInfo;
