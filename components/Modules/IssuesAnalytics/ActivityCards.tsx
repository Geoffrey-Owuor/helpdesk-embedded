import { UndoDot, GitMerge, UsersRound, CircleSlash } from "lucide-react";
import StatTile from "./StatTile";

const ActivityCards = ({
  reopenedCount,
  escalatedCount,
  collaboratedCount,
  closedWithoutResolutionCount,
  isLoading,
}: {
  reopenedCount: number;
  escalatedCount: number;
  collaboratedCount: number;
  closedWithoutResolutionCount: number;
  isLoading: boolean;
}) => {
  const items = [
    {
      label: "Reopened",
      count: reopenedCount,
      icon: UndoDot,
      color: "text-fuchsia-600 dark:text-fuchsia-400",
      bgColor: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
      borderColor: "border-fuchsia-200 dark:border-fuchsia-800/50",
    },
    {
      label: "Escalated",
      count: escalatedCount,
      icon: GitMerge,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      borderColor: "border-red-200 dark:border-red-800/50",
    },
    {
      label: "Collaborated",
      count: collaboratedCount,
      icon: UsersRound,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
      borderColor: "border-cyan-200 dark:border-cyan-800/50",
    },
    {
      label: "Closed Unresolved",
      count: closedWithoutResolutionCount,
      icon: CircleSlash,
      color: "text-neutral-600 dark:text-neutral-400",
      bgColor: "bg-neutral-100 dark:bg-neutral-800/60",
      borderColor: "border-neutral-200 dark:border-neutral-700/50",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

export default ActivityCards;
