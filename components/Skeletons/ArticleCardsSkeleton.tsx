import SkeletonBox from "./SkeletonBox";

const ArticleCardsSkeleton = () => {
  return (
    <div>
      {/* Small paragraph */}
      <SkeletonBox className="mb-3 h-5 w-50 rounded-full!" />
      {/* Search input skeleton */}
      <SkeletonBox className="mb-10 h-11 w-80 rounded-full!" />

      {/* Card Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <article
            key={index}
            className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50"
          >
            {/* Title skeleton */}
            <SkeletonBox className="mb-3 h-7 w-3/4" />

            {/* Meta information skeleton */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <SkeletonBox className="h-4 w-24" />
              <span className="text-neutral-400">•</span>
              <SkeletonBox className="h-4 w-20" />
              <span className="text-neutral-400">•</span>
              <SkeletonBox className="h-4 w-16" />
            </div>

            {/* Content preview skeleton */}
            <div className="mb-6 grow space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-2/3" />
            </div>

            {/* Read more button skeleton and article type */}
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-4 w-12" />
              <SkeletonBox className="h-5 w-24" />
            </div>
          </article>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-10 flex items-center justify-center gap-2">
        <SkeletonBox className="h-9 w-9 rounded-full!" />
        {[...Array(3)].map((_, i) => (
          <SkeletonBox key={i} className="h-9 w-9 rounded-full!" />
        ))}
        <SkeletonBox className="h-9 w-9 rounded-full!" />
      </div>
    </div>
  );
};

export default ArticleCardsSkeleton;
