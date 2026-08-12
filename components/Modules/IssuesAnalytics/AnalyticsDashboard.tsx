"use client";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import { useAnalyticsFilterStore } from "@/store/useAnalyticsFilterStore";
import { fetchAnalyticsIssues } from "@/queries/analytics/fetchAnalyticsIssues";
import { fetchAnalyticsSummary } from "@/queries/analytics/fetchAnalyticsSummary";
import IssuesDataSkeleton from "@/components/Skeletons/IssuesDataSkeleton";
import FilterPanel from "./FilterPanel";
import SummaryCardsSection from "./SummaryCardsSection";
import AnalyticsIssuesTable from "./AnalyticsIssuesTable";
import AnalyticsPagination from "./AnalyticsPagination";
import AiInsightPanel from "./AiInsightPanel";

const AnalyticsDashboard = () => {
  const committedFilters = useAnalyticsFilterStore(
    (state) => state.committedFilters,
  );
  const page = useAnalyticsFilterStore((state) => state.page);
  const pageSize = useAnalyticsFilterStore((state) => state.pageSize);

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["analyticsSummary", committedFilters],
    queryFn: () => fetchAnalyticsSummary(committedFilters),
  });

  const {
    data: issuesResponse,
    isLoading: issuesLoading,
    refetch: refetchIssues,
  } = useQuery({
    queryKey: ["analyticsIssues", committedFilters, page, pageSize],
    queryFn: () => fetchAnalyticsIssues(committedFilters, page, pageSize),
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchIssues();
  };

  return (
    <div className="mx-auto py-6 md:py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex flex-col">
          <span className="text-xl font-semibold">Issues Analytics</span>
          <span className="text-sm text-neutral-800 dark:text-neutral-400">
            Company-wide issues overview
          </span>
        </div>
        <button
          onClick={handleRefresh}
          title="Refresh"
          className="rounded-xl bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          <RotateCw className="h-4.5 w-4.5" />
        </button>
      </div>

      <FilterPanel />

      <SummaryCardsSection summary={summary} isLoading={summaryLoading} />

      {!summaryLoading && (
        <div className="mb-4">
          <AiInsightPanel summary={summary} committedFilters={committedFilters} />
        </div>
      )}

      {issuesLoading ? (
        <IssuesDataSkeleton isTableView={true} />
      ) : (
        <>
          <AnalyticsIssuesTable
            rows={issuesResponse?.rows ?? []}
            isLoading={issuesLoading}
          />
          <AnalyticsPagination total={issuesResponse?.total ?? 0} />
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
