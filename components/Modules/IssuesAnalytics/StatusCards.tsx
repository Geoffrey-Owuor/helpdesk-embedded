import { Clock, Activity, BookmarkCheck, CheckCircle2 } from "lucide-react";
import { DataCounts } from "@/public/assets";
import StatTile from "./StatTile";

const StatusCards = ({
  statusCounts,
  isLoading,
}: {
  statusCounts: DataCounts;
  isLoading: boolean;
}) => {
  const items = [
    {
      label: "Open",
      count: statusCounts.open.total,
      breakdown: statusCounts.open,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      borderColor: "border-amber-200 dark:border-amber-800/50",
    },
    {
      label: "In Progress",
      count: statusCounts.inProgress.total,
      breakdown: statusCounts.inProgress,
      icon: Activity,
      color: "text-indigo-600 dark:text-indigo-500",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      borderColor: "border-indigo-200 dark:border-indigo-800/50",
    },
    {
      label: "Resolved",
      count: statusCounts.resolved.total,
      breakdown: statusCounts.resolved,
      icon: BookmarkCheck,
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      borderColor: "border-emerald-200 dark:border-emerald-800/50",
    },
    {
      label: "Closed",
      count: statusCounts.closed.total,
      breakdown: statusCounts.closed,
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800/50",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatTile
          key={item.label}
          label={item.label}
          value={item.count}
          icon={item.icon}
          color={item.color}
          bgColor={item.bgColor}
          borderColor={item.borderColor}
          isLoading={isLoading}
          breakdown={item.breakdown}
        />
      ))}
    </section>
  );
};

export default StatusCards;
