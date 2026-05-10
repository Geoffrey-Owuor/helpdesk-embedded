import SkeletonBox from "./SkeletonBox";

const IssueAttachmentsSkeleton = () => {
  // Array of 3 to mock a standard row of attachment cards
  const skeletonItems = Array.from({ length: 2 });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header Skeleton */}
      <div className="mb-4 flex items-center gap-2">
        {/* Icon Circle */}
        <SkeletonBox className="h-8 w-8 rounded-full!" />
        {/* Title */}
        <SkeletonBox className="h-6 w-32" />
        {/* Number Badge */}
        <SkeletonBox className="h-5 w-8 rounded-full!" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {skeletonItems.map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3 dark:border-neutral-800/50"
          >
            {/* File Icon Thumbnail */}
            <SkeletonBox className="h-10 w-10 shrink-0 rounded-lg!" />

            {/* File Info Lines */}
            <div className="flex flex-1 flex-col gap-2">
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueAttachmentsSkeleton;
