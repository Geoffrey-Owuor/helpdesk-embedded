import SkeletonBox from "./SkeletonBox";

export const IssueAgentsSkeleton = () => {
  // We render 3 skeleton cards to simulate a realistic loading state
  return (
    <div className="flex flex-wrap items-center gap-3">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white py-1.5 pr-4 pl-1.5 dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Avatar Circle Skeleton */}
          <SkeletonBox className="h-8 w-8 shrink-0 rounded-full" />

          {/* Text Stack Skeleton */}
          <div className="flex flex-col gap-1.5">
            {/* Name Line */}
            <SkeletonBox className="h-3.5 w-24 rounded-md" />

            {/* Email Line (slightly narrower and smaller) */}
            <SkeletonBox className="h-2.5 w-32 rounded-md opacity-60" />
          </div>

          {/* Simulate 'Best Fit' Badge on the first item only for realism */}
          {index === 1 && (
            <div className="ml-2 border-l border-neutral-200 pl-3 dark:border-neutral-800">
              <SkeletonBox className="h-3 w-12 rounded-md" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
