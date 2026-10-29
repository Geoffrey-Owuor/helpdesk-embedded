import { AnalyticsSummary } from "./types";
import StatusCards from "./StatusCards";
import TimingCards from "./TimingCards";
import ActivityCards from "./ActivityCards";
import IssueTypeBreakdownCard from "./IssueTypeBreakdownCard";
import DepartmentBreakdownCard from "./DepartmentBreakdownCard";
import IssueTypeTimingCard from "./IssueTypeTimingCard";
import AgentTimingCard from "./AgentTimingCard";
import DepartmentTimingCard from "./DepartmentTimingCard";
import IssuesTrendChart from "./charts/IssuesTrendChart";
import PriorityStatusChart from "./charts/PriorityStatusChart";
import BacklogAgeingChart from "./charts/BacklogAgeingChart";
import AgentWorkloadChart from "./charts/AgentWorkloadChart";

const SummaryCardsSection = ({
  summary,
  isLoading,
}: {
  summary: AnalyticsSummary | undefined;
  isLoading: boolean;
}) => {
  const statusCounts = summary?.statusCounts ?? {
    open: { total: 0, low: 0, medium: 0, high: 0, critical: 0 },
    inProgress: { total: 0, low: 0, medium: 0, high: 0, critical: 0 },
    resolved: { total: 0, low: 0, medium: 0, high: 0, critical: 0 },
    closed: { total: 0, low: 0, medium: 0, high: 0, critical: 0 },
  };

  // Resolved, or closed after being resolved - closes without a resolution
  // (duplicates, invalid, ...) don't count
  const totalFiltered = summary?.totalFiltered ?? 0;
  const resolutionRate =
    totalFiltered === 0
      ? null
      : (statusCounts.resolved.total +
          statusCounts.closed.total -
          (summary?.closedWithoutResolutionCount ?? 0)) /
        totalFiltered;

  return (
    <div className="mb-4 flex flex-col gap-6">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {isLoading
          ? "Calculating..."
          : `${totalFiltered} issues match the current filters`}
      </p>

      <StatusCards statusCounts={statusCounts} isLoading={isLoading} />

      <TimingCards
        avgFirstResponseSeconds={summary?.avgFirstResponseSeconds ?? null}
        avgResolutionSeconds={summary?.avgResolutionSeconds ?? null}
        avgStaleSeconds={summary?.avgStaleSeconds ?? null}
        resolutionRate={resolutionRate}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <IssuesTrendChart
          monthlyTrend={summary?.monthlyTrend ?? []}
          isLoading={isLoading}
          className="lg:col-span-3"
        />
        <PriorityStatusChart
          statusCounts={statusCounts}
          isLoading={isLoading}
          className="lg:col-span-2"
        />
      </div>

      <ActivityCards
        reopenedCount={summary?.reopenedCount ?? 0}
        escalatedCount={summary?.escalatedCount ?? 0}
        collaboratedCount={summary?.collaboratedCount ?? 0}
        closedWithoutResolutionCount={
          summary?.closedWithoutResolutionCount ?? 0
        }
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BacklogAgeingChart
          backlogAgeing={summary?.backlogAgeing ?? []}
          isLoading={isLoading}
        />
        <AgentWorkloadChart
          agentBreakdown={summary?.agentBreakdown ?? []}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IssueTypeBreakdownCard
          issueTypeBreakdown={summary?.issueTypeBreakdown ?? []}
          isLoading={isLoading}
        />
        <DepartmentBreakdownCard
          departmentBreakdown={summary?.departmentBreakdown ?? []}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <IssueTypeTimingCard
          issueTypeBreakdown={summary?.issueTypeBreakdown ?? []}
          isLoading={isLoading}
        />
        <AgentTimingCard
          agentBreakdown={summary?.agentBreakdown ?? []}
          isLoading={isLoading}
        />
        <DepartmentTimingCard
          departmentBreakdown={summary?.departmentBreakdown ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default SummaryCardsSection;
