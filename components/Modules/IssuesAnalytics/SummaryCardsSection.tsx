import { AnalyticsSummary } from "./types";
import StatusCards from "./StatusCards";
import PriorityCards from "./PriorityCards";
import TimingCards from "./TimingCards";
import ActivityCards from "./ActivityCards";
import IssueTypeBreakdownCard from "./IssueTypeBreakdownCard";
import AgentBreakdownCard from "./AgentBreakdownCard";
import DepartmentBreakdownCard from "./DepartmentBreakdownCard";

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

  return (
    <div className="mb-4 flex flex-col gap-6">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {isLoading
          ? "Calculating..."
          : `${summary?.totalFiltered ?? 0} issues match the current filters`}
      </p>

      <StatusCards statusCounts={statusCounts} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <TimingCards
            avgResolutionSeconds={summary?.avgResolutionSeconds ?? null}
            avgStaleSeconds={summary?.avgStaleSeconds ?? null}
            isLoading={isLoading}
          />
          <ActivityCards
            reopenedCount={summary?.reopenedCount ?? 0}
            escalatedCount={summary?.escalatedCount ?? 0}
            collaboratedCount={summary?.collaboratedCount ?? 0}
            isLoading={isLoading}
          />
        </div>
        <PriorityCards statusCounts={statusCounts} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <IssueTypeBreakdownCard
          issueTypeBreakdown={summary?.issueTypeBreakdown ?? []}
          isLoading={isLoading}
        />
        <AgentBreakdownCard
          agentBreakdown={summary?.agentBreakdown ?? []}
          isLoading={isLoading}
        />
        <DepartmentBreakdownCard
          departmentBreakdown={summary?.departmentBreakdown ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default SummaryCardsSection;
