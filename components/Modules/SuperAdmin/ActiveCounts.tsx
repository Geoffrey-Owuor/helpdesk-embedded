"use client";

import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { UserCountBreakdown } from "@/public/assets";
import { Activity, UserRoundMinus, LucideIcon } from "lucide-react";

interface breakdownObject {
  label: string;
  count: number;
  icon: LucideIcon;
  text: string;
}

type ActiveCountsProps = {
  cardLoading: boolean;
  breakdown: UserCountBreakdown;
};
const ActiveCounts = ({ cardLoading, breakdown }: ActiveCountsProps) => {
  const BreakDownCountsArray: breakdownObject[] = [
    {
      label: "Active",
      count: breakdown.active,
      icon: Activity,
      text: "text-green-600 dark:text-green-500",
    },
    {
      label: "Inactive",
      count: breakdown.inactive,
      icon: UserRoundMinus,
      text: "text-red-600 dark:text-red-500",
    },
  ];
  return (
    <div className="mt-4 flex items-center gap-4">
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
          {BreakDownCountsArray.map(({ label, count, icon: Icon, text }) => (
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

export default ActiveCounts;
