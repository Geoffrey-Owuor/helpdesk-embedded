import { Clock, Activity, BookmarkCheck, CheckCircle2 } from "lucide-react";
import { DataCounts } from "@/lib/assets";
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
    },
    {
      label: "In Progress",
      count: statusCounts.inProgress.total,
      breakdown: statusCounts.inProgress,
      icon: Activity,
    },
    {
      label: "Resolved",
      count: statusCounts.resolved.total,
      breakdown: statusCounts.resolved,
      icon: BookmarkCheck,
    },
    {
      label: "Closed",
      count: statusCounts.closed.total,
      breakdown: statusCounts.closed,
      icon: CheckCircle2,
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
          breakdown={item.breakdown}
        />
      ))}
    </section>
  );
};

export default StatusCards;
