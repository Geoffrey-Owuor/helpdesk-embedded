"use client";

import apiClient from "@/lib/AxiosClient";
import { DefaultIssuesMappingCounts, IssuesMappingCounts } from "@/lib/assets";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { useQuery } from "@tanstack/react-query";
import { indicatorCircle, priorityIndicators } from "@/lib/indicatorStyles";

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
    },
    {
      label: "Medium",
      value: issuesMappingCounts.medium,
    },
    {
      label: "High",
      value: issuesMappingCounts.high,
    },
    {
      label: "Critical",
      value: issuesMappingCounts.critical,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-3.5 lg:grid-cols-4">
      {IssueCountsData.map((item, index) => {
        const Icon = priorityIndicators[item.label].icon;
        return (
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

              <div className={indicatorCircle}>
                <Icon
                  className={`h-6 w-6 ${priorityIndicators[item.label].color}`}
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* Priority counts */}
            <span className="mt-4 text-xs text-neutral-500">
              Total {item.label} priority issues
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default IssuesMappingCards;
