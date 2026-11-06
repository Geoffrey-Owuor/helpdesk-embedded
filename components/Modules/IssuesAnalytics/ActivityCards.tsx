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
    },
    {
      label: "Escalated",
      count: escalatedCount,
      icon: GitMerge,
    },
    {
      label: "Collaborated",
      count: collaboratedCount,
      icon: UsersRound,
    },
    {
      label: "Closed Unresolved",
      count: closedWithoutResolutionCount,
      icon: CircleSlash,
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
          isLoading={isLoading}
        />
      ))}
    </section>
  );
};

export default ActivityCards;
