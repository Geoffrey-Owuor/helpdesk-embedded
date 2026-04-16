import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { PriorityBreakdown } from "@/public/assets";
import {
  ArrowDown,
  ArrowUp,
  LucideIcon,
  MoveHorizontal,
  Zap,
} from "lucide-react";

interface PriorityObject {
  label: string;
  count: number;
  icon: LucideIcon;
  text: string;
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
      icon: ArrowDown,
      text: "text-violet-700 dark:text-violet-400",
    },
    {
      label: "Medium",
      count: priorityCounts.medium,
      icon: MoveHorizontal,
      text: "text-sky-700 dark:text-sky-400",
    },
    {
      label: "High",
      count: priorityCounts.high,
      icon: ArrowUp,
      text: "text-yellow-700 dark:text-yellow-400",
    },
    {
      label: "Critical",
      count: priorityCounts.critical,
      icon: Zap,
      text: "text-rose-700 dark:text-rose-400",
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
          {PriorityCountsArray.map(({ label, count, icon: Icon, text }) => (
            <div
              key={label}
              title={`${label} priority`}
              className="flex items-center gap-1"
            >
              <Icon className={`h-3 w-3 shrink-0 ${text}`} strokeWidth={2} />
              <span className={`text-xs font-medium tabular-nums ${text}`}>
                {count}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PriorityCounts;
