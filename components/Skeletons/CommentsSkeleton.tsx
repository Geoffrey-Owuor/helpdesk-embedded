import SkeletonBox from "@/components/Skeletons/SkeletonBox";

const CommentsSkeleton = () => {
  // Simulate 3 comments of varying lengths to look natural
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((index) => (
        <div key={index} className="flex items-start gap-4">
          {/* Avatar Skeleton */}
          <SkeletonBox className="h-8 w-8 shrink-0 rounded-full" />

          {/* Comment Bubble Skeleton */}
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-none border border-neutral-100 bg-neutral-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
            {/* Header: Name and Date */}
            <div className="mb-3 flex items-center justify-between gap-2">
              {/* Name Placeholder */}
              <SkeletonBox className="h-4 w-32 rounded-md" />

              {/* Date Placeholder (Right aligned) */}
              <SkeletonBox className="h-3 w-20 rounded-md opacity-60" />
            </div>

            {/* Body Text Lines */}
            <div className="space-y-2">
              <SkeletonBox className="h-3 w-full rounded-md" />
              <SkeletonBox className="h-3 w-11/12 rounded-md" />
              {/* Add a third line to the second item to vary visual height */}
              {index === 2 && <SkeletonBox className="h-3 w-2/3 rounded-md" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentsSkeleton;
