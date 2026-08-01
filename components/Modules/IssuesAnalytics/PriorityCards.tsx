import { Gauge } from "lucide-react";
import { DataCounts } from "@/public/assets";
import BreakdownListCard from "./BreakdownListCard";

const PriorityCards = ({
  statusCounts,
  isLoading,
}: {
  statusCounts: DataCounts;
  isLoading: boolean;
}) => {
  const buckets = [
    statusCounts.open,
    statusCounts.inProgress,
    statusCounts.resolved,
    statusCounts.closed,
  ];
  const sum = (key: "low" | "medium" | "high" | "critical") =>
    buckets.reduce((total, bucket) => total + bucket[key], 0);

  const entries = [
    { label: "Low Priority", count: sum("low") },
    { label: "Medium Priority", count: sum("medium") },
    { label: "High Priority", count: sum("high") },
    { label: "Critical Priority", count: sum("critical") },
  ];

  return (
    <BreakdownListCard
      title="Priority Breakdown"
      icon={Gauge}
      iconColor="text-violet-600 dark:text-violet-400"
      iconBgColor="bg-violet-50 dark:bg-violet-900/20"
      entries={entries}
      isLoading={isLoading}
      emptyMessage="No priority data matches the current filters."
    />
  );
};

export default PriorityCards;
