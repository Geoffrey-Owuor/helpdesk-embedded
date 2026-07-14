import SkeletonBox from "./SkeletonBox";

const AgentsInfoSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* 1. Header Skeleton */}
      <div className="mb-4 space-y-2">
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-3 w-64" />
      </div>

      {/* 2. Grid of Agent Cards */}
      <div className="grid gap-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40"
          >
            {/* Header: Avatar & Info Block */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar Circle */}
                <SkeletonBox className="h-9 w-9 rounded-full" />

                <div className="space-y-2">
                  {/* Name */}
                  <SkeletonBox className="h-4 w-24" />
                  {/* Email */}
                  <SkeletonBox className="h-3 w-40" />
                </div>
              </div>

              {/* Check Badge Placeholder */}
              <SkeletonBox className="h-4 w-4 rounded-md opacity-20" />
            </div>

            {/* Skills Section */}
            <div className="space-y-3">
              {/* Section Label */}
              <SkeletonBox className="h-2 w-20" />

              {/* Tag Cloud Placeholder */}
              <div className="flex flex-wrap gap-1.5">
                <SkeletonBox className="h-5 w-16 rounded-md" />
                <SkeletonBox className="h-5 w-24 rounded-md" />
                <SkeletonBox className="h-5 w-20 rounded-md" />
                <SkeletonBox className="h-5 w-12 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsInfoSkeleton;
