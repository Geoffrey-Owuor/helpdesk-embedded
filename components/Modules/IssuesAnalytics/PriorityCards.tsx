import { ArrowDown, MoveHorizontal, ArrowUp, Zap } from "lucide-react";
import { DataCounts } from "@/public/assets";
import StatTile from "./StatTile";

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

  const items = [
    {
      label: "Low Priority",
      count: sum("low"),
      icon: ArrowDown,
      color: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-100 dark:bg-slate-900/30",
      borderColor: "border-slate-200 dark:border-slate-800/50",
    },
    {
      label: "Medium Priority",
      count: sum("medium"),
      icon: MoveHorizontal,
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-100 dark:bg-sky-900/30",
      borderColor: "border-sky-200 dark:border-sky-800/50",
    },
    {
      label: "High Priority",
      count: sum("high"),
      icon: ArrowUp,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-100 dark:bg-violet-900/30",
      borderColor: "border-violet-200 dark:border-violet-800/50",
    },
    {
      label: "Critical Priority",
      count: sum("critical"),
      icon: Zap,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
      borderColor: "border-rose-200 dark:border-rose-800/50",
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
        />
      ))}
    </section>
  );
};

export default PriorityCards;
