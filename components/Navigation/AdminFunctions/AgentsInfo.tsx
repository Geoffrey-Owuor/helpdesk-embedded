"use client";

import {
  fetchedIssueAgents,
  IssueAgents,
} from "@/serverActions/GetIssueAgents";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import { Mail, Tag, Info, BadgeCheck } from "lucide-react";
import { arrayReducer, AgentWithSkills } from "@/utils/ArrayReducer";
import { abbreviateUserName } from "@/public/assets";
import AgentsInfoSkeleton from "@/components/Skeletons/AgentsInfoSkeleton";

const AgentsInfo = () => {
  const [agentsInfo, setAgentsInfo] = useState<AgentWithSkills[]>([]);
  const [loading, setLoading] = useState(false);
  const { userId } = useUser();

  useEffect(() => {
    const fetchAgentsInfo = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const agentsData: IssueAgents[] = await fetchedIssueAgents(userId);

        // Transform flat array into a grouped array
        const groupedData = arrayReducer(agentsData);

        setAgentsInfo(groupedData);
      } catch (error) {
        console.error("Error while fetching agents information:", error);
        setAgentsInfo([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentsInfo();
  }, [userId]);

  if (loading) return <AgentsInfoSkeleton />;

  if (agentsInfo.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-12 text-neutral-500 dark:border-neutral-800">
        <Info className="mb-2 opacity-20" size={32} />
        <p className="text-sm">No agents found in the system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Current Agents
        </h4>
        <p className="text-xs text-neutral-500">
          A list of all support agents and the issue categories they are
          assigned to.
        </p>
      </div>

      <div className="grid gap-4">
        {agentsInfo.map((agent) => (
          <div
            key={agent.email}
            className="group flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
          >
            {/* 1. Header: Avatar & Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm text-white dark:bg-white dark:text-black">
                  {abbreviateUserName(agent.name)}
                </div>
                <div>
                  <h5 className="mb-1 text-sm leading-none font-bold text-neutral-900 dark:text-neutral-100">
                    {agent.name}
                  </h5>
                  <div className="flex items-center gap-1 text-xs text-blue-500 transition-colors">
                    <Mail size={12} />
                    <a href={`mailto:${agent.email}`}>{agent.email}</a>
                  </div>
                </div>
              </div>
              <BadgeCheck
                size={16}
                className="-translate-x-2 text-neutral-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 dark:text-neutral-300"
              />
            </div>

            {/* 2. Skills Section: Tag Cloud */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                <Tag size={10} />
                <span>Skills / Issue Types</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {agent.supported_issues.map((issue, idx) => (
                  <span
                    key={`${agent.email}-${issue}-${idx}`}
                    className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {issue}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsInfo;
