import { LucideIcon } from "lucide-react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";

interface StatTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  isLoading: boolean;
}

// Shared stat-tile look used across StatusCards/PriorityCards/TimingCards/
// ActivityCards, following the same visual pattern as IssuesCards.tsx.
const StatTile = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  isLoading,
}: StatTileProps) => (
  <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-4 shadow-xs transition-all duration-200 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
    <span className="mb-1 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
      {label}
    </span>
    <div className="flex items-center justify-between">
      <h3 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
        {isLoading ? <SkeletonBox className="h-9 w-9 rounded-full" /> : value}
      </h3>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border ${bgColor} ${borderColor} ${color}`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
    </div>
  </div>
);

export default StatTile;
