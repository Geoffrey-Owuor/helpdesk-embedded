import { Tags } from "lucide-react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { IssueTypeBreakdownEntry } from "./types";

const IssueTypeBreakdownCard = ({
  issueTypeBreakdown,
  isLoading,
}: {
  issueTypeBreakdown: IssueTypeBreakdownEntry[];
  isLoading: boolean;
}) => {
  const maxCount = issueTypeBreakdown[0]?.count || 1;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="flex items-center gap-2 px-6 py-4 text-lg font-semibold text-neutral-900 dark:text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <Tags className="h-4 w-4" />
        </div>
        Issue Types Breakdown
      </h2>

      {isLoading ? (
        <div className="flex flex-col gap-3 px-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : issueTypeBreakdown.length === 0 ? (
        <p className="px-6 text-sm text-neutral-400 italic dark:text-neutral-500">
          No issue types match the current filters.
        </p>
      ) : (
        <div className="default-scrollbar flex max-h-72 flex-col gap-3 overflow-y-auto px-6 pb-6">
          {issueTypeBreakdown.map(({ issueType, count }) => (
            <div key={issueType} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span
                  className="max-w-60 truncate font-medium text-neutral-700 dark:text-neutral-300"
                  title={issueType}
                >
                  {issueType}
                </span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {count}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueTypeBreakdownCard;
