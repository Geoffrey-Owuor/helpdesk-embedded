"use client";

import apiClient from "@/lib/AxiosClient";
import {
  DefaultIssuesMappingCounts,
  IssuesMappingCounts,
} from "@/public/assets";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, MoveHorizontal, Zap } from "lucide-react";

const IssuesMappingCards = () => {
  const {
    data: issuesMappingCounts = DefaultIssuesMappingCounts,
    isPending: loading,
  } = useQuery<IssuesMappingCounts>({
    queryKey: ["IssueCountsData"],
    queryFn: async () => {
      const response = await apiClient.get("/get-issuesmappingcounts");
      return response.data;
    },
  });

  // Map data to ui configuration
  const IssueCountsData = [
    {
      label: "Low",
      value: issuesMappingCounts.low,
      icon: ArrowDown,
      color: "text-violet-600 dark:text-violet-500",
      bgColor: "bg-violet-100 dark:bg-violet-900/30",
      borderColor: "border-violet-200 dark:border-violet-800/50",
    },
    {
      label: "Medium",
      value: issuesMappingCounts.medium,
      icon: MoveHorizontal,
      color: "text-sky-600 dark:text-sky-500",
      bgColor: "bg-sky-100 dark:bg-sky-900/30",
      borderColor: "border-sky-200 dark:border-sky-800/50",
    },
    {
      label: "High",
      value: issuesMappingCounts.high,
      icon: ArrowUp,
      color: "text-orange-600 dark:text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      borderColor: "border-orange-200 dark:border-orange-800/50",
    },
    {
      label: "Critical",
      value: issuesMappingCounts.critical,
      icon: Zap,
      color: "text-rose-600 dark:text-rose-500",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
      borderColor: "border-rose-200 dark:border-rose-800/50",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-3.5 lg:grid-cols-4">
      {IssueCountsData.map((item, index) => (
        <div
          key={index}
          className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
        >
          <span className="mb-1 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            {item.label} Issues
          </span>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
                {loading ? (
                  <SkeletonBox className="h-9 w-9 rounded-full" />
                ) : (
                  item.value
                )}
              </h3>
            </div>

            {/* Icon Container with dynamic colors */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${item.bgColor} ${item.borderColor} ${item.color}`}
            >
              <item.icon className="h-6 w-6" strokeWidth={2} />
            </div>
          </div>

          {/* Priority counts */}
          <span className="mt-4 text-xs text-neutral-500">
            Total {item.label} priority issues
          </span>
        </div>
      ))}
    </div>
  );
};

export default IssuesMappingCards;
