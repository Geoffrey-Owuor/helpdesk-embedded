import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { PriorityBreakdown } from "@/lib/assets";
import { indicatorMuted, priorityIndicators } from "@/lib/indicatorStyles";

interface PriorityObject {
  label: string;
  count: number;
}

type PriorityCountsProps = {
  cardLoading: boolean;
  priorityCounts: PriorityBreakdown;
};

const PriorityCounts = ({
  cardLoading,
  priorityCounts,
}: PriorityCountsProps) => {
  const PriorityCountsArray: PriorityObject[] = [
    {
      label: "Low",
      count: priorityCounts.low,
    },
    {
      label: "Medium",
      count: priorityCounts.medium,
    },
    {
      label: "High",
      count: priorityCounts.high,
    },
    {
      label: "Critical",
      count: priorityCounts.critical,
    },
  ];

  return (
    <div className="mt-4 flex items-center gap-6">
      {cardLoading ? (
        <>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <SkeletonBox className="h-4 w-3 rounded-sm" />
              <SkeletonBox className="h-4 w-4 rounded-sm" />
            </div>
          ))}
        </>
      ) : (
        <>
          {PriorityCountsArray.map(({ label, count }) => {
            const { icon: Icon, color } = priorityIndicators[label];
            return (
              <div
                key={label}
                title={`${label} priority`}
                className="flex items-center gap-1"
              >
                <Icon className={`h-3 w-3 shrink-0 ${color}`} strokeWidth={2} />
                <span
                  className={`text-xs font-medium tabular-nums ${indicatorMuted}`}
                >
                  {count > 500 ? "500+" : count}
                </span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default PriorityCounts;
