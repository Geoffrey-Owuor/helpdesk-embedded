import SkeletonBox from "./SkeletonBox";

// Reuse widths for table
const colWidths = {
  ref: "w-24 shrink-0",
  status: "w-24 shrink-0",
  type: "w-26 shrink-0",
  submitter: "w-32 shrink-0",
  date: "w-32 shrink-0",
  dept: "w-32 shrink-0",
  agent: "w-32 shrink-0",
  title: "w-50 shrink-0",
  desc: "w-80 shrink-0",
};

const IssuesDataSkeleton = ({ isTableView }: { isTableView: boolean }) => {
  return (
    <div>
      {isTableView ? (
        /* --- Table View Skeleton --- */
        <div className="w-full overflow-x-auto rounded-xl bg-gray-100/50 p-4 dark:bg-neutral-900/50">
          <div className="min-w-max space-y-2">
            <div className="flex items-center gap-4 px-4 pb-2">
              {Object.values(colWidths).map((width, i) => (
                <SkeletonBox key={i} className={`h-3 ${width}`} />
              ))}
            </div>

            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4 shadow-sm dark:bg-neutral-800/50"
              >
                <SkeletonBox className={`h-5 ${colWidths.ref}`} />
                <div className={colWidths.status}>
                  <SkeletonBox className="h-6 w-20 rounded-full" />
                </div>
                <SkeletonBox className={`h-4 ${colWidths.type}`} />
                <SkeletonBox className={`h-4 ${colWidths.submitter}`} />
                <SkeletonBox className={`h-4 ${colWidths.date}`} />
                <SkeletonBox className={`h-4 ${colWidths.dept}`} />
                <SkeletonBox className={`h-4 ${colWidths.dept}`} />
                <SkeletonBox className={`h-4 ${colWidths.agent}`} />
                <SkeletonBox className={`h-5 ${colWidths.title}`} />
                <SkeletonBox className={`h-4 ${colWidths.desc}`} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* --- Card View Skeleton --- */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              {/* Header Skeleton */}
              <div className="mb-4 flex items-start justify-between">
                <SkeletonBox className="h-4 w-20 rounded" />
                <SkeletonBox className="h-6 w-24 rounded-full" />
              </div>

              {/* Body Skeleton */}
              <div className="mb-6 space-y-3">
                <SkeletonBox className="h-5 w-3/4 rounded" />
                <div className="space-y-2">
                  <SkeletonBox className="h-3 w-full rounded" />
                  <SkeletonBox className="h-3 w-5/6 rounded" />
                </div>
              </div>

              {/* Footer Skeleton */}
              <div className="space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-2">
                  <SkeletonBox className="h-3 w-16 rounded" />
                  <SkeletonBox className="h-3 w-20 rounded" />
                </div>
                <div className="flex flex-col gap-3">
                  <SkeletonBox className="h-4 w-32 rounded" />
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-800/50 dark:bg-neutral-800/40">
                    <SkeletonBox className="h-6 w-24 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Pagination Skeleton --- */}
      <div className="mt-6 flex items-center justify-between py-3">
        <SkeletonBox className="hidden h-4 w-48 lg:block" />
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="h-8 w-8 rounded-lg" />
          ))}
        </div>
        <div className="hidden justify-end lg:flex lg:w-48">
          <SkeletonBox className="h-8 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default IssuesDataSkeleton;
