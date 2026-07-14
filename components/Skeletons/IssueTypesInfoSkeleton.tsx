import SkeletonBox from "./SkeletonBox";

const IssueTypesInfoSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* 1. Header & Button Skeletons */}
      <div className="mb-4 space-y-2">
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-3 w-64" />
      </div>

      {/* "Add Issue Type" Button Skeleton */}
      <SkeletonBox className="mb-4 h-9 w-36 rounded-xl" />

      {/* 2. Grid of Issue Type Cards */}
      <div className="grid gap-3">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40"
          >
            <div className="flex justify-between">
              {/* Left Section Skeleton */}
              <div className="flex flex-col gap-4">
                {/* Issue Type Header */}
                <div className="flex items-center gap-2">
                  <SkeletonBox className="h-9 w-9 rounded-lg" />
                  <SkeletonBox className="h-4 w-36" />
                </div>

                {/* Agent Info Row */}
                <div className="flex items-center gap-3">
                  {/* Avatar Circle */}
                  <SkeletonBox className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    {/* Agent Name */}
                    <SkeletonBox className="h-3 w-24" />
                    {/* Agent Email */}
                    <SkeletonBox className="h-2 w-32" />
                  </div>
                </div>
              </div>

              {/* Right Section: Edit Button circle */}
              <div className="flex items-start">
                <SkeletonBox className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueTypesInfoSkeleton;
